# Supabase Edge Functions — Notificaciones Push Reales

Guía completa para integrar FCM + Supabase Edge Functions + Database Webhooks.

---

## Requisitos previos

- [FIREBASE-SETUP.md](./FIREBASE-SETUP.md) completado hasta el paso 6 inclusive
- Firebase project creado (`psicologiaybienestar`)
- `google-services.json` en `android/app/`
- `@capacitor/push-notifications` instalado
- Proyecto corriendo en Supabase
- Node.js 18+ instalado localmente

---

## Paso 1: Generar clave privada de Firebase Admin SDK

Este paso es obligatorio para que las Edge Functions puedan enviar notificaciones usando Firebase.

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona el proyecto `psicologiaybienestar`
3. Ve a ⚙️ **Configuración del proyecto** → **Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada**
5. Confirma con **Generar clave**
6. Se descargará un archivo JSON con la clave de servicio

**Guardar la clave:**

Copia el archivo descargado en la raíz del proyecto:

```
service-account-key.json
```

**IMPORTANTE: Este archivo NUNCA debe subirse a Git.**

---

## Paso 2: Actualizar .gitignore

El archivo `.gitignore` del proyecto ya debe excluir el service account key.

Agrega esta línea si no existe:

```gitignore
service-account-key.json
```

**Ya está agregado**, verifica que la línea esté presente en `.gitignore`.

---

## Paso 3: Inicializar Edge Functions localmente

Edge Functions en Supabase son funciones TypeScript que corren en Deno.

```bash
# Crear carpeta de funciones si no existe
mkdir -p supabase/functions

# Inicializar proyecto npm dentro de functions
cd supabase/functions
npm init -y
npm install firebase-admin

# Volver a la raíz del proyecto
cd ../..
```

Estructura resultante:

```
supabase/functions/
├── package.json
├── node_modules/
└── notify-event/
    └── index.ts
├── notify-appointment/
    └── index.ts
```

**Importante:** la carpeta `supabase/functions/node_modules/` no debe subirse a Git (agregar al `.gitignore` si es necesario — Supabase ya ignora `node_modules` por defecto).

---

## Paso 4: Crear Edge Function — notify-event

Crea `supabase/functions/notify-event/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import admin from 'npm:firebase-admin@11'

// Inicializar Firebase Admin con la clave de servicio
const serviceAccount = JSON.parse(
  Deno.readTextFileSync(new URL('../../../service-account-key.json', import.meta.url))
)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const body = await req.json()
    const { type, table, record } = body

    console.log(`📩 Webhook recibido: ${type} en ${table}`)

    // Obtener todos los tokens push activos
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)

    if (!tokens || tokens.length === 0) {
      console.log('⚠️ No hay tokens registrados')
      return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
    }

    // Construir mensaje según el tipo de operación
    let title = ''
    let body = ''

    if (table === 'eventos') {
      const eventoTitle = record.titulo || 'Nuevo evento'
      if (type === 'INSERT') {
        title = '📅 Nuevo evento'
        body = `${eventoTitle} — ${record.fecha_inicio ? new Date(record.fecha_inicio).toLocaleDateString('es-CO') : 'Próximamente'}`
      } else if (type === 'UPDATE') {
        if (record.estado === 'cancelado') {
          title = '❌ Evento cancelado'
          body = `${eventoTitle} ha sido cancelado`
        } else if (record.estado === 'pospuesto') {
          title = '🔄 Evento pospuesto'
          body = `${eventoTitle} ha sido reprogramado`
        } else {
          title = '📅 Evento actualizado'
          body = `${eventoTitle} — Revisa los cambios`
        }
      }
    }

    // Enviar notificaciones
    const messages = tokens.map(t => ({
      token: t.token,
      notification: { title, body },
      android: {
        notification: {
          channelId: 'eventos',
          priority: 'high',
        },
      },
    }))

    const sendResults = await Promise.allSettled(
      messages.map(msg => admin.messaging().send(msg))
    )

    const sent = sendResults.filter(r => r.status === 'fulfilled').length
    const failed = sendResults.filter(r => r.status === 'rejected').length

    console.log(`✅ Notificaciones enviadas: ${sent}, fallidas: ${failed}`)

    return new Response(JSON.stringify({ sent, failed }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

---

## Paso 5: Crear Edge Function — notify-appointment

Crea `supabase/functions/notify-appointment/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import admin from 'npm:firebase-admin@11'

