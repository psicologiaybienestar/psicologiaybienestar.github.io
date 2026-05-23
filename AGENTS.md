# AGENTS.md — Psicología & Bienestar

Ionic + Angular 20 + Capacitor 8 + Supabase hybrid app (web + Android). Single project, not a monorepo.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Dev server (`ng serve`) |
| `npm run build` | Production build → `www/` |
| `npm run watch` | Dev build-watch (not serve) |
| `npm test` | Karma+Jasmine (interactive, Chrome) |
| `npm run lint` | ESLint via `@angular-eslint` |
| `ng test --browsers=ChromeHeadless --watch=false --configuration=ci` | CI single-run tests |

Full CI pipeline from `ionic.starter.json`: `npm run lint && npm run build && npm run test -- --configuration=ci --browsers=ChromeHeadless`

## Architecture

- **Standalone components** — no NgModules anywhere
- **All routes lazy-loaded** via `loadComponent()` (`src/app/app.routes.ts`)
- **Public layout**: `PublicLayoutComponent` wraps navbar, footer, social/WhatsApp buttons, cookie consent, event alert
- **Admin routes** guarded by two guards (both must pass):
  1. `platformGuard` — blocks Android users from `/admin/*`
   2. `adminGuard` — checks Supabase JWT `app_metadata.role` is `admin` or `editor`
- **`/admin/login`** has no guards (accessible everywhere)
- **No state management library** — uses simple `providedIn: 'root'` services + RxJS. Signals not yet adopted.
- **Default component styles**: SCSS (`.scss`)
- **Component prefix**: `app`, kebab-case selectors. Class suffix: `Page` or `Component`.
- **Routing param for news**: `/noticia/:slug` (slug-based), **eventos**: `/evento/:id` (UUID-based)

## Supabase

### Base tables
- `noticias`, `eventos`, `galeria`, `testimonios`, `comentarios` — original tables
- `motivational_quotes` — frases dinámicas desde admin
- `emotional_tips` — consejos emocionales por tipo (ansiedad, autoestima, estrés, etc.)
- `mini_games` — catálogo de minijuegos (tipo, dificultad, ruta)
- `emotions` — categorías emocionales configurables con recomendaciones (JSONB)
- `wellness_activities` — mindfulness, meditación, respiración, relajación
- `push_tokens` — tokens FCM por dispositivo (token, device, user_id, is_active, created_at)
- `appointments` — solicitudes de citas (pendiente/confirmada/completada/cancelada)
- `user_progress` — progreso emocional anónimo
- `admin_stats` (vista) — estadísticas cruzadas para dashboard admin

### Storage buckets (public)
- `galeria`, `noticias`, `eventos`, `wellness`

### RLS & Security
- All policies use `auth.jwt() -> 'app_metadata' ->> 'role'` (NOT `user_metadata` — user_metadata is user-editable and flagged by Supabase linter)
- Admin/editor grants full access via `raw_app_meta_data`
- **Migration is manual**: run `supabase-migration.sql` in Supabase SQL Editor (not automatic)
- **Auth users must be created in Supabase Dashboard** (not via SQL), then:
  ```sql
  UPDATE auth.users SET raw_app_meta_data = '{"role": "admin"}' WHERE email = '...';
  ```
- Environment vars in `src/environments/environment.ts` (replaced with `environment.prod.ts` in production builds — both currently identical)

## Testing

- **Karma + Jasmine** (not Jest, not Playwright)
- Requires **Chrome** installed locally
- Test entry: `src/test.ts`, spec TSConfig: `tsconfig.spec.json`
- Coverage output: `./coverage/app`

## Configuration quirks

- `.npmrc`: `legacy-peer-deps=true` — do not remove
- Build output: `www/` (not `dist/`)
- Default schematics: `@ionic/angular-toolkit`
- Build budgets: initial 2 MB warning / 5 MB error; anyComponentStyle 2 KB / 4 KB
- ServiceWorker enabled in production builds (`ngsw-config.json`)
- Angular strict mode + strict templates enabled
- TailwindCSS v3 via PostCSS (not CDN, built-in)
- No Prettier/Stylelint — only EditorConfig + ESLint. No pre-commit hooks.
- `.editorconfig`: 2-space indent, UTF-8, single quotes for `.ts`
- `android/app/build.gradle`: NO duplicar `apply plugin: com.google.gms.google-services` — solo debe aparecer en el try-catch al final del archivo
- `android/app/google-services.json`: `project_number` = sender ID de FCM; verificar con `ProcessDebugGoogleServices/values/values.xml` genera `gcm_defaultSenderId`
- Al rebuildear Android: `npm run build → npx cap sync android → cd android && .\gradlew clean assembleDebug`

## Deployment

| Target | Notes |
|---|---|
| Netlify | Build → `www/`, SPA redirect `/* → /index.html` |
| GitHub Pages | CI on push to `main`, publishes `www/` to `gh-pages` branch |
| Android | `npm run build` → `npx cap sync android` → `npx cap open android` |

## External services

| Service | Purpose | Config location |
|---|---|---|
| Supabase | Auth, DB, Storage | `src/environments/environment.ts` |
| Formspree | Contact form | `formspreeUrl` in environment |
| Google Sheets CSV | Testimonials source | `googleSheetsUrl` in environment |
| TipTap | Rich text editor (admin) | Imported per-component |
| Swiper | Testimonials carousel | Imported per-component |
| Lucide | Icons | `@lucide/angular` |
| browser-image-compression | Image upload optimization | Used in admin uploads |
| xlsx (SheetJS) | XLSX import/export for bulk data | `src/app/core/services/bulk-import.service.ts` |
| @capacitor/push-notifications | FCM push notifications (v8.1.1) | Plugin auto-wired via npx cap sync |
| Firebase Cloud Messaging | Push delivery | `android/app/google-services.json` |

