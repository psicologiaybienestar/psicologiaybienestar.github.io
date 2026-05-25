import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PushNotificationsService } from '@shared/services/push-notifications.service';
import { QuotesService } from '@shared/services/quotes.service';
import { WhatsAppService } from '@shared/services/whatsapp.service';
import { UserProfileService } from '@shared/services/user-profile.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Más</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="profile-card">
        <div class="avatar">{{ inicial }}</div>
        <div class="profile-info">
          <h2>{{ nickname || 'Invitado' }}</h2>
          <p>ID: {{ userId?.substring(0, 8) || '---' }}</p>
        </div>
      </div>

      <div class="section">
        <div class="menu-item">
          <div class="menu-left">
            <div class="menu-icon bg-primary">
              <ion-icon name="notifications" />
            </div>
            <div>
              <p class="menu-label">Notificaciones push</p>
              <p class="menu-desc">Recibe alertas de nuevos contenidos</p>
            </div>
          </div>
          <ion-toggle [(ngModel)]="pushActivo" (ionChange)="togglePush()" />
        </div>
      </div>

      <div class="section">
        <div class="menu-item" (click)="frasesAbiertas = !frasesAbiertas">
          <div class="menu-left">
            <div class="menu-icon bg-secondary">
              <ion-icon name="chatbubble-quote" />
            </div>
            <div>
              <p class="menu-label">Frases motivacionales</p>
              <p class="menu-desc">{{ frases.length }} frases disponibles</p>
            </div>
          </div>
          <ion-icon [name]="frasesAbiertas ? 'chevron-up' : 'chevron-down'" slot="end" />
        </div>
        @if (frasesAbiertas) {
          <div class="sub-section">
            @for (f of frases; track f.id) {
              <div class="frase-item">
                <p class="frase-text">&ldquo;{{ f.quote }}&rdquo;</p>
                <p class="frase-author">&mdash; {{ f.author || 'Anónimo' }}</p>
              </div>
            }
          </div>
        }
      </div>

      <div class="section">
        <div class="menu-item" (click)="serviciosAbiertos = !serviciosAbiertos">
          <div class="menu-left">
            <div class="menu-icon bg-tertiary">
              <ion-icon name="heart" />
            </div>
            <div>
              <p class="menu-label">Nuestros servicios</p>
              <p class="menu-desc">Conoce más sobre nosotros</p>
            </div>
          </div>
          <ion-icon [name]="serviciosAbiertos ? 'chevron-up' : 'chevron-down'" />
        </div>
        @if (serviciosAbiertos) {
          <div class="sub-section">
            <div class="servicio-card">
              <h3>Terapia psicológica</h3>
              <p>Atención profesional personalizada para tu bienestar emocional.</p>
            </div>
            <div class="servicio-card">
              <h3>Talleres y eventos</h3>
              <p>Actividades grupales para el crecimiento personal.</p>
            </div>
            <div class="servicio-card">
              <h3>Recursos digitales</h3>
              <p>Ejercicios, meditaciones y herramientas de autoayuda.</p>
            </div>
          </div>
        }
      </div>

      <div class="section">
        <button class="action-btn web-btn" (click)="abrirWeb()">
          <ion-icon name="globe" />
          <span>Abrir versión web</span>
        </button>
        <button class="action-btn wa-btn" (click)="abrirWhatsApp()">
          <ion-icon name="logo-whatsapp" />
          <span>Contactar por WhatsApp</span>
        </button>
      </div>

      <div class="about">
        <p class="version">Psicología & Bienestar v1.0.0</p>
        <p class="copy">&copy; 2026 Todos los derechos reservados</p>
      </div>
    </ion-content>
  `,
  styles: `
    .profile-card { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--ion-color-primary-contrast); border-radius: 16px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary)); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
    .profile-info h2 { font-size: 16px; font-weight: 700; margin: 0 0 2px; color: var(--ion-text-color); }
    .profile-info p { font-size: 12px; color: var(--ion-color-medium); margin: 0; }

    .section { background: var(--ion-color-primary-contrast); border-radius: 16px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }

    .menu-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; }
    .menu-item:active { background: var(--ion-color-light); }
    .menu-left { display: flex; align-items: center; gap: 12px; }
    .menu-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .menu-icon ion-icon { font-size: 18px; color: white; }
    .bg-primary { background: var(--ion-color-primary); }
    .bg-secondary { background: var(--ion-color-secondary); }
    .bg-tertiary { background: var(--ion-color-tertiary); }
    .menu-label { font-size: 14px; font-weight: 600; color: var(--ion-text-color); margin: 0; }
    .menu-desc { font-size: 12px; color: var(--ion-color-medium); margin: 1px 0 0; }

    .sub-section { padding: 0 16px 12px; }
    .frase-item { padding: 10px 0; border-top: 1px solid var(--ion-color-light); }
    .frase-text { font-size: 14px; font-style: italic; color: var(--ion-text-color); margin: 0 0 4px; line-height: 1.4; }
    .frase-author { font-size: 12px; color: var(--ion-color-medium); margin: 0; }

    .servicio-card { padding: 12px; margin-bottom: 8px; background: var(--ion-color-light); border-radius: 12px; }
    .servicio-card h3 { font-size: 14px; font-weight: 600; margin: 0 0 4px; color: var(--ion-text-color); }
    .servicio-card p { font-size: 13px; color: var(--ion-color-medium); margin: 0; line-height: 1.4; }

    .section:last-of-type { background: transparent; box-shadow: none; padding: 0; }
    .action-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; border: none; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; margin-bottom: 10px; transition: transform 0.15s; }
    .action-btn:active { transform: scale(0.98); }
    .action-btn ion-icon { font-size: 20px; }
    .web-btn { background: var(--ion-color-primary); color: white; }
    .wa-btn { background: #25D366; color: white; }

    .about { text-align: center; padding: 16px 0 8px; }
    .version { font-size: 13px; color: var(--ion-color-medium); margin: 0 0 4px; }
    .copy { font-size: 11px; color: var(--ion-color-medium); margin: 0; }
  `,
})
export class ConfiguracionComponent implements OnInit {
  private pushService = inject(PushNotificationsService);
  private quotesService = inject(QuotesService);
  private whatsApp = inject(WhatsAppService);
  private userProfile = inject(UserProfileService);

  pushActivo = false;
  frases: any[] = [];
  frasesAbiertas = false;
  serviciosAbiertos = false;
  userId: string | null = null;
  nickname = '';

  get inicial(): string {
    if (this.nickname) return this.nickname.charAt(0).toUpperCase();
    if (this.userId) return this.userId.charAt(0).toUpperCase();
    return '?';
  }

  async ngOnInit() {
    this.userId = this.userProfile.currentUserId;
    const profile = this.userProfile.currentProfile;
    if (profile?.nickname) this.nickname = profile.nickname;
    this.pushActivo = !!this.pushService.getSavedToken();
    try {
      this.frases = await this.quotesService.getActivas(50);
    } catch { /* ignore */ }
  }

  togglePush() {
    if (this.pushActivo) {
      this.pushService.register();
    } else {
      this.pushService.unregister();
    }
  }

  abrirWeb() {
    window.open('https://psicologiaybienestar.netlify.app', '_blank');
  }

  abrirWhatsApp() {
    this.whatsApp.openChat('Hola, vengo desde la app de Psicología y Bienestar');
  }
}
