import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-android-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="android-bottom-nav">
      <a routerLink="/inicio" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <span class="nav-label">Inicio</span>
      </a>
      <a routerLink="/emociones" routerLinkActive="active" class="nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="nav-label">Emociones</span>
      </a>
      <a routerLink="/minijuegos" routerLinkActive="active" class="nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <path d="M12 12h.01M17 12h.01M7 12h.01"/>
        </svg>
        <span class="nav-label">Juegos</span>
      </a>
      <a routerLink="/eventos" routerLinkActive="active" class="nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span class="nav-label">Eventos</span>
      </a>
      <a routerLink="/agenda" routerLinkActive="active" class="nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span class="nav-label">Agenda</span>
      </a>
    </nav>
  `,
  styles: [`
    .android-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      align-items: stretch;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      padding: 4px 0;
      padding-bottom: max(4px, env(safe-area-inset-bottom, 4px));
      box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.06);
    }

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 6px 0;
      text-decoration: none;
      color: #9ca3af;
      transition: color 0.2s ease;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }

    .nav-item.active {
      color: #627eff;
    }

    .nav-item.active .nav-icon {
      transform: scale(1.1);
    }

    .nav-icon {
      width: 24px;
      height: 24px;
      transition: transform 0.2s ease;
    }

    .nav-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .nav-item:active {
      opacity: 0.6;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2.5px;
      border-radius: 0 0 3px 3px;
      background: #627eff;
      transition: width 0.2s ease;
    }

    .nav-item.active::before {
      width: 20px;
    }
  `]
})
export class AndroidBottomNavComponent {}
