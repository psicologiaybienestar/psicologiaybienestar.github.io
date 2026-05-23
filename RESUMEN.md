# Psicología & Bienestar — Resumen del Proyecto

## Stack
- **Frontend**: Ionic 8 + Angular 20 (standalone components, lazy loading)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Push**: Firebase Cloud Messaging (FCM) via Capacitor + Firebase Admin SDK (Edge Functions)
- **Hosting**: Netlify (web) + GitHub Pages (CI/CD)
- **Android**: Capacitor 8 → APK/AAB

## Estructura

```
src/
├── app/
│   ├── core/services/        # 13 servicios singleton
│   ├── features/
│   │   ├── android/          # Home Android dinámico, Agenda, Config, Minijuegos, Emociones
│   │   ├── public/           # Web layouts, navbar, footer
│   │   ├── home/             # Web HomeComponent
│   │   ├── admin/            # Dashboard + 11 CRUDs
│   │   ├── auth/             # Admin login
│   │   ├── noticias/         # Lista + detalle
│   │   ├── eventos/          # Lista + detalle
│   │   ├── galeria/          # Galería pública
│   │   ├── testimonios/      # Testimonios
│   │   ├── contacto/         # Formulario
│   │   ├── legal/            # Cookies, privacidad, términos
│   │   └── servicio-empresarial/
│   └── shared/               # Navbar, footer, layouts, floating-notif
```

## Supabase — Tablas (15)

| Tabla | Propósito |
|---|---|
| `noticias` | Blog con slugs, estados (borrador/publicado/archivado) |
| `eventos` | Calendario con estados |
| `galeria` | Imágenes públicas |
| `testimonios` | Testimonios moderados |
| `comentarios` | Comentarios en noticias |
| `appointments` | Solicitudes de citas (5 estados + reagendar) |
| `profiles` | Perfiles UUID (sync Capacitor) |
| `user_progress` | Progreso emocional anónimo |
| `push_tokens` | Tokens FCM para push |
| `motivational_quotes` | Frases motivacionales |
| `emotional_tips` | Consejos por tipo emocional (9 tipos) |
| `emotions` | Categorías emocionales con JSONB recomendaciones |
| `wellness_activities` | Mindfulness, meditación, respiración |
| `mini_games` | Catálogo de minijuegos |
| `notifications` | Centro de novedades interno (triggers automáticos en 6 tablas) |
| `notification_ack` | Acuse por dispositivo (is_read, dismissed independiente por device_id) |

## Admin (11 módulos)

| Ruta | Funcionalidad |
|---|---|
| `/admin/dashboard` | Stats + accesos directos |
| `/admin/noticias` | CRUD + estados |
| `/admin/eventos` | CRUD + filtros + estados |
| `/admin/galeria` | Upload drag-drop múltiple |
| `/admin/testimonios` | Moderar (aprobar/rechazar) |
| `/admin/frases` | CRUD + XLSX + plantilla |
| `/admin/consejos` | CRUD + filtro emotion_type + XLSX |
| `/admin/emociones` | CRUD + **sistema visual de recomendaciones** (sin JSON) + XLSX columnar |
| `/admin/actividades` | CRUD + upload bucket + XLSX |
| `/admin/minijuegos` | CRUD + toggle + XLSX |
| `/admin/citas` | Filtros + estados + reagendar inline |

## Servicios Core (13)

| Servicio | Rol |
|---|---|
| `SupabaseService` | Cliente Supabase singleton |
| `AuthService` | Login/logout admin + JWT role |
| `PlatformService` | Detección Android/Web vía Capacitor |
| `NotificationsService` | Preferencias + Realtime (7 tablas) |
| `PushNotificationsService` | Registro FCM + user_id + token refresh + unregister |
| `UserProfileService` | UUID auto-generado + sync profiles |
| `AgendaService` | CRUD citas + RPC security definer |
| `WhatsAppService` | Links deep WhatsApp |
| `BulkImportService` | XLSX import/export + detección duplicados + emociones columnar |
| `QuotesService` | Frases activas desde Supabase + Realtime |
| `EmotionalTipsService` | Tips por tipo + Realtime |
| `WellnessActivitiesService` | Actividades activas + Realtime |
| `MiniGamesService` | Minijuegos activos + Realtime |
| `InternalNotificationsService` | Centro notificaciones interno (per-device via notification_ack) |

## Edge Functions (Supabase, vía Webhooks)

| Función | Trigger | Descripción |
|---|---|---|
| `notify-event` | INSERT/UPDATE en `eventos` | FCM a todos los tokens activos (responde 202, procesa en background) |
| `notify-appointment` | INSERT/UPDATE en `appointments` | FCM sobre cambios en citas (responde 202, procesa en background) |

