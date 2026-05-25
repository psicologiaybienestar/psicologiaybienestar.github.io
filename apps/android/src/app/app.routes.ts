import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.component').then(m => m.InicioComponent),
  },
  {
    path: 'agenda',
    loadComponent: () => import('./pages/agenda/agenda.component').then(m => m.AgendaComponent),
  },
  {
    path: 'emociones',
    loadComponent: () => import('./pages/emociones/emociones.component').then(m => m.EmocionesComponent),
  },
  {
    path: 'minijuegos',
    loadComponent: () => import('./pages/minijuegos/minijuegos.component').then(m => m.MinijuegosComponent),
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
  },
  {
    path: '**',
    redirectTo: '/inicio',
  },
];
