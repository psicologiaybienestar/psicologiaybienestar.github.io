import { Component, OnInit, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { NotificationsService, NotificationPreferences } from '../../core/services/notifications.service';
import { PushNotificationsService } from '../../core/services/push-notifications.service';
import { UserProfileService } from '../../core/services/user-profile.service';

interface ToggleItem {
  key: keyof NotificationPreferences;
  icon: string;
  label: string;
  desc: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [SlicePipe],
  template: `
    <div class="page">
      <!-- Header -->
      <section class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="hero-icon">⚙️</div>
          <h1 class="hero-title">Configuración</h1>
          <p class="hero-subtitle">Personaliza tu experiencia en la app</p>
        </div>
      </section>

      <!-- Perfil -->
      @if (userId) {
        <section class="section">
          <h2 class="section-title">Mi perfil</h2>
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">ID</span>
              <span class="info-value info-mono">{{ userId | slice:0:8 }}...</span>
            </div>
            @if (profile) {
              <div class="info-row">
                <span class="info-label">Puntos</span>
                <span class="info-value">{{ profile.emotional_points || 0 }} ⭐</span>
              </div>
              <div class="info-row">
                <span class="info-label">Racha</span>
                <span class="info-value">{{ profile.streak || 0 }} días 🔥</span>
              </div>
            }
          </div>
        </section>
      }

      <!-- Notificaciones -->
      <section class="section">
        <h2 class="section-title">Notificaciones</h2>
        <p class="section-subtitle">Activa o desactiva los tipos de avisos que deseas recibir</p>

        <div class="toggle-list">
          @for (item of toggles; track item.key) {
            <div class="toggle-row" (click)="toggle(item.key)">
              <span class="toggle-icon">{{ item.icon }}</span>
              <div class="toggle-info">
                <span class="toggle-label">{{ item.label }}</span>
                <span class="toggle-desc">{{ item.desc }}</span>
              </div>
              <div class="toggle-switch" [class.toggle-on]="prefs[item.key]">
                <div class="toggle-knob"></div>
              </div>
            </div>
          }
        </div>

        <button class="secondary-btn" (click)="requestNotificationPermission()">
          <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          {{ pushEnabled ? '✅ Notificaciones activas' : 'Activar notificaciones push' }}
        </button>

        @if (fcmToken) {
          <p class="text-xs text-gray-400 mt-2 text-center truncate">Token: {{ fcmToken | slice:0:20 }}...</p>
        }
      </section>

      <!-- Versión web -->
      <section class="section">
        <h2 class="section-title">Versión web</h2>
        <p class="section-subtitle">Accede a la versión completa desde tu navegador</p>
        <button class="action-btn" (click)="openWebVersion()">
          <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
          Abrir en navegador
        </button>
      </section>

      <!-- Información de la app -->
      <section class="section">
        <h2 class="section-title">Información</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Versión</span>
            <span class="info-value">1.0.0</span>
          </div>
          <div class="info-row">
            <span class="info-label">App</span>
            <span class="info-value">Psicología & Bienestar</span>
          </div>
          <div class="info-row">
            <span class="info-label">Desarrollado por</span>
            <span class="info-value">JGSoftworks.dev</span>
          </div>
        </div>
      </section>

      <div class="bottom-spacer"></div>
    </div>
  `,
  styles: [`
    .page {
      background: #ffffff;
      min-height: 100vh;
    }

    .hero-section {
      position: relative;
      padding: 32px 20px 16px;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%);
      opacity: 0.06;
    }
    .hero-content {
      position: relative;
      text-align: center;
    }
    .hero-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }
    .hero-title {
      font-size: 26px;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .hero-subtitle {
      font-size: 14px;
      color: #6b7280;
      max-width: 280px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .section {
      padding: 8px 20px 20px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .section-subtitle {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 12px;
    }

    /* Toggles */
    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: #F9FAFB;
      border-radius: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle-row:active {
      background: #EEF2FF;
    }
    .toggle-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    .toggle-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .toggle-label {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }
    .toggle-desc {
      font-size: 12px;
      color: #9ca3af;
    }
    .toggle-switch {
      width: 48px;
      height: 28px;
      background: #D1D5DB;
      border-radius: 14px;
      padding: 3px;
      transition: background 0.2s ease;
      flex-shrink: 0;
    }
    .toggle-on {
      background: #627eff;
    }
    .toggle-knob {
      width: 22px;
      height: 22px;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      transition: transform 0.2s ease;
    }
    .toggle-on .toggle-knob {
      transform: translateX(20px);
    }

    /* Buttons */
    .secondary-btn, .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px 20px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-family: inherit;
    }
    .secondary-btn:active, .action-btn:active {
      transform: scale(0.97);
    }
    .secondary-btn {
      background: #EEF2FF;
      color: #627eff;
    }
    .action-btn {
      background: #627eff;
      color: #ffffff;
    }
    .btn-icon {
      width: 20px;
      height: 20px;
    }

    /* Info */
    .info-card {
      background: #F9FAFB;
      border-radius: 16px;
      padding: 4px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #F3F4F6;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-size: 14px;
      color: #6b7280;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .bottom-spacer {
      height: 80px;
    }
  `]
})
export class ConfiguracionComponent implements OnInit {
  private notificationsService = inject(NotificationsService);
  private pushNotificationsService = inject(PushNotificationsService);
  private userProfileService = inject(UserProfileService);

  prefs: NotificationPreferences = {} as NotificationPreferences;
  pushEnabled = false;
  fcmToken: string | null = null;
  userId: string | null = null;
  profile: any = null;

  toggles: ToggleItem[] = [
    { key: 'eventos', icon: '📅', label: 'Eventos', desc: 'Nuevos eventos y cambios' },
    { key: 'consejos', icon: '💡', label: 'Consejos diarios', desc: 'Tips de bienestar cada día' },
    { key: 'frases', icon: '💛', label: 'Frases motivacionales', desc: 'Inspiración diaria' },
    { key: 'recordatorios', icon: '⏰', label: 'Recordatorios', desc: 'Alertas emocionales' },
    { key: 'minijuegos', icon: '🎮', label: 'Minijuegos', desc: 'Nuevas actividades' },
  ];

  ngOnInit() {
    this.prefs = this.notificationsService.getPreferences();
    this.fcmToken = this.pushNotificationsService.getSavedToken();
    this.pushEnabled = !!this.fcmToken;
    this.userId = this.userProfileService.currentUserId;
    this.profile = this.userProfileService.currentProfile;

    this.userProfileService.currentUserId$.subscribe(id => {
      this.userId = id;
    });
    this.userProfileService.currentProfile$.subscribe(p => {
      this.profile = p;
    });
    this.pushNotificationsService.fcmToken$.subscribe(token => {
      this.fcmToken = token;
      this.pushEnabled = !!token;
    });
  }

  toggle(key: keyof NotificationPreferences) {
    this.prefs[key] = !this.prefs[key];
    this.notificationsService.savePreferences(this.prefs);
  }

  async requestNotificationPermission() {
    if (this.pushEnabled) return;
    const ok = await this.pushNotificationsService.register();
    if (ok) {
      this.pushEnabled = true;
      this.fcmToken = this.pushNotificationsService.fcmToken;
    }
  }

  openWebVersion() {
    const url = 'https://psicologiaybienestar.netlify.app';
    window.open(url, '_blank');
  }
}
