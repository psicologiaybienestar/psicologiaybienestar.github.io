import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (visible) {
      <div class="fixed bottom-0 left-0 right-0 z-[9999] bg-gray-900/95 backdrop-blur-md text-white p-4 shadow-2xl border-t border-gray-700">
        <div class="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-300 text-center sm:text-left">
            Usamos cookies propias y de terceros para mejorar tu experiencia en nuestro sitio. 
            Al continuar navegando, aceptas nuestra 
            <a routerLink="/cookies" class="text-secondary hover:underline">Política de Cookies</a>.
          </p>
          <div class="flex items-center gap-3 shrink-0">
            <button (click)="accept()" class="bg-secondary hover:bg-accent text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors">
              Aceptar
            </button>
            <a routerLink="/cookies" (click)="accept()" class="text-gray-400 hover:text-white text-sm transition-colors">
              Más información
            </a>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieConsentComponent implements OnInit {
  visible = false;

  ngOnInit() {
    this.visible = !localStorage.getItem('cookie-consent');
  }

  accept() {
    localStorage.setItem('cookie-consent', 'true');
    this.visible = false;
  }
}
