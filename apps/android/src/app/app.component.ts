import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PushNotificationsService } from '@shared/services/push-notifications.service';
import { UserProfileService } from '@shared/services/user-profile.service';
import { ScheduledNotificationsService } from '@shared/services/scheduled-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent implements OnInit {
  private userProfileService = inject(UserProfileService);
  private pushService = inject(PushNotificationsService);
  private scheduledNotifications = inject(ScheduledNotificationsService);

  async ngOnInit() {
    await this.userProfileService.init();
    await this.scheduledNotifications.scheduleDaily();
    setTimeout(() => {
      this.pushService.register();
    }, 1000);
  }
}
