import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PushNotificationsService } from '@shared/services/push-notifications.service';
import { UserProfileService } from '@shared/services/user-profile.service';
import { ScheduledNotificationsService } from '@shared/services/scheduled-notifications.service';
import { EventosService } from '@shared/services/eventos.service';
import { addIcons } from 'ionicons';
import {
  chevronForward, chevronUp, chevronDown,
  searchOutline, closeCircle, closeOutline, addOutline, play,
  leaf, leafOutline, heart, heartOutline, star, starOutline, sparkles, planet,
  happyOutline,
  calendar, calendarOutline, calendarClearOutline, timeOutline,
  chatbubble, chatbubblesOutline, bulbOutline,
  globe, globeOutline, locationOutline, linkOutline,
  logoWhatsapp, logoInstagram, logoFacebook,
  checkmarkDoneCircle, checkmarkCircle,
  documentTextOutline,
  pencilOutline, personOutline, mailOutline, phonePortraitOutline,
  briefcase, settings, notifications, bookmarkOutline, peopleOutline,
  gameController, calculatorOutline, colorPaletteOutline,
  trophyOutline, helpOutline, imageOutline, handLeftOutline, alertCircleOutline,
} from 'ionicons/icons';

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
  private eventosService = inject(EventosService);

  constructor() {
    addIcons({
      'chevron-forward': chevronForward,
      'chevron-up': chevronUp,
      'chevron-down': chevronDown,
      'search-outline': searchOutline,
      'close-circle': closeCircle,
      'close-outline': closeOutline,
      'add-outline': addOutline,
      play,
      leaf,
      'leaf-outline': leafOutline,
      heart,
      'heart-outline': heartOutline,
      star,
      'star-outline': starOutline,
      sparkles,
      planet,
      'happy-outline': happyOutline,
      calendar,
      'calendar-outline': calendarOutline,
      'calendar-clear-outline': calendarClearOutline,
      'time-outline': timeOutline,
      chatbubble,
      'bulb-outline': bulbOutline,
      globe,
      'globe-outline': globeOutline,
      'location-outline': locationOutline,
      'link-outline': linkOutline,
      'logo-whatsapp': logoWhatsapp,
      'logo-instagram': logoInstagram,
      'logo-facebook': logoFacebook,
      'checkmark-done-circle': checkmarkDoneCircle,
      'checkmark-circle': checkmarkCircle,
      'document-text-outline': documentTextOutline,
      'pencil-outline': pencilOutline,
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'phone-portrait-outline': phonePortraitOutline,
      briefcase,
      settings,
      notifications,
      'bookmark-outline': bookmarkOutline,
      'people-outline': peopleOutline,
      'game-controller': gameController,
      'chatbubbles-outline': chatbubblesOutline,
      'calculator-outline': calculatorOutline,
      'color-palette-outline': colorPaletteOutline,
      'trophy-outline': trophyOutline,
      'help-outline': helpOutline,
      'image-outline': imageOutline,
      'hand-left-outline': handLeftOutline,
      'alert-circle-outline': alertCircleOutline,
    });
  }

  async ngOnInit() {
    await this.userProfileService.init();

    this.eventosService.autoFinalize();

    setTimeout(async () => {
      await this.pushService.register();
      await this.scheduledNotifications.scheduleDaily();
    }, 1000);
  }
}
