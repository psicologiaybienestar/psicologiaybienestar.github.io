# AGENTS.md — Psicología & Bienestar

Ionic + Angular 20 + Capacitor 8 + Supabase hybrid app. Monorepo with `apps/web/` + `apps/android/` + `shared/` + `supabase/`.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Dev server (`ng serve` — builds `app` project) |
| `npm run build` | Build `app` (web) → `www/` |
| `npm run build:android` | Build `android` project → `www-android/` |
| `npm run watch` | Dev build-watch (not serve) |
| `npm test` | Karma+Jasmine (interactive, Chrome) |
| `npm run lint` | ESLint via `@angular-eslint` |
| `ng test --browsers=ChromeHeadless --watch=false --configuration=ci` | CI single-run tests |
| `ng build app` | Explicit web build |
| `ng build android` | Explicit Android build (→ `www-android/`) |
| `npx cap sync android` | Copy web build to Android native assets |
| `cd android && .\gradlew clean assembleDebug` | Build native APK |

Full CI pipeline from `ionic.starter.json`: `npm run lint && npm run build && npm run test -- --configuration=ci --browsers=ChromeHeadless`

## Monorepo structure

```
├── apps/
│   ├── web/src/          → Web app (production, full features)
│   └── android/src/      → Independent Android app (in development, tabs UI)
├── shared/
│   ├── services/         → 15 shared services (business logic)
│   ├── interfaces/       → TypeScript interfaces
│   ├── types/            → TypeScript types/enums
│   ├── constants/        → DI tokens, defaults, config
│   ├── utils/            → Utility functions
│   └── placeholder/      → Placeholder component (scaffolding)
├── supabase/
│   ├── functions/        → Edge Functions (notify-content, etc.)
│   └── migrations/       → DB migrations
├── angular.json          → Two projects: app + android
├── capacitor.config.ts   → Points webDir to www/ (the web app build)
└── tailwind.config.js    → Content paths: apps/web/src/, apps/android/src/, shared/
```

## Architecture

- **Standalone components** — no NgModules anywhere
- **All routes lazy-loaded** via `loadComponent()` (`apps/web/src/app/app.routes.ts`)
- **Web app**: `apps/web/src/` — full feature set with admin, contact, legal, etc.
- **Android app**: `apps/android/src/` — 5-tab layout (Inicio, Agenda, Emociones, Juegos, Más), independent from web
- **Shared services** in `shared/services/` — all business logic, re-exported by `apps/web/src/app/core/services/` for backward compat
- **InjectionToken pattern** for `SupabaseService` and `TestimoniosService` — environment-agnostic DI via `SUPABASE_CONFIG` and `GOOGLE_SHEETS_URL`
- **TypeScript path aliases**: `@shared/*` → `shared/*`, `@shared/services/*` → `shared/services/*`, etc.
- **No state management library** — simple `providedIn: 'root'` services + RxJS. Signals not yet adopted.
- **Default component styles**: SCSS (`.scss`)
- **Component prefix**: `app`, kebab-case selectors. Class suffix: `Page` or `Component`.
- **Public layout**: `PublicLayoutComponent` wraps navbar, footer, social/WhatsApp buttons, cookie consent, event alert
- **Admin routes** guarded by two guards (both must pass):
  1. `platformGuard` — blocks Android users from `/admin/*`
  2. `adminGuard` — checks Supabase JWT `app_metadata.role` is `admin` or `editor`
- **`/admin/login`** has no guards (accessible everywhere)
- **Routing param for news**: `/noticia/:slug` (slug-based), **eventos**: `/evento/:id` (UUID-based)

## Critical: Capacitor webDir

**Capacitor currently points `webDir: 'www-android'`** which is the Android app build output. The Android project (`apps/android/`) builds to `www-android/` and is wired to Capacitor.

**Decision (Opción B):** Keep `webDir: 'www'` for now. The Android app (`apps/android/`) is developed independently without affecting the production hybrid app. When the Android app reaches feature parity, switch `webDir` to `www-android/` and update `capacitor.config.ts`.

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
- Environment vars in `apps/web/src/environments/environment.ts` (replaced with `environment.prod.ts` in production builds)

## Testing

- **Karma + Jasmine** (not Jest, not Playwright)
- Requires **Chrome** installed locally
- Test entry: `apps/web/src/test.ts`, spec TSConfig: `tsconfig.spec.json`
- Coverage output: `./coverage/app`

## Configuration quirks