## Admin — Módulos expandidos

| Ruta | Componente | Descripción |
|---|---|---|
| `/admin/dashboard` | `AdminDashboardComponent` | 7 stats con iconos + 10 accesos directos |
| `/admin/noticias` | `AdminNoticiasComponent` | CRUD noticias (estados: borrador/publicado/archivado) |
| `/admin/eventos` | `AdminEventosComponent` | CRUD + filtros: publicados/borradores/próximos/pospuestos/finalizados/cancelados + búsqueda |
| `/admin/galeria` | `AdminGaleriaComponent` | Upload múltiple drag-drop |
| `/admin/testimonios` | `AdminTestimoniosComponent` | Moderar (aprobar/rechazar/pendiente) |
| `/admin/frases` | `AdminFrasesComponent` | CRUD frases motivacionales + import XLSX + plantilla |
| `/admin/consejos` | `AdminConsejosComponent` | CRUD + filtro por emotion_type + import |
| `/admin/emociones` | `AdminEmocionesComponent` | CRUD tarjetas visuales + JSON recomendaciones |
| `/admin/actividades` | `AdminActividadesComponent` | CRUD + upload a bucket wellness + import |
| `/admin/minijuegos` | `AdminMinijuegosComponent` | CRUD con toggle activo, tipo, dificultad |
| `/admin/citas` | `AdminCitasComponent` | Filtros por estado, cambiar estado, eliminar |

## Servicios nuevos

| Servicio | Archivo | Descripción |
|---|---|---|
| `BulkImportService` | `src/app/core/services/bulk-import.service.ts` | Importación XLSX con validación por columna. Tablas: motivational_quotes, emotional_tips, wellness_activities. Descarga de plantillas. |
| `PushNotificationsService` | `src/app/core/services/push-notifications.service.ts` | Registro FCM, solicitud de permiso, upsert de token a `push_tokens`, creación de canales, manejo de tap |

## Filtros emocionales

Taxonomía `emotion_type` con 9 valores: `general`, `ansiedad`, `autoestima`, `relajación`, `estrés`, `motivación`, `mindfulness`, `bienestar`, `respiración`. Aplicada en `emotional_tips` y filtro del admin de consejos.

## Push Notifications (FCM)

### Auto-registro en AppComponent
- `AppComponent.ngOnInit()` → `await this.userProfileService.init()` → 1s timeout → `this.pushService.register()`
- Solo se ejecuta en Android (`PlatformService.isAndroid` → `Capacitor.getPlatform() === 'android'`)
- Service worker auto-update también se ejecuta en Android

### PushNotificationsService.register() flow
1. Dynamic import `@capacitor/push-notifications`
2. Attach 4 listeners BEFORE register: `registration`, `registrationError`, `pushNotificationReceived`, `pushNotificationActionPerformed`
3. `PushNotifications.requestPermissions()` — en Android 13+ muestra popup
4. `PushNotifications.register()` → llama a `FirebaseMessaging.getInstance().getToken()` en native
5. Token llega vía listener `registration` → `saveToken()` → upsert a `push_tokens`
6. Creación de 5 canales: eventos, consejos, frases, citas, recordatorios

### Configuración Android
| Archivo | Rol |
|---|---|
| `android/app/build.gradle:48-54` | `apply plugin: 'com.google.gms.google-services'` (try-catch, NO duplicado) |
| `android/build.gradle:11` | `classpath 'com.google.gms:google-services:4.4.4'` |
| `android/app/google-services.json` | `project_number` = sender ID `589361904689`, `package_name` = `com.psicologiaybienestar.app` |
| `android/app/src/main/AndroidManifest.xml:35` | `POST_NOTIFICATIONS` (API 33+) |
| `capacitor.config.ts:25-27` | `PushNotifications.presentationOptions: ['badge','sound','alert']` |
| `node_modules/@capacitor/push-notifications/android/build.gradle:7` | `firebase-messaging:25.0.1` (bundled, no override en variables.gradle) |

### Servicios nativos registrados (merged manifest)
- `com.capacitorjs.plugins.pushnotifications.MessagingService` — `FIREBASE_MESSAGING_EVENT`
- `com.google.firebase.messaging.FirebaseMessagingService` — sistema
- `com.google.firebase.provider.FirebaseInitProvider` — auto-init al arranque
- `com.google.firebase.iid.FirebaseInstanceIdReceiver` — receiver de FCM

### Debug workflow (dispositivo físico)
```powershell
# 1. Limpiar logs previos
adb logcat -c

# 2. Capturar solo FCM/push
adb logcat -v time -s FirebaseInit FirebaseInstanceId FCM PushNotifications Capacitor:V "*:W" > fcm_logs.txt

# 3. Abrir app, aceptar permiso notificación, esperar 10s, Ctrl+C

# 4. Buscar en fcm_logs.txt:
#    ✅ "Default FirebaseApp initialized"
#    ✅ "📱 FCM token recibido: <token>"
#    ❌ "registrationError" — no debe aparecer
#    ❌ "⚠️ Could not save token to Supabase" — error RLS
```

### push_tokens RLS
- `upsert({ token, device: 'android', user_id, is_active: true }, { onConflict: 'token' })`
- Requiere políticas INSERT y UPDATE para `anon` (o `authenticated` si el usuario inició sesión)
