import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { GAMES_REGISTRY } from './games/games.registry';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
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
        path: 'evento/:id',
        loadComponent: () => import('./pages/evento-detail/evento-detail.component').then(m => m.EventoDetailComponent),
      },
      ...GAMES_REGISTRY.map(game => ({
        path: game.route.slice(1),
        loadComponent: game.component,
      })),
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
