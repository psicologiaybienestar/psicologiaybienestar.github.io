import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PushNotificationsService } from '@shared/services/push-notifications.service';

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
      <ion-list>
        <ion-list-header>
          <ion-label>Notificaciones</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-icon name="notifications" slot="start" color="primary" />
          <ion-label>Notificaciones push</ion-label>
          <ion-toggle [(ngModel)]="pushActivo" (ionChange)="togglePush()" />
        </ion-item>
      </ion-list>

      <ion-list class="ion-padding-top">
        <ion-list-header>
          <ion-label>Información</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-icon name="information-circle" slot="start" color="primary" />
          <ion-label>
            <h2>Psicología & Bienestar</h2>
            <p>Versión 1.0.0</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon name="globe" slot="start" color="primary" />
          <ion-label>
            <h2>Versión web</h2>
            <p>Abrir en navegador</p>
          </ion-label>
          <ion-button fill="clear" slot="end" (click)="abrirWeb()">
            <ion-icon name="open" slot="icon-only" />
          </ion-button>
        </ion-item>
      </ion-list>

      <div class="ion-padding-top ion-text-center">
        <p class="copy">&copy; 2026 Psicología &amp; Bienestar</p>
      </div>
    </ion-content>
  `,
  styles: `
    .copy { font-size: 12px; color: var(--ion-color-medium); }
  `,
})
export class ConfiguracionComponent {
  private pushService = inject(PushNotificationsService);
  pushActivo = false;

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
}
