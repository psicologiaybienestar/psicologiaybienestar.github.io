import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-puzzle-game',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Rompecabezas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="coming-soon">
        <ion-icon name="image-outline" class="cs-icon"></ion-icon>
        <h2>Rompecabezas</h2>
        <p>Arma imágenes motivacionales. Próximamente.</p>
        <ion-button fill="outline" routerLink="/minijuegos">Volver</ion-button>
      </div>
    </ion-content>
  `,
  styles: `
    .coming-soon { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 300px; gap: 12px; }
    .cs-icon { font-size: 72px; color: #8b5cf6; }
    .coming-soon h2 { font-size: 22px; font-weight: 700; margin: 0; }
    .coming-soon p { font-size: 14px; color: var(--ion-color-medium); margin: 0; }
  `,
})
export class PuzzleGameComponent {}
