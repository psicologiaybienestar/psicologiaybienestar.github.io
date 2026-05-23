import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationsService } from './core/services/notifications.service';
import { UserProfileService } from './core/services/user-profile.service';

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
  private channel: any;

  ngOnInit() {
    this.userProfileService.init();
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