- `.npmrc`: `legacy-peer-deps=true` — do not remove
- Build output: `www/` (web), `www-android/` (android)
- `www/` and `www-android/` are in `.gitignore`
- Default schematics: `@ionic/angular-toolkit`
- Build budgets: initial 2 MB warning / 5 MB error; anyComponentStyle 2 KB / 4 KB
- ServiceWorker enabled in production builds (`ngsw-config.json`)
- Angular strict mode + strict templates enabled
- TailwindCSS v3 via PostCSS (not CDN, built-in)
- No Prettier/Stylelint — only EditorConfig + ESLint. No pre-commit hooks.
- `.editorconfig`: 2-space indent, UTF-8, single quotes for `.ts`
- `android/app/build.gradle`: NO duplicar `apply plugin: com.google.gms.google-services` — solo debe aparecer en el try-catch al final del archivo
- `android/app/google-services.json`: `project_number` = sender ID de FCM; verificar con `ProcessDebugGoogleServices/values/values.xml` genera `gcm_defaultSenderId`

## Deployment

| Target | Build command | Publish dir | Notes |
|---|---|---|---|
| Netlify | `npm run build` | `www/` | SPA redirect `/* → /index.html` |
| GitHub Pages | `npm run build` (CI) | `www/` | CI on push to `main`, publishes to `gh-pages` branch |
| Android (current) | `npm run build → npx cap sync android → cd android && .\gradlew clean assembleDebug` | `www/` via Capacitor | Uses web app build |
| Android (future) | `ng build android → npx cap sync android` | `www-android/` via Capacitor | Switch webDir when ready |

## External services

| Service | Purpose | Config location |
|---|---|---|
| Supabase | Auth, DB, Storage | `apps/web/src/environments/environment.ts` |
| Formspree | Contact form | `formspreeUrl` in environment |
| Google Sheets CSV | Testimonials source | `googleSheetsUrl` in environment |
| TipTap | Rich text editor (admin) | Imported per-component |
| Swiper | Testimonials carousel | Imported per-component |
| Lucide | Icons | `@lucide/angular` |
| browser-image-compression | Image upload optimization | Used in admin uploads |
| xlsx (SheetJS) | XLSX import/export for bulk data | `shared/services/bulk-import.service.ts` |
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

## Shared services (`shared/services/`)

| Servicio | Re-export en web app | Descripción |
|---|---|---|
| `SupabaseService` | `apps/web/src/app/core/services/` | Client Supabase, queries helpers |
| `AuthService` | ✅ | Auth session management |
| `PlatformService` | ✅ | Platform detection (isAndroid, isWeb, etc.) |
| `TestimoniosService` | ✅ | Testimonials (Google Sheets + Supabase) |
| `WhatsAppService` | ✅ | WhatsApp sharing links |
| `UserProfileService` | ✅ | User profile initialization |
| `AgendaService` | ✅ | `appointments` CRUD |
| `QuotesService` | ✅ | `motivational_quotes` CRUD |
| `EmotionalTipsService` | ✅ | `emotional_tips` CRUD |
| `WellnessActivitiesService` | ✅ | `wellness_activities` CRUD |
| `MiniGamesService` | ✅ | `mini_games` CRUD |
| `BulkImportService` | ✅ | XLSX import/export |
| `NotificationsService` | ✅ | Realtime subscriptions + web push |
| `InternalNotificationsService` | ✅ | In-app `notifications` table |
| `PushNotificationsService` | ✅ | FCM registration + token upsert |

## Filtros emocionales

Taxonomía `emotion_type` con 9 valores: `general`, `ansiedad`, `autoestima`, `relajación`, `estrés`, `motivación`, `mindfulness`, `bienestar`, `respiración`. Aplicada en `emotional_tips` y filtro del admin de consejos.

## Push Notifications (FCM)

### Arquitectura general

```
DB INSERT (tabla X)
  → Webhook trigger (supabase_functions.http_request)
    → Edge Function notify-content (FCM send)
      → Dispositivo Android
```

### Edge Function: `notify-content`
- **Ruta**: `supabase/functions/notify-content/index.ts`
- **Desplegada en**: `https://nwmewlnwcmsdswmxynvj.functions.supabase.co/notify-content`
- **Soporta**: noticias, motivational_quotes, emotional_tips, wellness_activities, mini_games, emotions
- **Payload autogenerado** por `supabase_functions.http_request`: `{ type, table, record, old_record }`
- **Requiere**: `FIREBASE_SERVICE_ACCOUNT` en Secrets, `verify_jwt: true`