const serviceAccount = JSON.parse(
  Deno.readTextFileSync(new URL('../../../service-account-key.json', import.meta.url))
)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const body = await req.json()
    const { type, table, record } = body

    console.log(`📩 Webhook citas: ${type} en ${table}`)

    // Obtener solo los tokens que pertenecen a este usuario (por email)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
    }

    let title = ''
    let messageBody = ''
    const userName = record.user_name || ''

    if (table === 'appointments') {
      switch (record.status) {
        case 'pendiente':
          title = '📋 Solicitud recibida'
          messageBody = `${userName}, tu solicitud de cita fue recibida. Te contactaremos pronto.`
          break
        case 'confirmada':
          title = '✅ Cita confirmada'
          messageBody = `${userName}, tu cita del ${record.requested_date} a las ${record.requested_time} fue confirmada.`
          break
        case 'cancelada':
          title = '❌ Cita cancelada'
          messageBody = `${userName}, tu cita del ${record.requested_date} ha sido cancelada.`
          break
        case 'completada':
          title = '🎉 Cita completada'
          messageBody = `${userName}, gracias por asistir a tu cita. Esperamos que te haya sido útil.`
          break
        case 'reagendada':
          title = '🔄 Cita reagendada'
          messageBody = `${userName}, tu cita fue reagendada para el ${record.requested_date} a las ${record.requested_time}.`
          break
      }
    }

    const messages = tokens.map(t => ({
      token: t.token,
      notification: { title, body: messageBody },
      android: {
        notification: {
          channelId: 'citas',
          priority: 'high',
        },
      },
    }))

    const sendResults = await Promise.allSettled(
      messages.map(msg => admin.messaging().send(msg))
    )

    const sent = sendResults.filter(r => r.status === 'fulfilled').length
    const failed = sendResults.filter(r => r.status === 'rejected').length

    console.log(`✅ Notificaciones de cita: ${sent} enviadas, ${failed} fallidas`)
    return new Response(JSON.stringify({ sent, failed }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

---

## Paso 6: Desplegar Edge Functions en Supabase

### 6.1 Subir la clave de servicio a Supabase

Las Edge Functions en la nube NO pueden leer archivos locales. La clave debe
pasarse como variable de entorno.

```bash
# Desde la raíz del proyecto
npx supabase secrets set FIREBASE_SERVICE_ACCOUNT="$(cat service-account-key.json | tr -d '\n')"
```

### 6.2 Desplegar las funciones

```bash
npx supabase functions deploy notify-event --project-ref nwmewlnwcmsdswmxynvj
npx supabase functions deploy notify-appointment --project-ref nwmewlnwcmsdswmxynvj
```

> `project-ref` se obtiene de la URL del Dashboard de Supabase:
> `https://supabase.com/dashboard/project/nwmewlnwcmsdswmxynvj`

### 6.3 Obtener la URL de cada función

```bash
npx supabase functions list --project-ref nwmewlnwcmsdswmxynvj
```

Las URLs serán similares a:

```
https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-event
https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-appointment
```

Guarda estas URLs para el siguiente paso.

---

## Paso 7: Configurar Database Webhooks

Los webhooks hacen que Supabase llame a las Edge Functions automáticamente
cuando ocurren cambios en las tablas.

### Webhook para Eventos

1. Ve a **Supabase Dashboard** → **Database** → **Webhooks**
2. Haz clic en **Create a webhook**
3. Configuración:

| Campo | Valor |
|---|---|
| **Name** | `notify-event-webhook` |
| **Table** | `eventos` |
| **Events** | `INSERT`, `UPDATE` |
| **Type** | `HTTP Request` |
| **HTTP Method** | `POST` |
| **URL** | `https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-event` |
| **Headers** | Content-Type: `application/json` |

4. Haz clic en **Create**

### Webhook para Citas

1. Ve a **Supabase Dashboard** → **Database** → **Webhooks**
2. Haz clic en **Create a webhook**
3. Configuración:

| Campo | Valor |
|---|---|
| **Name** | `notify-appointment-webhook` |
| **Table** | `appointments` |
| **Events** | `INSERT`, `UPDATE` |
| **Type** | `HTTP Request` |
| **HTTP Method** | `POST` |
| **URL** | `https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-appointment` |
| **Headers** | Content-Type: `application/json` |

4. Haz clic en **Create**

---

## Paso 8: Probar el flujo completo

### 8.1 Probar función notify-event

```bash
curl -X POST https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-event \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "eventos",
    "record": {
      "titulo": "Taller de Mindfulness",
      "fecha_inicio": "2026-06-15T10:00:00Z",
      "estado": "publicado"
    }
  }'
```

### 8.2 Probar función notify-appointment

```bash
curl -X POST https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "type": "UPDATE",
    "table": "appointments",
    "record": {
      "user_name": "María",
      "requested_date": "2026-06-10",
      "requested_time": "15:00",
      "status": "confirmada"
    }
  }'
```

### 8.3 Verificar en Android Studio

1. Abre la app en Android Studio
2. Ejecuta en un emulador o dispositivo físico
3. Concede el permiso de notificaciones
4. Desde el panel admin, cambia el estado de una cita a "confirmada"
5. Deberías recibir la notificación push en el dispositivo

---

## Paso 9: Verificar logs

Para depurar problemas:

```bash
# Ver logs de la Edge Function
npx supabase functions logs notify-event --project-ref nwmewlnwcmsdswmxynvj
npx supabase functions logs notify-appointment --project-ref nwmewlnwcmsdswmxynvj
```

---

## Solución de problemas

| Problema | Solución |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` no configurada | Ejecuta `npx supabase secrets set FIREBASE_SERVICE_ACCOUNT="$(cat service-account-key.json)"` |
| Webhook no dispara | Verifica en Supabase Dashboard → Database → Webhooks que esté **Enabled** |
| Edge Function devuelve 404 | La URL del webhook debe apuntar a `{project-ref}.functions.supabase.co` |
| Token FCM no registrado | Abre la app en Android Studio, ve a Configuración → activa notificaciones |
| Error `MessagingClientError` | La service account key no es válida o expiró; genera una nueva en Firebase Console |
| Notificaciones no llegan en Android 13+ | El usuario debe aceptar el diálogo de permiso `POST_NOTIFICATIONS` |

---

## Estructura final de archivos

```
raíz-del-proyecto/
├── service-account-key.json       # NO SUBIR A GIT (ya en .gitignore)
├── FIREBASE-SETUP.md              # Completado hasta paso 6
├── SUPABASE-EDGE-FUNCTIONS.md     # Este archivo
├── supabase/
│   └── functions/
│       ├── package.json
│       ├── node_modules/          # Ignorado por Git
│       ├── notify-event/
│       │   └── index.ts
│       └── notify-appointment/
│           └── index.ts
└── android/
    └── app/
        └── google-services.json   # NO SUBIR A GIT
```

---

## Notas de seguridad

- `service-account-key.json` contiene credenciales con permisos elevados de Firebase
- Está en `.gitignore` para evitar subirlo accidentalmente
- En Supabase, la clave se pasa como variable de entorno (`FIREBASE_SERVICE_ACCOUNT`), no como archivo
- Los webhooks usan `SUPABASE_SERVICE_ROLE_KEY` que tiene acceso completo a la base de datos
- Nunca compartas estos archivos o variables de entorno
