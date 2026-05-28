import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AppIconComponent } from '@shared/components/app-icon.component';

@Component({
  selector: 'app-calm-count-game',
  standalone: true,
  imports: [IonicModule, AppIconComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Cuenta Calma</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="coming-soon">
        <app-icon name="calculator-outline" class="cs-icon"></app-icon>
        <h2>Cuenta Calma</h2>
        <p>Concéntrate en contar mientras te relajas. Próximamente.</p>
        <ion-button fill="outline" routerLink="/minijuegos">Volver</ion-button>
      </div>
    </ion-content>
  `,
  styles: `
    .coming-soon { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 300px; gap: 12px; }
    .cs-icon { font-size: 72px; color: #3b82f6; }
    .coming-soon h2 { font-size: 22px; font-weight: 700; margin: 0; }
    .coming-soon p { font-size: 14px; color: var(--ion-color-medium); margin: 0; }
  `,
})
export class CalmCountGameComponent {}
