import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonContent, IonMenu, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { NavbarComponent } from '../components/navbar.component';
import { FooterComponent } from '../components/footer.component';
import { WhatsAppButtonComponent } from '../components/whatsapp-button.component';
import { SideSocialComponent } from '../components/side-social.component';
import { CookieConsentComponent } from '../components/cookie-consent.component';
import { EventAlertComponent } from '../components/event-alert.component';
import { AndroidBottomNavComponent } from '../components/android-bottom-nav.component';
import { PlatformService } from '../../core/services/platform.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    IonContent, IonMenu, IonHeader, IonToolbar, IonTitle,
    NavbarComponent,
    FooterComponent,
    WhatsAppButtonComponent,
    SideSocialComponent,
    CookieConsentComponent,
    EventAlertComponent,
    AndroidBottomNavComponent,
  ],
  template: `
    <!-- Menu lateral (solo web) -->
    @if (!platform.isAndroid) {
      <ion-menu side="start" menuId="mainMenu" contentId="mainContent" class="md:hidden">
        <ion-header>
          <ion-toolbar style="--background: #ffffff;">
            <ion-title class="text-primary font-semibold text-lg">Menú</ion-title>
          </ion-toolbar>
        </ion-header>
        <div class="flex flex-col h-full bg-white">
          <div class="px-6 py-8 border-b border-gray-100">
            <img src="assets/img/logo.png" alt="Psicología & Bienestar" class="h-12 w-auto mx-auto" />
          </div>
          <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            @for (item of menuItems; track item.path; let i = $index) {
              <a [routerLink]="item.path" routerLinkActive="bg-primary/10 text-primary font-semibold"
                class="menu-item block px-5 py-3.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-primary transition-all duration-300"
                [style.animationDelay]="i * 0.04 + 's'"
                (click)="closeMenu()">
                {{ item.label }}
              </a>
            }
          </nav>
          <div class="px-4 py-6 border-t border-gray-100">
            <div class="flex justify-center space-x-4">
              <a href="https://www.instagram.com/psicologiaybienestarcol/" target="_blank" rel="noopener noreferrer"
                class="bg-pink-500 p-2.5 rounded-full hover:bg-pink-600 transition-all duration-300 hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=100063475598042" target="_blank" rel="noopener noreferrer"
                class="bg-blue-600 p-2.5 rounded-full hover:bg-blue-700 transition-all duration-300 hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </ion-menu>
    }

    <!-- Navbar (solo web) -->
    @if (!platform.isAndroid) {
      <app-navbar></app-navbar>
    }

    <ion-content class="ion-padding-top" [style.--offset-top]="platform.isAndroid ? '0px' : '64px'" id="mainContent">
      <router-outlet></router-outlet>

      <!-- Footer (solo web) -->
      @if (!platform.isAndroid) {
        <app-footer></app-footer>
      }

      <!-- Side social (solo web) -->
      @if (!platform.isAndroid) {
        <app-side-social></app-side-social>
      }

      <!-- WhatsApp (solo web) -->
      @if (!platform.isAndroid) {
        <app-whatsapp-button></app-whatsapp-button>
      }

      <!-- Cookie consent (solo web) -->
      @if (!platform.isAndroid) {
        <app-cookie-consent></app-cookie-consent>
      }

      <app-event-alert></app-event-alert>
    </ion-content>

    <!-- Bottom navigation (solo Android) -->
    @if (platform.isAndroid) {
      <app-android-bottom-nav></app-android-bottom-nav>
    }
  `,
})
export class PublicLayoutComponent {
  menuItems = [
    { label: 'Inicio', path: '/inicio' },
    { label: 'Galería', path: '/galeria' },
    { label: 'Testimonios', path: '/testimonios' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Eventos', path: '/eventos' },
    { label: 'Servicio Empresarial', path: '/servicio-empresarial' },
    { label: 'Contacto', path: '/contacto' },
  ];

  platform = inject(PlatformService);

  closeMenu() {
    const menu = document.querySelector('ion-menu');
    menu?.close();
  }
}
