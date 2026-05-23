# Firebase Setup — Notificaciones Push

## Requisitos

- Cuenta de Google
- Proyecto en Firebase Console
- Android Studio

## Paso 1: Crear proyecto Firebase

1. Ve a https://console.firebase.google.com
2. Haz clic en **Crear proyecto**
3. Nombre: `psicologiaybienestar`
4. Deshabilita **Google Analytics** (no necesario)
5. Haz clic en **Crear proyecto**

## Paso 2: Registrar app Android

1. En el Dashboard del proyecto, haz clic en el ícono **Android**
2. **Android package name**: `com.psicologiaybienestar.app` (debe coincidir con el `appId` en `capacitor.config.ts`)
3. **App nickname**: `Psicologia y Bienestar Android`
4. Haz clic en **Registrar app**
5. Descarga el archivo `google-services.json`
6. **No ejecutes los pasos de SDK** (Capacitor lo manejará automáticamente)

## Paso 3: Ubicar google-services.json

Copia el archivo descargado en:

```
android/app/google-services.json
```

Este archivo NO debe subirse a Git (está en `.gitignore` por defecto).

## Paso 4: Instalar dependencias

```bash
npm install @capacitor/push-notifications @capacitor/preferences
npx cap sync
```

## Paso 5: Verificar AndroidManifest.xml

El archivo `android/app/src/main/AndroidManifest.xml` debe contener estos permisos (ya agregados):

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## Paso 6: Configurar canales de notificación (Android)

Los canales se crean automáticamente desde `PushNotificationsService.createChannels()`:

| Channel ID | Nombre | Descripción |
|---|---|---|
| `eventos` | Eventos | Nuevos eventos y cambios |
| `consejos` | Consejos | Tips de bienestar emocional |
| `frases` | Frases | Frases motivacionales diarias |
| `citas` | Citas | Estado de tus solicitudes de cita |
| `recordatorios` | Recordatorios | Alertas emocionales programadas |

## Paso 7: Probar en Android Studio

```bash
npm run build
npx cap copy
npx cap open android
```

En Android Studio:
1. Conecta un dispositivo físico (API 33+) o usa un emulador con Google Play Services
2. Ejecuta la app
3. La primera vez aparecerá el diálogo de permiso de notificaciones
4. Concede el permiso

## Paso 8: Verificar registro FCM

Abre la app → Configuración → la sección de notificaciones mostrará el estado del token FCM.

Puedes verificar en Logcat:
```
✅ FCM token registered: <token>
```

## Solución de problemas

| Problema | Solución |
|---|---|
| `google-services.json` no encontrado | Verifica que está en `android/app/` y corre `npx cap sync` |
| POST_NOTIFICATIONS denegado | El usuario debe ir a Ajustes → Apps → Psicología & Bienestar → Notificaciones |
| No llegan notificaciones en background | Verifica que el dispositivo no está en modo "No molestar" |
| Error `MISSING_GOOGLE_API_KEY` | El `google-services.json` no es válido; vuelve a descargarlo desde Firebase Console |

## Notas importantes

- Las notificaciones push REALES requieren Supabase Edge Functions + Firebase Admin SDK (fase 2)
- En esta fase, las notificaciones funcionan como **notificaciones locales** desde el frontend mediante Realtime subscriptions
- El token FCM se guarda en localStorage para futura integración con Edge Functions
- La app funciona sin Firebase; las notificaciones push reales son una capa adicional opcional
