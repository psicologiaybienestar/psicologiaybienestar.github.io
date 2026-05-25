import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="relative bg-[#627eff] text-white pt-6 pb-6 mt-12">
      <div class="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3771/3771556.png"
          alt="Psicología"
          class="w-16 h-16 bg-white p-2 rounded-full shadow-lg border-4 border-[#627eff]"
        />
      </div>

      <div class="max-w-6xl mx-auto px-4 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
          <div>
            <h2 class="text-lg font-semibold">Psicología & Bienestar &copy; 2025</h2>
            <p class="text-sm text-white/80">serviciospsicobienestar&#64;gmail.com</p>
            <div class="flex items-center justify-center md:justify-start space-x-3 mt-2">
              <a routerLink="/terminos" class="text-xs text-white/60 hover:text-white transition-colors">Términos</a>
              <span class="text-white/30">|</span>
              <a routerLink="/privacidad" class="text-xs text-white/60 hover:text-white transition-colors">Privacidad</a>
              <span class="text-white/30">|</span>
              <a routerLink="/cookies" class="text-xs text-white/60 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>

          <div class="space-y-1">
            <p class="text-sm">
              <span class="font-semibold">Teléfono 1:</span> +57 317 500 5472
            </p>
            <p class="text-sm">
              <span class="font-semibold">Teléfono 2:</span> +57 313 206 9954
            </p>
          </div>
        </div>

        <div class="text-center mt-6 pt-4 border-t border-white/20">
          <p class="text-xs text-white/70">
            Desarrollado por
            <a href="https://jgsoftworks-site.netlify.app/" target="_blank" rel="noopener noreferrer" class="font-semibold hover:underline text-white">
              JGSoftworks.dev
            </a>
          </p>
        </div>

        <div class="flex justify-center space-x-6 mt-4 md:hidden">
          <a href="https://www.instagram.com/psicologiaybienestarcol/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/instagram.svg" alt="Instagram" class="w-7 h-7 brightness-0 invert" />
          </a>
          <a href="https://www.facebook.com/profile.php?id=100063475598042" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/facebook.svg" alt="Facebook" class="w-7 h-7 brightness-0 invert" />
          </a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
