import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PushNotificationsService } from '@shared/services/push-notifications.service';
import { WhatsAppService } from '@shared/services/whatsapp.service';
import { UserProfileService } from '@shared/services/user-profile.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page">
        <section class="hero-section">
          <div class="hero-bg"></div>
          <div class="hero-content">
            <div class="profile-circle">{{ inicial }}</div>
            <h1 class="hero-title">{{ nickname || 'Invitado' }}</h1>
            <p class="hero-subtitle">Tu viaje al bienestar continua</p>
          </div>
        </section>

        <section class="section">
          <div class="card card-about">
            <div class="about-row">
              <div class="about-logo"><img src="assets/img/logo.png" alt="Psicologia y Bienestar" /></div>
              <div>
                <h3>Psicologia & Bienestar</h3>
                <p>Tu companero digital para la salud mental</p>
              </div>
            </div>
            <p class="about-desc">Nuestra app te brinda herramientas basadas en evidencia para manejar tus emociones, mejorar tu resiliencia y encontrar la paz interior.</p>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Configuracion</h2>
          <div class="card card-setting">
            <div class="setting-row">
              <div class="setting-icon icon-blue"><ion-icon name="notifications-outline"></ion-icon></div>
              <div class="setting-text">
                <h3>Notificaciones Push</h3>
                <p>Recibe recordatorios y frases diarias</p>
              </div>
              <ion-toggle [(ngModel)]="pushActivo" (ionChange)="togglePush()"></ion-toggle>
            </div>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Recursos y Ayuda</h2>
          <div class="links-list">
            <div class="card card-link" (click)="abrirWeb()">
              <div class="link-row">
                <div class="link-icon icon-primary"><ion-icon name="globe-outline"></ion-icon></div>
                <div class="link-text">
                  <h3>Version Web Extendida</h3>
                  <p>Accede a todos los articulos y admin</p>
                </div>
                <ion-icon name="chevron-forward" class="arrow"></ion-icon>
              </div>
            </div>
            <div class="card card-link" (click)="abrirWhatsApp()">
              <div class="link-row">
                <div class="link-icon icon-whatsapp"><ion-icon name="logo-whatsapp"></ion-icon></div>
                <div class="link-text">
                  <h3>Soporte via WhatsApp</h3>
                  <p>Habla con nosotros directamente</p>
                </div>
                <ion-icon name="chevron-forward" class="arrow"></ion-icon>
              </div>
            </div>
            <div class="card card-link" (click)="mostrarServicios = !mostrarServicios">
              <div class="link-row">
                <div class="link-icon icon-services"><ion-icon name="briefcase-outline"></ion-icon></div>
                <div class="link-text">
                  <h3>Nuestros Servicios</h3>
                  <p>Terapia, talleres y mas</p>
                </div>
                <ion-icon [name]="mostrarServicios ? 'chevron-up' : 'chevron-down'" class="arrow"></ion-icon>
              </div>
            </div>
          </div>

          @if (mostrarServicios) {
            <div class="services-grid">
              <div class="service-pill">Terapia Individual</div>
              <div class="service-pill">Terapia de Pareja</div>
              <div class="service-pill">Talleres Mindfulness</div>
              <div class="service-pill">Orientacion Vocacional</div>
            </div>
          }
        </section>

        <section class="section">
          <h2 class="section-title">Siguenos</h2>
          <div class="socials-row">
            <button class="social-btn instagram" (click)="abrirInstagram()" aria-label="Instagram"><ion-icon name="logo-instagram"></ion-icon></button>
            <button class="social-btn facebook" (click)="abrirFacebook()" aria-label="Facebook"><ion-icon name="logo-facebook"></ion-icon></button>
          </div>
        </section>

        <section class="section footer-text">
          <p class="version">Version 1.0.0</p>
          <div class="legal">
            <button (click)="abrirPrivacidad()">Privacidad</button>
            <span>|</span>
            <button (click)="abrirTerminos()">Terminos</button>
            <span>|</span>
            <button (click)="abrirAyuda()">Ayuda</button>
          </div>
          <p class="copyright">2026 Psicologia & Bienestar</p>
        </section>

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page { background: #ffffff; min-height: 100%; }
    .hero-section { position: relative; padding: 32px 20px 16px; overflow: hidden; text-align: center; }
    .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%); opacity: 0.06; pointer-events: none; }
    .hero-content { position: relative; }
    .profile-circle { width: 56px; height: 56px; border-radius: 16px; background: var(--pg-gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800; margin: 0 auto 12px; }
    .hero-title { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0 0 4px; }
    .hero-subtitle { font-size: 14px; color: #6b7280; max-width: 280px; margin: 0 auto; line-height: 1.5; }
    .section { padding: 8px 20px 20px; }
    .section-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 12px; }
    .card { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 14px; padding: 16px; margin-bottom: 10px; }
    .card-about { }
    .about-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .about-logo { width: 48px; height: 48px; border-radius: 14px; background: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; border: 1px solid #eef2ff; box-shadow: 0 8px 18px rgba(98, 126, 255, 0.12); }
    .about-logo img { width: 100%; height: 100%; object-fit: contain; padding: 4px; display: block; }
    .about-row h3 { font-size: 15px; font-weight: 700; color: #1f2937; margin: 0; }
    .about-row p { font-size: 11px; color: #6b7280; margin: 1px 0 0; }
    .about-desc { font-size: 13px; color: #6b7280; line-height: 1.5; margin: 0; }
    .card-setting { }
    .setting-row { display: flex; align-items: center; gap: 12px; }
    .setting-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; flex-shrink: 0; }
    .icon-blue { background: #4a69bd; }
    .setting-text { flex: 1; }
    .setting-text h3 { font-size: 14px; font-weight: 700; color: #1f2937; margin: 0; }
    .setting-text p { font-size: 11px; color: #6b7280; margin: 1px 0 0; }
    .links-list { }
    .card-link { cursor: pointer; }
    .link-row { display: flex; align-items: center; gap: 12px; }
    .link-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; flex-shrink: 0; }
    .icon-primary { background: #627eff; }
    .icon-whatsapp { background: #25d366; }
    .icon-services { background: #4a69bd; }
    .link-text { flex: 1; }
    .link-text h3 { font-size: 14px; font-weight: 700; color: #1f2937; margin: 0; }
    .link-text p { font-size: 11px; color: #6b7280; margin: 1px 0 0; }
    .arrow { color: #d1d5db; font-size: 18px; }
    .services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 4px; }
    .service-pill { background: #f3f4f6; border-radius: 10px; padding: 10px; text-align: center; font-size: 11px; font-weight: 700; color: #4b5563; }
    .socials-row { display: flex; gap: 16px; justify-content: center; align-items: center; }
    .social-btn { width: 54px; height: 54px; border-radius: 18px; border: none; display: flex; align-items: center; justify-content: center; font-size: 26px; color: white; box-shadow: 0 12px 24px rgba(31, 41, 55, 0.12); }
    .social-btn.instagram { background: linear-gradient(135deg, #f58529, #dd2a7b 48%, #8134af); }
    .social-btn.facebook { background: #1877f2; }
    .footer-text { text-align: center; }
    .version { font-size: 12px; color: #9ca3af; font-weight: 600; margin: 0; }
    .legal { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; color: #d1d5db; margin: 8px 0; }
    .legal button { border: none; background: transparent; padding: 4px 0; color: var(--ion-color-primary); font-size: 11px; font-weight: 700; }
    .copyright { font-size: 10px; color: #9ca3af; }
    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `],
})
export class ConfiguracionComponent implements OnInit {
  private pushService = inject(PushNotificationsService);
  private whatsApp = inject(WhatsAppService);
  private userProfile = inject(UserProfileService);

  pushActivo = false;
  nickname = '';
  userId = '';
  mostrarServicios = false;
  private readonly webUrl = 'https://psicologiaybienestar.netlify.app';

  get inicial(): string {
    return (this.nickname || this.userId || '?').charAt(0).toUpperCase();
  }

  async ngOnInit() {
    this.userId = this.userProfile.currentUserId || '';
    const profile = this.userProfile.currentProfile;
    if (profile?.nickname) this.nickname = profile.nickname;
    this.pushActivo = !!this.pushService.getSavedToken();
  }

  togglePush() {
    if (this.pushActivo) this.pushService.register();
    else this.pushService.unregister();
  }

  abrirWeb() {
    window.open(this.webUrl, '_blank');
  }

  abrirWhatsApp() {
    this.whatsApp.openChat('Hola, necesito informacion sobre los servicios de Psicologia & Bienestar');
  }

  abrirInstagram() {
    window.open('https://www.instagram.com/psicologiaybienestarcol/', '_blank');
  }

  abrirFacebook() {
    window.open('https://www.facebook.com/profile.php?id=100063475598042', '_blank');
  }

  abrirPrivacidad() {
    window.open(`${this.webUrl}/privacidad`, '_blank');
  }

  abrirTerminos() {
    window.open(`${this.webUrl}/terminos`, '_blank');
  }

  abrirAyuda() {
    window.open(`${this.webUrl}/contacto`, '_blank');
  }
}
