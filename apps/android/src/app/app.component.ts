import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PushNotificationsService } from '@shared/services/push-notifications.service';
import { UserProfileService } from '@shared/services/user-profile.service';
import { ScheduledNotificationsService } from '@shared/services/scheduled-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive],
})
export class AppComponent implements OnInit {
  private userProfileService = inject(UserProfileService);
  private pushService = inject(PushNotificationsService);
  private scheduledNotifications = inject(ScheduledNotificationsService);

  async ngOnInit() {
    await this.userProfileService.init();
    this.scheduledNotifications.scheduleDaily();
    setTimeout(() => {
      this.pushService.register();
    }, 1000);
  }
}
