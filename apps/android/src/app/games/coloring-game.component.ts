import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-coloring-game',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Colorear</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="coming-soon">
        <ion-icon name="color-palette-outline" class="cs-icon"></ion-icon>
        <h2>Colorear</h2>
        <p>Colorea mandalas y dibujos terapéuticos. Próximamente.</p>
        <ion-button fill="outline" routerLink="/minijuegos">Volver</ion-button>
      </div>
    </ion-content>
  `,
  styles: `
    .coming-soon { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 300px; gap: 12px; }
    .cs-icon { font-size: 72px; color: #10b981; }
    .coming-soon h2 { font-size: 22px; font-weight: 700; margin: 0; }
    .coming-soon p { font-size: 14px; color: var(--ion-color-medium); margin: 0; }
  `,
})
export class ColoringGameComponent {}
