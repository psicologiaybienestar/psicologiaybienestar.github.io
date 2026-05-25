import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SwUpdate } from '@angular/service-worker';
import { NotificationsService } from './core/services/notifications.service';
import { UserProfileService } from './core/services/user-profile.service';
import { PushNotificationsService } from './core/services/push-notifications.service';
import { PlatformService } from './core/services/platform.service';
import { ContentEngineService } from '@shared/services/content-engine.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private notificationsService = inject(NotificationsService);
  private userProfileService = inject(UserProfileService);
  private pushService = inject(PushNotificationsService);
  private platform = inject(PlatformService);
  private swUpdate = inject(SwUpdate, { optional: true });
  private contentEngine = inject(ContentEngineService);
  private channel: any;

  async ngOnInit() {
    await this.userProfileService.init();
    this.contentEngine.init();

    // Auto-update service worker (web y Android)
    const sw = this.swUpdate;
    if (sw?.isEnabled) {
      sw.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          console.log('[UPDATE] Nueva versión disponible — actualizando...');
          sw.activateUpdate().then(() => document.location.reload());
        }
      });
      sw.checkForUpdate();
      setInterval(() => sw.checkForUpdate(), 30 * 60 * 1000);
    }

    if (this.platform.isAndroid) {
      setTimeout(() => {
        this.pushService.register().then(ok => {
          if (ok) console.log('[OK] Push auto-registrado');
          else console.warn('[WARN] Push no se pudo registrar automáticamente');
        });
      }, 1000);
    }

    this.channel = this.notificationsService.subscribeToAllChanges((table, data) => {
      if (!data || typeof data !== 'object') return;
      const item = data as any;
      const title = item.titulo || item.texto || item.quote || item.emotion_name || 'Novedad';
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Psicología & Bienestar', {
          body: `Nuevo contenido: ${title}`,
          icon: '/assets/img/logo.png',
        });
      }
    });
  }

  ngOnDestroy() {
    this.channel?.unsubscribe();
  }
}
