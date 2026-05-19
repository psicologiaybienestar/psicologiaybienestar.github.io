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
  2. `adminGuard` — checks Supabase JWT `user_metadata.role` is `admin` or `editor`
- **`/admin/login`** has no guards (accessible everywhere)
- **No state management library** — uses simple `providedIn: 'root'` services + RxJS. Signals not yet adopted.
- **Default component styles**: SCSS (`.scss`)
- **Component prefix**: `app`, kebab-case selectors. Class suffix: `Page` or `Component`.
- **Routing param for news**: `/noticia/:slug` (slug-based), **eventos**: `/evento/:id` (UUID-based)

## Supabase

- Tables: `noticias`, `eventos`, `galeria`, `testimonios`, `comentarios` — all RLS-enabled
- Storage buckets (public): `galeria`, `noticias`, `eventos`
- Admin access: JWT `user_metadata.role` must be `admin` or `editor`
- **Migration is manual**: run `supabase-migration.sql` in Supabase SQL Editor (not automatic)
- **Auth users must be created in Supabase Dashboard** (not via SQL), then `UPDATE auth.users SET raw_user_meta_data = '{"role": "admin"}'` to grant admin
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

## Deployment

| Target | Notes |
|---|---|
| Netlify | Build → `www/`, SPA redirect `/* → /index.html` |
| GitHub Pages | CI on push to `main`, publishes `www/` to `gh-pages` branch |
| Android | `npm run build` → `npx cap copy` → `npx cap open android` |

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
