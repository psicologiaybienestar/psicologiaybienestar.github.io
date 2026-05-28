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
          <div class="hero-content">
            <div class="profile-logo-container">
              <img src="assets/icon/icon.png" alt="Logo" class="profile-logo" onerror="this.src='assets/icon/icon.png'">
            </div>
            
            @if (editandoNombre) {
              <div class="edit-name-row">
                <input type="text" [(ngModel)]="tempNickname" placeholder="Tu nombre..." class="edit-input" maxlength="25" (keyup.enter)="guardarNombre()">
                <button class="btn-save" (click)="guardarNombre()"><ion-icon name="checkmark-outline"></ion-icon></button>
                <button class="btn-cancel" (click)="editandoNombre = false"><ion-icon name="close-outline"></ion-icon></button>
              </div>
            } @else {
              <div class="name-row" (click)="editarNombre()">
                <h1 class="hero-title">{{ nickname || 'Invitado' }}</h1>
                <ion-icon name="pencil-outline" class="edit-icon"></ion-icon>
              </div>
            }
            <p class="hero-subtitle">Tu viaje al bienestar continúa</p>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Configuración</h2>
          <div class="card card-setting">
            <div class="setting-row">
              <div class="setting-icon soft-blue"><ion-icon name="notifications"></ion-icon></div>
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
                <div class="link-icon soft-purple"><ion-icon name="globe"></ion-icon></div>
                <div class="link-text">
                  <h3>Versión Web Extendida</h3>
                  <p>Accede a todos los artículos y admin</p>
                </div>
                <ion-icon name="chevron-forward" class="arrow"></ion-icon>
              </div>
            </div>
            <div class="card card-link" (click)="abrirWhatsApp()">
              <div class="link-row">
                <div class="link-icon soft-green"><ion-icon name="logo-whatsapp"></ion-icon></div>
                <div class="link-text">
                  <h3>Soporte vía WhatsApp</h3>
                  <p>Habla con nosotros directamente</p>
                </div>
                <ion-icon name="chevron-forward" class="arrow"></ion-icon>
              </div>
            </div>
            <div class="card card-link" (click)="mostrarServicios = !mostrarServicios">
              <div class="link-row">
                <div class="link-icon soft-orange"><ion-icon name="briefcase"></ion-icon></div>
                <div class="link-text">
                  <h3>Nuestros Servicios</h3>
                  <p>Terapia, talleres y más</p>
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
              <div class="service-pill">Orientación Vocacional</div>
            </div>
          }
        </section>

        <section class="section">
          <h2 class="section-title">Síguenos en Redes</h2>
          <div class="socials-row">
            <button class="social-btn btn-insta" (click)="abrirInstagram()" aria-label="Instagram">
              <ion-icon name="logo-instagram"></ion-icon>
              <span>Instagram</span>
            </button>
            <button class="social-btn btn-fb" (click)="abrirFacebook()" aria-label="Facebook">
              <ion-icon name="logo-facebook"></ion-icon>
              <span>Facebook</span>
            </button>
          </div>
        </section>

        <section class="section footer-section">
          <img src="assets/icon/icon.png" alt="Logo" class="footer-logo" onerror="this.style.display='none'">
          <h3 class="footer-brand">Psicología & Bienestar</h3>
          <p class="footer-desc">Tu compañero digital para la salud mental</p>
          
          <div class="legal-links">
            <button (click)="abrirPrivacidad()">Privacidad</button>
            <span class="dot">•</span>
            <button (click)="abrirTerminos()">Términos</button>
            <span class="dot">•</span>
            <button (click)="abrirAyuda()">Ayuda</button>
          </div>
          
          <p class="version">Versión 1.0.0</p>
          <p class="copyright">© 2026 Psicología & Bienestar</p>
        </section>

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page { background: #fafafa; min-height: 100%; font-family: var(--pg-font-body); }
    .hero-section { padding: 40px 24px 24px; text-align: center; }
    .hero-content { display: flex; flex-direction: column; align-items: center; }
    
    .profile-logo-container { width: 88px; height: 88px; border-radius: 28px; background: white; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 12px 32px rgba(98, 126, 255, 0.2); border: 2px solid #eff6ff; overflow: hidden; padding: 12px; }
    .profile-logo { width: 100%; height: 100%; object-fit: contain; }
    
    .name-row { display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; padding: 4px 12px; border-radius: 12px; transition: background 0.2s; margin-bottom: 4px; }
    .name-row:active { background: rgba(0,0,0,0.03); }
    .hero-title { font-size: 26px; font-weight: 800; color: #111827; margin: 0; }
    .edit-icon { color: #9ca3af; font-size: 18px; }
    
    .edit-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .edit-input { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 16px; font-size: 18px; font-weight: 700; color: #111827; outline: none; width: 180px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: border-color 0.2s; }
    .edit-input:focus { border-color: #627eff; }
    .btn-save { background: #10b981; color: white; border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
    .btn-cancel { background: #f3f4f6; color: #6b7280; border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    
    .hero-subtitle { font-size: 15px; color: #6b7280; margin: 0; }
    
    .section { padding: 0 24px 24px; }
    .section-title { font-size: 14px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px; padding-left: 4px; }
    
    .card { background: white; border-radius: 20px; padding: 16px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); border: 1px solid #f3f4f6; }
    .card-link { cursor: pointer; transition: transform 0.2s; }
    .card-link:active { transform: scale(0.98); }
    
    .setting-row, .link-row { display: flex; align-items: center; gap: 16px; }
    .setting-icon, .link-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    
    /* Soft colored icons */
    .soft-blue { background: #eff6ff; color: #3b82f6; }
    .soft-purple { background: #f5f3ff; color: #8b5cf6; }
    .soft-green { background: #ecfdf5; color: #10b981; }
    .soft-orange { background: #fffbeb; color: #f59e0b; }
    
    .setting-text, .link-text { flex: 1; }
    .setting-text h3, .link-text h3 { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 4px; }
    .setting-text p, .link-text p { font-size: 13px; color: #6b7280; margin: 0; }
    
    ion-toggle { --background: #e5e7eb; --background-checked: #10b981; }
    .arrow { color: #d1d5db; font-size: 20px; }
    
    .services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
    .service-pill { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #4b5563; }
    
    .socials-row { display: flex; gap: 12px; }
    .social-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 16px; border: none; font-size: 15px; font-weight: 700; color: white; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .social-btn:active { transform: scale(0.97); }
    .social-btn ion-icon { font-size: 20px; }
    .btn-insta { background: linear-gradient(135deg, #f58529, #dd2a7b 48%, #8134af); }
    .btn-fb { background: #1877f2; }
    
    .footer-section { text-align: center; padding-top: 24px; padding-bottom: 40px; display: flex; flex-direction: column; align-items: center; }
    .footer-logo { width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.9; border-radius: 12px; }
    .footer-brand { font-size: 15px; font-weight: 800; color: #374151; margin: 0 0 4px; }
    .footer-desc { font-size: 13px; color: #9ca3af; margin: 0 0 20px; }
    
    .legal-links { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; }
    .legal-links button { background: none; border: none; padding: 0; color: #6b7280; font-size: 13px; font-weight: 600; }
    .legal-links .dot { color: #d1d5db; font-size: 10px; }
    
    .version { font-size: 12px; color: #9ca3af; font-weight: 600; margin: 0 0 4px; }
    .copyright { font-size: 11px; color: #d1d5db; margin: 0; }
    
    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `]
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

  editandoNombre = false;
  tempNickname = '';

  async ngOnInit() {
    this.userId = this.userProfile.currentUserId || '';
    const profile = this.userProfile.currentProfile;
    if (profile?.nickname) this.nickname = profile.nickname;
    this.pushActivo = !!this.pushService.getSavedToken();
  }

  editarNombre() {
    this.tempNickname = this.nickname || '';
    this.editandoNombre = true;
  }

  async guardarNombre() {
    const newName = this.tempNickname.trim();
    if (newName) {
      await this.userProfile.updateProfile({ nickname: newName });
      this.nickname = newName;
    }
    this.editandoNombre = false;
  }

  togglePush() {
    if (this.pushActivo) this.pushService.register();
    else this.pushService.unregister();
  }

  abrirWeb() { window.open(this.webUrl, '_blank'); }
  abrirWhatsApp() { this.whatsApp.openChat('Hola, necesito información sobre los servicios de Psicología & Bienestar'); }
  abrirInstagram() { window.open('https://www.instagram.com/psicologiaybienestarcol/', '_blank'); }
  abrirFacebook() { window.open('https://www.facebook.com/profile.php?id=100063475598042', '_blank'); }
  abrirPrivacidad() { window.open(`${this.webUrl}/privacidad`, '_blank'); }
  abrirTerminos() { window.open(`${this.webUrl}/terminos`, '_blank'); }
  abrirAyuda() { window.open(`${this.webUrl}/contacto`, '_blank'); }
}
