import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './shared/layouts/public-layout.component';
import { platformGuard } from './core/guards/platform.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'galeria',
        loadComponent: () => import('./features/galeria/galeria.component').then(m => m.GaleriaComponent),
      },
      {
        path: 'testimonios',
        loadComponent: () => import('./features/testimonios/testimonios.component').then(m => m.TestimoniosComponent),
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/contacto/contacto.component').then(m => m.ContactoComponent),
      },
      {
        path: 'noticias',
        loadComponent: () => import('./features/noticias/noticias-list.component').then(m => m.NoticiasListComponent),
      },
      {
        path: 'noticia/:slug',
        loadComponent: () => import('./features/noticias/noticia-detail.component').then(m => m.NoticiaDetailComponent),
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/eventos/eventos-list.component').then(m => m.EventosListComponent),
      },
      {
        path: 'evento/:id',
        loadComponent: () => import('./features/eventos/evento-detail.component').then(m => m.EventoDetailComponent),
      },
      {
        path: 'servicio-empresarial',
        loadComponent: () => import('./features/servicio-empresarial/servicio-empresarial.component').then(m => m.ServicioEmpresarialComponent),
      },
      {
        path: 'emociones',
        loadComponent: () => import('./features/android/emociones.component').then(m => m.EmocionesComponent),
      },
      {
        path: 'minijuegos',
        loadComponent: () => import('./features/android/minijuegos.component').then(m => m.MinijuegosComponent),
      },
      {
        path: 'agenda',
        loadComponent: () => import('./features/android/agenda.component').then(m => m.AgendaComponent),
      },
      {
        path: 'terminos',
        loadComponent: () => import('./features/legal/terminos.component').then(m => m.TerminosComponent),
      },
      {
        path: 'privacidad',
        loadComponent: () => import('./features/legal/privacidad.component').then(m => m.PrivacidadComponent),
      },
      {
        path: 'cookies',
        loadComponent: () => import('./features/legal/cookies.component').then(m => m.CookiesComponent),
      },
    ],
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [platformGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'noticias',
        loadComponent: () => import('./features/admin/noticias/admin-noticias.component').then(m => m.AdminNoticiasComponent),
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/admin/eventos/admin-eventos.component').then(m => m.AdminEventosComponent),
      },
      {
        path: 'galeria',
        loadComponent: () => import('./features/admin/galeria/admin-galeria.component').then(m => m.AdminGaleriaComponent),
      },
      {
        path: 'testimonios',
        loadComponent: () => import('./features/admin/testimonios/admin-testimonios.component').then(m => m.AdminTestimoniosComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent),
  },
];
