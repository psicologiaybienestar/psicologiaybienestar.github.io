import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-games-placeholder',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="placeholder">
        <ion-icon [name]="icon" class="ph-icon" [style.color]="color"></ion-icon>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
        <ion-button fill="outline" routerLink="/minijuegos">Volver a minijuegos</ion-button>
      </div>
    </ion-content>
  `,
  styles: `
    .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 300px; gap: 12px; }
    .ph-icon { font-size: 72px; }
    .placeholder h2 { font-size: 22px; font-weight: 700; margin: 0; }
    .placeholder p { font-size: 14px; color: var(--ion-color-medium); margin: 0; max-width: 280px; line-height: 1.5; }
  `,
})
export class GamesPlaceholderComponent {
  @Input() title = 'Próximamente';
  @Input() description = 'Este juego estará disponible pronto';
  @Input() icon = 'construct-outline';
  @Input() color = 'var(--ion-color-medium)';
}
