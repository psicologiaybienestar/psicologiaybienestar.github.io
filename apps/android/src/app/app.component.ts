import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterOutlet } from '@angular/router';
import { PushNotificationsService } from '@shared/services/push-notifications.service';
import { UserProfileService } from '@shared/services/user-profile.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule, RouterOutlet],
})
export class AppComponent implements OnInit {
  private userProfileService = inject(UserProfileService);
  private pushService = inject(PushNotificationsService);

  async ngOnInit() {
    await this.userProfileService.init();
    setTimeout(() => {
      this.pushService.register();
    }, 1000);
  }
}
