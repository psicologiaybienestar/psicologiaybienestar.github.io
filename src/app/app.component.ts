import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationsService } from './core/services/notifications.service';
import { UserProfileService } from './core/services/user-profile.service';
import { PushNotificationsService } from './core/services/push-notifications.service';
import { PlatformService } from './core/services/platform.service';

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
  private channel: any;

  ngOnInit() {
    this.userProfileService.init();

    if (this.platform.isAndroid) {
      setTimeout(() => this.pushService.register(), 1500);
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
