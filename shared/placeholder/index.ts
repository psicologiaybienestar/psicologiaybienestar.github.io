import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-placeholder',
  template: `<ion-content class="ion-padding"><h1>Placeholder</h1><p>Android component coming soon</p></ion-content>`,
  standalone: true,
  imports: [IonicModule],
})
export class PlaceholderComponent {}
