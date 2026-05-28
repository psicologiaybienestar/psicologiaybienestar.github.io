# Premium UI Overhaul — Psicología & Bienestar

Complete transformation of the Android app UI/UX to achieve a professional, wellbeing-focused experience similar to Calm, Headspace, and Stoic.

## Proposed Changes

### Global Foundation

Update the design system with premium tokens and utility classes.

#### [variables.scss](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/theme/variables.scss)
- New premium color palette (softer blues, greens, purples).
- Refined typography tokens (using larger sizes and better line heights).
- Modern shadow and blur tokens for Glassmorphism.

#### [global.scss](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/global.scss)
- Advanced utility classes for glass cards, mesh gradients, and entrance animations.
- Scroll behavior improvements.

---

### Navigation

#### [app.component.ts](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/app/app.component.ts)
#### [app.component.html](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/app/app.component.html)
- Redesign `ion-tab-bar` with a floating appearance or refined borders.
- Improve active states for tabs with subtle animations.

---

### Home (Inicio)

Complete rewrite of the main dashboard.

#### [inicio.component.ts](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/app/pages/inicio/inicio.component.ts)
- **Hero Section**: Dynamic greeting, subhead, mesh gradient background, premium icon/SVG.
- **Quote Card**: Elegant typography, depth, and refresh animation.
- **Quick Access**: Modern dashboard grid (Agenda, Emociones, etc.) with Lucide/Ionic icons.
- **Emotional Check-in**: "How are you feeling today?" quick selection.
- **Daily Content**: Activity or Tip of the day card.
- **Mini-game**: Featured casual premium card.
- **Carousel**: Horizontal scroll for news and events.

---

### More (Más)

#### [configuracion.component.ts](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/app/pages/configuracion/configuracion.component.ts)
- Redesign as the "Más" screen.
- Header with app branding.
- Organized list of links: Services, Web Version, WhatsApp, Socials.
- Configuration section with Push Notification toggle.

---

### Other Pages (Refinement)

#### [emociones.component.ts](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/app/pages/emociones/emociones.component.ts)
- Refine the emotion selection grid to be more minimal and premium.
- Update history timeline with better spacing and colors.

#### [minijuegos.component.ts](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/app/pages/minijuegos/minijuegos.component.ts)
- Update game cards to look like a modern casual game catalog.

#### [agenda.component.ts](file:///C:/Users/Juan2/Desktop/PsicologiayBienestar/apps/android/src/app/pages/agenda/agenda.component.ts)
- Apply the new "main-content" layout with mesh header.
- Refine form inputs and appointment cards.

## Verification Plan

### Manual Verification
- Deploy to Android device (physical or emulator).
- Verify scroll performance on Home.
- Check tab navigation responsiveness.
- Ensure all 8 sections of the Home are present and dynamic.
- Test the Push toggle in the "Más" screen.
- Verify that Supabase data (quotes, news, appointments) is still loading correctly.
