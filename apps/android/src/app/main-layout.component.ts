import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [IonicModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <router-outlet></router-outlet>

    <nav class="android-bottom-nav">
      <a routerLink="/inicio" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item" style="--nav-color: #4a69bd">
        <div class="nav-icon-wrap">
          <svg viewBox="0 0 24 24" class="nav-svg"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/></svg>
        </div>
        <span class="nav-label">Inicio</span>
      </a>
      <a routerLink="/agenda" routerLinkActive="active" class="nav-item" style="--nav-color: #627eff">
        <div class="nav-icon-wrap">
          <svg viewBox="0 0 24 24" class="nav-svg"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/></svg>
        </div>
        <span class="nav-label">Agenda</span>
      </a>
      <a routerLink="/emociones" routerLinkActive="active" class="nav-item" style="--nav-color: #ec4899">
        <div class="nav-icon-wrap">
          <svg viewBox="0 0 24 24" class="nav-svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
        </div>
        <span class="nav-label">Emociones</span>
      </a>
      <a routerLink="/minijuegos" routerLinkActive="active" class="nav-item" style="--nav-color: #78e08f">
        <div class="nav-icon-wrap">
          <svg viewBox="0 0 24 24" class="nav-svg"><path d="M21.5 6h-4.5l-3-3h-4l-3 3h-4.5c-.83 0-1.5.67-1.5 1.5v11c0 .83.67 1.5 1.5 1.5h18c.83 0 1.5-.67 1.5-1.5v-11c0-.83-.67-1.5-1.5-1.5zm-12 3.5h-2v2h-1.5v-2h-2v-1.5h2v-2h1.5v2h2v1.5zm8.5 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/></svg>
        </div>
        <span class="nav-label">Juegos</span>
      </a>
      <a routerLink="/configuracion" routerLinkActive="active" class="nav-item" style="--nav-color: #60a5fa">
        <div class="nav-icon-wrap">
          <svg viewBox="0 0 24 24" class="nav-svg"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/></svg>
        </div>
        <span class="nav-label">Mas</span>
      </a>
    </nav>
  `,
  styles: [`
    :host { position: absolute; inset: 0; padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
    .android-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      align-items: stretch;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0, 0, 0, 0.04);
      padding: 4px 0;
      padding-bottom: max(4px, env(safe-area-inset-bottom, 4px));
    }
    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 5px 0;
      text-decoration: none;
      color: #adb5bd;
      transition: all 0.25s ease;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }
    .nav-icon-wrap {
      width: 32px;
      height: 28px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s ease;
    }
    .nav-svg {
      width: 22px;
      height: 22px;
      color: inherit;
      transition: all 0.25s ease;
      display: block;
    }
    .nav-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.02em;
      transition: color 0.25s ease;
    }
    .nav-item.active .nav-icon-wrap {
      background: color-mix(in srgb, var(--nav-color) 12%, transparent);
      width: 38px;
      height: 32px;
    }
    .nav-item.active .nav-svg {
      color: var(--nav-color);
      transform: scale(1.1);
    }
    .nav-item.active .nav-label {
      color: var(--nav-color);
      font-weight: 700;
    }
    .nav-item:active {
      opacity: 0.6;
    }
  `],
})
export class MainLayoutComponent {}