## Cambios realizados (todas las rondas)

### SQL (secciones 23-26)
- **23**: Política INSERT público para `appointments` (soluciona error RLS)
- **24**: Función RPC `get_my_appointments(p_email)` con `security definer`
- **25**: Tabla `notifications` + RLS + triggers automáticos en 6 tablas de contenido
- **25b**: Trigger fix: `case TG_TABLE_NAME` branching en vez de `coalesce(new.titulo, ...)` — soluciona error "record has no field 'title'" en eventos
- **26**: Tabla `notification_ack` + RLS — tracking por dispositivo (device_id UUID de UserProfileService)

### Bugfixes
- **Appointments RLS**: `for insert with check (true)` + RPC para SELECT anónimo
- **AgendaService**: `getMyAppointments()` usa `rpc('get_my_appointments')` en vez de SELECT directo
- **Home Android imagen**: `imagen_destacada` → `imagen`
- **Realtime channels**: nombre único por instancia (`all-content-changes-{counter}`) — soluciona "cannot add postgres_changes callbacks after subscribe()"
- **504 Edge Functions**: responden `202 Accepted` inmediatamente, procesan Firebase en background
- **FIREBASE_SERVICE_ACCOUNT**: configurado vía Management API (escape correcto)

### Home Android 100% Dinámico
- Eliminadas constantes hardcodeadas (`DAILY_TIPS`, `MOTIVATIONAL_QUOTES`, `WELLNESS_CARDS`)
- Carga real desde `motivational_quotes`, `emotional_tips`, `wellness_activities`, `mini_games`
- Swiper de consejos dinámicos
- Minijuegos híbrido: 3 hardcodeados + dinámicos desde DB
- Notificaciones: pill en hero con badge, overlay + bottom-sheet panel
- Safe-area-inset para notch/cámara
- Panel 75vh con padding para tab bar

### Notificaciones Push (Android)
- `PushNotificationsService`: listeners attach **antes** de `PushNotifications.register()` (evita race condition)
- `AppComponent.ngOnInit()`: llama a `PushNotificationsService.register()` automáticamente al iniciar (1s delay)
- `UserProfileService.init()` await antes de registrar push
- Token upsert con `user_id` al `push_tokens`
- Listener de token refresh
- `unregister()` marca `is_active = false`
- 5 canales Android registrados (eventos, consejos, frases, citas, recordatorios)

### ⚠️ Problema conocido: Push notifications no llegan al celular
- Los logs de Edge Function muestran "⚠️ No hay tokens registrados"
- Esto significa que `push_tokens` está vacío → ningún dispositivo Android completó el registro FCM
- Posibles causas (pendiente de diagnóstico):
  1. **google-services.json** puede no coincidir con el proyecto Firebase actual
  2. **Capacitor Push Notifications plugin** no se sincronizó correctamente (falta `npx cap sync` tras cambios)
  3. La app necesita permisos de notificaciones explícitos en Android 13+
  4. El error de registro FCM solo se ve en Logcat de Android Studio (console.warn no se muestra en web)
- **Solución propuesta**: Conectar dispositivo vía USB → Android Studio → Logcat → buscar "FCM registration error" o "Push registration failed"

### Notificaciones Web
- `AppComponent`: `subscribeToAllChanges()` con 7 tablas + Web Notification API
- `FloatingNotifComponent`: botón flotante (esquina inferior derecha, sobre WhatsApp)
  - Badge con conteo no leídos
  - Dropdown panel con lista de novedades
  - Marcar leído (click), eliminar individual (✕), vaciar leídas (🗑️)
  - Cerrar panel (✕), marcar todo leído
- **Per-device**: cada navegador/dispositivo tiene su propio estado via `notification_ack`

### Service Worker & Caching
- `AppComponent`: `SwUpdate.versionUpdates` escucha VERSION_READY → activateUpdate() → reload()
- `checkForUpdate()` cada 30 minutos
- Soluciona: "a veces carga la versión web vieja" en Android

### Admin
- **Dashboard**: sidebar sticky + overflow-y-auto (no se desborda)
- **Emociones**: JSON textarea reemplazado por builder visual de recomendaciones (add/remove cards)
- **BulkImportService**: emociones con columnas `recommendation_title_N` / `recommendation_text_N` en XLSX

### Lo que NO se tocó
- Admin login, guards, rutas
- Admin noticias, eventos, galería, testimonios, frases, consejos, actividades, minijuegos, citas
- Android bottom nav, tabs, agenda component template
- Footer, cookie consent, social buttons
- Swiper, TipTap, Lucide
- Netlify, Capacitor config, Android manifests
- 43 lint errors preexistentes (`@angular-eslint/prefer-inject`)
