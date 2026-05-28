import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-minijuegos',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page gradient-bg">
        <div class="content-wrapper">
          <div class="illustration-container">
            <div class="icon-circle">
              <ion-icon name="game-controller"></ion-icon>
            </div>
            <!-- decorative sparkles -->
            <ion-icon name="sparkles" class="sparkle s1"></ion-icon>
            <ion-icon name="star" class="sparkle s2"></ion-icon>
            <ion-icon name="planet" class="sparkle s3"></ion-icon>
          </div>
          
          <h1 class="title">Próximamente</h1>
          <p class="subtitle">Este apartado está en desarrollo.</p>
          <p class="description">Estamos trabajando para traerte experiencias interactivas que te ayudarán a relajarte, aprender y divertirte.</p>
        </div>

        <div class="support-card glass-card-strong">
          <div class="support-header">
            <div class="support-icon"><ion-icon name="settings"></ion-icon></div>
            <div class="support-text">
              <h3>Apoya el desarrollo de la app</h3>
              <p>Tu apoyo nos ayuda a seguir mejorando y creando nuevas herramientas para ti.</p>
            </div>
          </div>
          <button class="btn-support">
            <ion-icon name="heart-outline"></ion-icon> Apoyar con compra
          </button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page { min-height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 40px 24px; position: relative; overflow: hidden; }
    .gradient-bg { background: linear-gradient(135deg, #627eff 0%, #a78bfa 100%); color: white; }
    
    /* Decorative background blobs */
    .page::before { content: ''; position: absolute; top: -100px; left: -100px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); pointer-events: none; }
    .page::after { content: ''; position: absolute; bottom: 20%; right: -150px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); pointer-events: none; }

    .content-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 2; margin-top: -60px; }
    
    .illustration-container { position: relative; margin-bottom: 32px; }
    .icon-circle { width: 100px; height: 100px; background: rgba(255,255,255,0.25); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 32px; display: flex; align-items: center; justify-content: center; font-size: 56px; color: white; box-shadow: 0 16px 40px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.4); transform: rotate(-5deg); }
    
    .sparkle { position: absolute; color: white; opacity: 0.9; }
    .s1 { top: -10px; right: -25px; font-size: 28px; animation: float 3s ease-in-out infinite; }
    .s2 { bottom: 10px; left: -20px; font-size: 18px; animation: float 4s ease-in-out infinite reverse; }
    .s3 { top: 50px; left: -30px; font-size: 24px; opacity: 0.6; animation: float 3.5s ease-in-out infinite; }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .title { font-size: 36px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.5px; }
    .subtitle { font-size: 18px; font-weight: 600; opacity: 0.95; margin: 0 0 16px; }
    .description { font-size: 15px; line-height: 1.6; opacity: 0.85; max-width: 280px; margin: 0; }

    .support-card { padding: 20px; text-align: left; position: relative; z-index: 2; margin-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
    .support-header { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
    .support-icon { width: 48px; height: 48px; border-radius: 16px; background: #eff6ff; color: #627eff; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .support-text h3 { font-size: 15px; font-weight: 800; color: #1f2937; margin: 0 0 4px; }
    .support-text p { font-size: 13px; color: #6b7280; line-height: 1.4; margin: 0; }
    
    .btn-support { width: 100%; background: #8b5cf6; color: white; border: none; padding: 16px; border-radius: 16px; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3); transition: transform 0.2s; }
    .btn-support:active { transform: scale(0.98); }
  `]
})
export class MinijuegosComponent {}
