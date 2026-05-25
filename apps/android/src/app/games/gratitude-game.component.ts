import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gratitude-game',
  standalone: true,
  imports: [IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Diario de Gratitud</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="header-section">
        <ion-icon name="heart-outline" class="main-icon"></ion-icon>
        <h2>Escribe 3 cosas por las que estás agradecido hoy</h2>
        <p class="hint">Concéntrate en lo positivo, por pequeño que sea</p>
      </div>

      <div class="entries">
        @for (item of items; track $index) {
          <div class="entry-card" [class.filled]="item.text.trim().length > 0">
            <div class="entry-num">{{ $index + 1 }}</div>
            <ion-textarea [(ngModel)]="item.text" [placeholder]="'Escribe aquí...'" autoGrow rows="2"
                          fill="outline" class="entry-input"></ion-textarea>
          </div>
        }
      </div>

      @if (allFilled) {
        <ion-button expand="block" (click)="guardar()" class="ion-margin-top">
          <ion-icon slot="start" name="checkmark-outline"></ion-icon>
          Guardar y reflexionar
        </ion-button>
      }

      @if (saved) {
        <div class="saved-section">
          <ion-icon name="checkmark-circle" class="saved-icon"></ion-icon>
          <p>Gracias por tomarte un momento para apreciar lo bueno.</p>
          <ion-button expand="block" fill="outline" (click)="reset()">Escribir de nuevo</ion-button>
        </div>
      }
    </ion-content>
  `,
  styles: `
    .header-section { text-align: center; padding: 8px 0 24px; }
    .main-icon { font-size: 48px; color: #ec4899; margin-bottom: 8px; }
    .header-section h2 { font-size: 18px; font-weight: 700; margin: 0 0 4px; color: var(--ion-text-color); }
    .hint { font-size: 13px; color: var(--ion-color-medium); margin: 0; }

    .entries { display: flex; flex-direction: column; gap: 12px; }
    .entry-card { display: flex; gap: 12px; align-items: flex-start; background: var(--ion-color-primary-contrast); border-radius: 14px; padding: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .entry-card.filled { border-left: 3px solid #ec4899; }
    .entry-num { width: 28px; height: 28px; border-radius: 50%; background: color-mix(in srgb, #ec4899 15%, white); color: #ec4899; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .entry-input { flex: 1; }

    .saved-section { text-align: center; padding: 40px 0; }
    .saved-icon { font-size: 56px; color: #22c55e; margin-bottom: 12px; }
    .saved-section p { font-size: 14px; color: var(--ion-color-medium); margin: 0 0 20px; }
  `,
})
export class GratitudeGameComponent {
  items = [
    { text: '' },
    { text: '' },
    { text: '' },
  ];
  saved = false;

  get allFilled(): boolean {
    return this.items.every(i => i.text.trim().length > 0);
  }

  guardar() {
    const entries = this.items.map(i => i.text.trim());
    try {
      const history = JSON.parse(localStorage.getItem('pb_gratitude') || '[]');
      history.unshift({ date: new Date().toISOString(), entries });
      localStorage.setItem('pb_gratitude', JSON.stringify(history.slice(0, 50)));
    } catch { }
    this.saved = true;
  }

  reset() {
    this.items = [{ text: '' }, { text: '' }, { text: '' }];
    this.saved = false;
  }
}
