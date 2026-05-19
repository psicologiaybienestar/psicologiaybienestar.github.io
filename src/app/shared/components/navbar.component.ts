import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonHeader, IonToolbar, IonButtons, IonMenuButton],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="px-4" style="--background: #ffffff; --border-width: 0;">
        <div class="flex items-center justify-between h-16 max-w-7xl mx-auto w-full">
          <a routerLink="/inicio" class="flex items-center shrink-0">
            <img src="assets/img/logo.png" alt="Psicología & Bienestar" class="h-10 w-auto" />
          </a>

          <nav class="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a routerLink="/inicio" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Inicio</a>
            <a routerLink="/galeria" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Galería</a>
            <a routerLink="/testimonios" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Testimonios</a>
            <a routerLink="/noticias" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Noticias</a>
            <a routerLink="/eventos" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Eventos</a>
            <a routerLink="/servicio-empresarial" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Empresarial</a>
            <a routerLink="/contacto" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Contacto</a>
            <a routerLink="/admin/login" class="text-gray-400 hover:text-primary transition-colors duration-300 text-sm lg:text-base" title="Administración">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </a>
          </nav>

          <ion-buttons slot="end" class="md:hidden">
            <ion-menu-button style="--color: #627eff;" class="text-2xl"></ion-menu-button>
          </ion-buttons>
        </div>
      </ion-toolbar>
    </ion-header>
  `,
})
export class NavbarComponent {}
