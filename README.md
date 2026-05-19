# Psicología & Bienestar

Aplicación híbrida moderna desarrollada con **Ionic + Angular + Supabase** para el centro de psicología y bienestar emocional.

## 🚀 Tecnologías

- **Ionic Angular** — UI híbrida y navegación móvil
- **Angular 20** — Framework web con standalone components
- **Supabase** — Backend: Auth, Database, Storage, Realtime
- **TailwindCSS v3** — Estilos utilitarios (no CDN)
- **Capacitor** — Android nativo, PWA
- **Swiper** — Sliders de testimonios
- **Formspree** — Envío de formulario de contacto
- **RxJS / Angular Signals** — Estado reactivo

## 📱 Funcionalidades

### Públicas (Web + Android)
- Landing page con hero, servicios, equipo, testimonios
- Galería de imágenes con lightbox
- Testimonios desde Google Sheets
- Noticias y eventos desde Supabase
- Formulario de contacto
- Botón WhatsApp flotante
- Redes sociales laterales

### Administrativas (Solo Web)
- Login con Supabase Auth
- Dashboard con estadísticas
- CRUD de noticias
- CRUD de eventos
- Galería con drag & drop a Supabase Storage
- Moderación de testimonios
- Google Calendar API para eventos

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── core/           # Servicios, guards, modelos
│   │   ├── guards/     # platformGuard, adminGuard
│   │   └── services/   # AuthService, SupabaseService, TestimoniosService
│   ├── shared/         # Componentes reutilizables
│   │   ├── components/ # Navbar, Footer, WhatsApp button, etc.
│   │   └── layouts/    # PublicLayout
│   ├── features/       # Módulos de funcionalidad
│   │   ├── home/       # Página principal
│   │   ├── galeria/    # Galería pública
│   │   ├── testimonios/ # Testimonios completos
│   │   ├── contacto/   # Formulario de contacto
│   │   ├── noticias/   # Noticias + detalle
│   │   ├── eventos/    # Eventos + detalle
│   │   ├── auth/       # Login admin
│   │   └── admin/      # Dashboard, CRUDs
│   └── pages/          # 404
├── assets/             # Imágenes estáticas
├── environments/       # Variables de entorno
└── theme/              # Variables SCSS
```

## 🎨 Colores

| Color | Código |
|---|---|
| Primary | `#627eff` |
| Secondary | `#53c6e4` |
| Accent | `#66a6da` |

## 🛠️ Instalación

```bash
npm install
npm run build     # Build web
npm run start     # Servidor desarrollo
```

## 📱 Android

```bash
npx cap add android
npx cap copy
npx cap open android
```

## ☁️ Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar `supabaseUrl` y `supabaseAnonKey` a `src/environments/environment.ts`
3. Ejecutar `supabase-migration.sql` en SQL Editor
4. Agregar usuarios admin en Authentication → Users

## 🚀 Netlify Deploy

```bash
npm run build
```

Configurar variables de entorno en Netlify:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 📄 Licencia

Desarrollado por JGSoftworks
