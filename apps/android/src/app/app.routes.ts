import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () => import('@shared/placeholder').then(m => m.PlaceholderComponent),
  },
  {
    path: 'agenda',
    loadComponent: () => import('@shared/placeholder').then(m => m.PlaceholderComponent),
  },
  {
    path: 'emociones',
    loadComponent: () => import('@shared/placeholder').then(m => m.PlaceholderComponent),
  },
  {
    path: 'minijuegos',
    loadComponent: () => import('@shared/placeholder').then(m => m.PlaceholderComponent),
  },
  {
    path: 'configuracion',
    loadComponent: () => import('@shared/placeholder').then(m => m.PlaceholderComponent),
  },
  {
    path: '**',
    redirectTo: '/inicio',
  },
];
