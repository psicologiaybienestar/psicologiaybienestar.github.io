import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-gray-50">
      <aside class="w-64 bg-white shadow-lg hidden md:flex flex-col h-screen sticky top-0">
        <div class="p-6 border-b border-gray-100 shrink-0">
          <img src="assets/img/logo.png" alt="Logo" class="h-10 w-auto" />
        </div>
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          @for (item of menuItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-primary/10 text-primary font-semibold"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="p-4 border-t border-gray-100 shrink-0">
          <button (click)="logout()" class="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors w-full px-4 py-2">
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col">
        <header class="bg-white shadow-sm px-6 py-4 flex items-center justify-between md:hidden">
          <img src="assets/img/logo.png" alt="Logo" class="h-8 w-auto" />
          <button (click)="mobileMenu = !mobileMenu" class="p-2 rounded-lg hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </header>

        @if (mobileMenu) {
          <div class="bg-white shadow-md md:hidden p-4 space-y-1 max-h-60 overflow-y-auto">
            @for (item of menuItems; track item.path) {
              <a [routerLink]="item.path" (click)="mobileMenu = false" class="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">{{ item.label }}</a>
            }
            <button (click)="logout()" class="block w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm">Cerrar sesión</button>
          </div>
        }

        <main class="flex-1 p-6 overflow-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  mobileMenu = false;

  menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Noticias', path: '/admin/noticias' },
    { label: 'Eventos', path: '/admin/eventos' },
    { label: 'Galería', path: '/admin/galeria' },
    { label: 'Testimonios', path: '/admin/testimonios' },
    { label: 'Frases', path: '/admin/frases' },
    { label: 'Consejos', path: '/admin/consejos' },
    { label: 'Emociones', path: '/admin/emociones' },
    { label: 'Actividades', path: '/admin/actividades' },
    { label: 'Minijuegos', path: '/admin/minijuegos' },
    { label: 'Citas', path: '/admin/citas' },
  ];

  constructor(private auth: AuthService) {}

  async logout() {
    await this.auth.logout();
    window.location.href = '/admin/login';
  }
}
