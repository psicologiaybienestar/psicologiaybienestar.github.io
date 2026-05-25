import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
        <p class="text-xl text-gray-600 mb-8">Página no encontrada</p>
        <a routerLink="/inicio" class="inline-block bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform">
          Volver al inicio
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
