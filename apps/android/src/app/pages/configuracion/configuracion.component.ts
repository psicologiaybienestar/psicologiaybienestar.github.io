import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppIconComponent } from '@shared/components/app-icon.component';
import { PushNotificationsService } from '@shared/services/push-notifications.service';
import { WhatsAppService } from '@shared/services/whatsapp.service';
import { UserProfileService } from '@shared/services/user-profile.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, AppIconComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page">
        <section class="hero-section">
          <div class="hero-content">
            <div class="profile-logo-container">
              <div class="avatar-gradient">
                <app-icon name="person-circle"></app-icon>
              </div>
            </div>
            
            @if (editandoNombre) {
              <div class="edit-name-container">
                <div class="edit-input-wrapper">
                  <app-icon name="person-outline"></app-icon>
                  <input type="text" [(ngModel)]="tempNickname" placeholder="Escribe tu nombre" class="edit-input" maxlength="25" (keyup.enter)="guardarNombre()" autofocus>
                </div>
                <div class="edit-actions">
                  <button class="btn-cancel" (click)="editandoNombre = false">Cancelar</button>
                  <button class="btn-save" (click)="guardarNombre()">Guardar</button>
                </div>
              </div>
            } @else {
              <div class="name-display">
                <h1 class="hero-title">{{ nickname || 'Invitado' }}</h1>
                <p class="hero-subtitle">Tu viaje al bienestar continúa</p>
                <button class="btn-edit-profile" (click)="editarNombre()">
                  <app-icon name="pencil-outline"></app-icon>
                  Editar perfil
                </button>
              </div>
            }
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Configuración</h2>
          <div class="card card-setting">
            <div class="setting-row">
              <div class="setting-icon soft-blue"><app-icon name="notifications"></app-icon></div>
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
                <div class="link-icon soft-purple"><app-icon name="globe"></app-icon></div>
                <div class="link-text">
                  <h3>Versión Web Extendida</h3>
                  <p>Accede a todos los artículos y admin</p>
                </div>
                <app-icon name="chevron-forward" class="arrow"></app-icon>
              </div>
            </div>
            <div class="card card-link" (click)="abrirWhatsApp()">
              <div class="link-row">
                <div class="link-icon soft-green"><app-icon name="logo-whatsapp"></app-icon></div>
                <div class="link-text">
                  <h3>Soporte vía WhatsApp</h3>
                  <p>Habla con nosotros directamente</p>
                </div>
                <app-icon name="chevron-forward" class="arrow"></app-icon>
              </div>
            </div>
            <div class="card card-link" (click)="mostrarServicios = !mostrarServicios">
              <div class="link-row">
                <div class="link-icon soft-orange"><app-icon name="briefcase"></app-icon></div>
                <div class="link-text">
                  <h3>Nuestros Servicios</h3>
                  <p>Terapia, talleres y más</p>
                </div>
                <app-icon [name]="mostrarServicios ? 'chevron-up' : 'chevron-down'" class="arrow"></app-icon>
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
            <button class="social-circle btn-insta" (click)="abrirInstagram()" aria-label="Instagram">
              <app-icon name="logo-instagram"></app-icon>
            </button>
            <button class="social-circle btn-fb" (click)="abrirFacebook()" aria-label="Facebook">
              <app-icon name="logo-facebook"></app-icon>
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
    
    .profile-logo-container { width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .avatar-gradient { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #627eff, #53c6e4); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(98,126,255,0.25); border: 3px solid white; }
    .avatar-gradient app-icon { font-size: 48px; color: white; }
    
    .name-display { display: flex; flex-direction: column; align-items: center; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    
    .hero-title { font-size: 26px; font-weight: 800; color: #111827; margin: 0 0 4px; }
    .hero-subtitle { font-size: 14px; color: #6b7280; margin: 0 0 16px; }
    
    .btn-edit-profile { background: white; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 999px; font-size: 14px; font-weight: 700; color: #4b5563; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s, box-shadow 0.2s; }
    .btn-edit-profile:active { transform: scale(0.96); box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
    .btn-edit-profile ion-icon { font-size: 16px; color: #9ca3af; }
    
    .edit-name-container { background: white; padding: 16px; border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid #f3f4f6; width: 100%; max-width: 320px; animation: fadeIn 0.3s ease; }
    .edit-input-wrapper { display: flex; align-items: center; gap: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 0 16px; margin-bottom: 12px; transition: border-color 0.2s; }
    .edit-input-wrapper:focus-within { border-color: #627eff; background: white; }
    .edit-input-wrapper ion-icon { color: #9ca3af; font-size: 18px; }
    .edit-input { background: none; border: none; padding: 14px 0; width: 100%; font-size: 16px; font-weight: 600; color: #111827; outline: none; }
    .edit-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .btn-cancel { background: #f3f4f6; color: #6b7280; border: none; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 14px; transition: background 0.2s; }
    .btn-cancel:active { background: #e5e7eb; }
    .btn-save { background: #10b981; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(16,185,129,0.2); transition: transform 0.2s; }
    .btn-save:active { transform: scale(0.96); }
    
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
    
    .socials-row { display: flex; gap: 16px; justify-content: center; padding: 8px 0; }
    .social-circle { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; color: white; font-size: 24px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer; }
    .social-circle:active { transform: scale(0.92); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
    .social-circle app-icon { font-size: 24px; }
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
    if (newName && newName !== this.nickname) {
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