### Webhook triggers (6 tablas + emotions)
Creados via SQL en `supabase-migration.sql` (secciones 23 y 24):
| Trigger | Tabla | Evento |
|---|---|---|
| `trg_webhook_noticias` | noticias | INSERT |
| `trg_webhook_quotes` | motivational_quotes | INSERT |
| `trg_webhook_tips` | emotional_tips | INSERT |
| `trg_webhook_activities` | wellness_activities | INSERT |
| `trg_webhook_games` | mini_games | INSERT |
| `trg_webhook_eventos` | eventos | INSERT |
| `trg_webhook_emotions` | emotions | INSERT |

### Auto-registro en AppComponent (web y Android)
- `AppComponent.ngOnInit()` → `await this.userProfileService.init()` → 1s timeout → `this.pushService.register()`
- Solo se ejecuta en Android (`PlatformService.isAndroid` → `Capacitor.getPlatform() === 'android'`)
- Service worker auto-update también se ejecuta en Android

### PushNotificationsService.register() flow
1. Dynamic import `@capacitor/push-notifications`
2. Attach 4 listeners BEFORE register: `registration`, `registrationError`, `pushNotificationReceived`, `pushNotificationActionPerformed`
3. `PushNotifications.requestPermissions()` — en Android 13+ muestra popup
4. `PushNotifications.register()` → llama a `FirebaseMessaging.getInstance().getToken()` en native
5. Token llega vía listener `registration` → `saveToken()` → upsert a `push_tokens`
6. Creación de **10 canales**: eventos, consejos, frases, citas, noticias, actividades, minijuegos, emociones, recordatorios, sistema

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
- `push_tokens` tiene 4 políticas: Insert propio, Select admin, Select anon upsert, Update propio
- `Select anon push_tokens upsert` permite SELECT para anon (necesario para upsert)
- `upsert({ token, device: 'android', user_id, is_active: true }, { onConflict: 'token' })`

## Assets (icono y splash)

- Los actuales son los defaults de Capacitor (logo Ionic).
- **Pendiente**: crear `assets/` raíz con PNGs fuente y ejecutar `npx capacitor-assets generate` para generar todas las densidades.
- Splash background color: `#627eff` (definido en `capacitor.config.ts`)

Archivos fuente necesarios en `assets/`:

| Archivo | Tamaño | Descripción |
|---|---|---|
| `icon.png` | 1024×1024 | Icono principal (cuadrado, con relleno) |
| `icon-foreground.png` | 1024×1024 | Capa frontal adaptive icon (sin fondo) |
| `icon-background.png` | 1024×1024 | Capa fondo adaptive icon (color sólido) |
| `splash.png` | 2732×2732 | Splash con logo sobre fondo `#627eff` |
| `splash-dark.png` | 2732×2732 | (Opcional) Splash modo oscuro |

Para generar: `npx capacitor-assets generate --iconBackgroundColor "#627eff" --splashBackgroundColor "#627eff"`

## Android app views (`apps/android/src/app/pages/`)

| Ruta | Componente | Funcionalidad |
|---|---|---|
| `/inicio` | `InicioComponent` | Dashboard: frase motivacional, contadores, últimas noticias |
| `/agenda` | `AgendaComponent` | Formulario de cita + listado con fechas y estados |
| `/emociones` | `EmocionesComponent` | Check-in emocional (8 estados) + historial en `user_progress` |
| `/minijuegos` | `MinijuegosComponent` | Lista desde `mini_games` con tipo y dificultad |
| `/configuracion` | `ConfiguracionComponent` | Toggle push, info app, link versión web |

- Navegación por **5 tabs inferiores** con `ion-tab-bar`
- **Conectado a Capacitor** — Capacitor apunta a `www-android/`, el APK muestra las vistas con tabs

## Progress

- [x] Monorepo structure (apps/web, apps/android, shared, supabase)
- [x] Shared services extracted (15 services)
- [x] Path aliases configured
- [x] notify-content Edge Function deployed
- [x] Webhook triggers for 7 content tables
- [x] push_tokens RLS fix
- [x] Push notifications end-to-end working
- [x] Tailwind CSS paths fixed
- [x] Android app views with tab navigation
- [ ] Customizar icono y splash (assets PNGs fuente + `npx capacitor-assets generate`)
- [x] Connect Capacitor to www-android/ (webDir changed, Android now shows tabs UI)
