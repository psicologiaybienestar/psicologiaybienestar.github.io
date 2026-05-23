# Psicología & Bienestar — Resumen del Proyecto

## Stack
- **Frontend**: Ionic 8 + Angular 20 (standalone components, lazy loading)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Push**: Firebase Cloud Messaging (FCM) via Capacitor
- **Hosting**: Netlify (web) + GitHub Pages (CI/CD)
- **Android**: Capacitor 8 → APK/AAB

## Estructura

```
src/
├── app/
│   ├── core/services/        # 12 servicios singleton
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
│   └── shared/               # Navbar, footer, layouts, componentes reutilizables
```

## Supabase — Tablas (14)

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

**Nueva**: `notifications` (sección 25 SQL) — centro interno de novedades con triggers automáticos.

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

## Servicios Core (12)

| Servicio | Rol |
|---|---|
| `SupabaseService` | Cliente Supabase singleton |
| `AuthService` | Login/logout admin + JWT role |
| `NotificationsService` | Preferencias + Realtime (7 tablas) |
| `PushNotificationsService` | Registro FCM + user_id + token refresh + unregister |
| `UserProfileService` | UUID auto-generado + sync profiles |
| `AgendaService` | CRUD citas + RPC security definer |
| `WhatsAppService` | Links deep WhatsApp |
| `BulkImportService` | XLSX import/export + detección duplicados + formato emociones columnar |
| `QuotesService` **nuevo** | Frases activas desde Supabase + Realtime |
| `EmotionalTipsService` **nuevo** | Tips por tipo + Realtime |
| `WellnessActivitiesService` **nuevo** | Actividades activas + Realtime |
| `MiniGamesService` **nuevo** | Minijuegos activos + Realtime |
| `InternalNotificationsService` **nuevo** | Centro de notificaciones interno (leer, marcar leído, Realtime) |

## Edge Functions (Supabase, vía Webhooks)

| Función | Trigger | Descripción |
|---|---|---|
| `notify-event` | INSERT/UPDATE en `eventos` | FCM a todos los tokens activos |
| `notify-appointment` | INSERT/UPDATE en `appointments` | FCM sobre cambios en citas |

## Mega Reforma — Cambios Realizados

### SQL (secciones 23-25)
- **23**: Política INSERT público para `appointments` (soluciona error RLS)
- **24**: Función RPC `get_my_appointments(p_email)` con `security definer` (SELECT sin auth)
- **25**: Tabla `notifications` + RLS + triggers automáticos en 6 tablas de contenido

### Bugfixes
- **Appointments RLS**: agregado `for insert with check (true)` + RPC para SELECT anónimo
- **AgendaService**: `getMyAppointments()` ahora usa `rpc('get_my_appointments')`
- **Home Android imagen**: `imagen_destacada` → `imagen` (columna real en DB)
- **Formspree timeout**: AbortController con 10s de timeout

### Home Android 100% Dinámico
- Eliminadas constantes hardcodeadas (`DAILY_TIPS`, `MOTIVATIONAL_QUOTES`, `WELLNESS_CARDS`)
- Carga real desde `motivational_quotes`, `emotional_tips`, `wellness_activities`, `mini_games`
- Notificaciones badges + panel deslizable con novedades en tiempo real
- Realtime subscriptions a todas las tablas de contenido

### Notificaciones Push
- `PushNotificationsService`: inyecta `UserProfileService`, pasa `user_id` al upsert del token
- Listener de token refresh agregado
- Método `unregister()` que marca `is_active = false`
- 5 canales Android registrados

### Notificaciones Web
- `AppComponent` inicializa `UserProfileService.init()` globalmente
- `subscribeToAllChanges()` expandido a 7 tablas (incluye `emotions`)
- `NavbarComponent`: campana con badge + dropdown de novedades en web

### Admin Emociones — UX Overhaul
- **Eliminado** textarea JSON de recomendaciones
- **Nuevo** sistema visual: add/remove cards con título + texto
- Transformación JSON automática al guardar/editar
- `BulkImportService`: emociones ahora usa columnas `recommendation_title_N` / `recommendation_text_N`
- Import: construye JSON automáticamente desde columnas
- Export: explota JSON `[{title, text}]` a columnas individuales (hasta 5 pares)
- Template descargable actualizada

### Lo que NO se tocó
- Admin login, guards, rutas
- Admin noticias, eventos, galería, testimonios, frases, consejos, actividades, minijuegos, citas
- Android bottom nav, tabs, agenda component template
- Footer, cookie consent, social buttons
- Swiper, TipTap, Lucide
- Netlify, Capacitor config, Android manifests
- 43 lint errors preexistentes (`@angular-eslint/prefer-inject`)
