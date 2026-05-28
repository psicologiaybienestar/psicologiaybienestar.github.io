import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '@shared/components/app-icon.component';

@Component({
  selector: 'app-gratitude-game',
  standalone: true,
  imports: [IonicModule, FormsModule, AppIconComponent],
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
        <div class="header-icon-wrap">
          <app-icon name="heart-outline" class="main-icon"></app-icon>
        </div>
        <h2>Escribe 3 cosas por las que estas agradecido hoy</h2>
        <p class="hint">Concentrate en lo positivo, por pequeno que sea</p>
      </div>

      <div class="entries">
        @for (item of items; track $index) {
          <div class="entry-card" [class.filled]="item.text.trim().length > 0">
            <div class="entry-num">{{ $index + 1 }}</div>
            <ion-textarea [(ngModel)]="item.text" placeholder="Escribe aqui..." autoGrow rows="2"
                          fill="outline" class="entry-input"></ion-textarea>
          </div>
        }
      </div>

      @if (allFilled) {
        <ion-button expand="block" (click)="guardar()" class="save-btn gradient-primary">
          <app-icon name="checkmark-outline"></app-icon>
          Guardar y reflexionar
        </ion-button>
      }

      @if (saved) {
        <div class="saved-section animate-scaleIn">
          <div class="saved-icon-wrap">
            <app-icon name="checkmark-circle" class="saved-icon"></app-icon>
          </div>
          <p>Gracias por tomarte un momento para apreciar lo bueno.</p>
          <ion-button expand="block" fill="outline" (click)="reset()" class="reset-btn">Escribir de nuevo</ion-button>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .header-section { text-align: center; padding: 8px 0 28px; }
    .header-icon-wrap { width: 64px; height: 64px; border-radius: 50%; background: color-mix(in srgb, #ec4899 12%, white); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
    .main-icon { font-size: 32px; color: #ec4899; }
    .header-section h2 { font: var(--pg-font-heading); color: var(--ion-text-color); margin: 0 0 4px; }
    .hint { font: var(--pg-font-body); color: var(--ion-color-medium); margin: 0; }

    .entries { display: flex; flex-direction: column; gap: 12px; }
    .entry-card { display: flex; gap: 12px; align-items: flex-start; background: var(--ion-color-primary-contrast); border-radius: var(--pg-radius-md); padding: 12px; box-shadow: var(--pg-shadow-sm); border-left: 3px solid transparent; transition: var(--pg-transition-fast); }
    .entry-card.filled { border-left-color: #ec4899; background: color-mix(in srgb, #ec4899 4%, white); }
    .entry-num { width: 28px; height: 28px; border-radius: 50%; background: color-mix(in srgb, #ec4899 15%, white); color: #ec4899; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .entry-input { flex: 1; }

    .save-btn { --background: var(--pg-gradient-primary); --border-radius: var(--pg-radius-md); font-weight: 600; height: 48px; margin-top: 16px; }

    .saved-section { text-align: center; padding: 40px 0; }
    .saved-icon-wrap { width: 80px; height: 80px; border-radius: 50%; background: color-mix(in srgb, #10b981 12%, white); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .saved-icon { font-size: 44px; color: #10b981; }
    .saved-section p { font: var(--pg-font-body); color: var(--ion-color-medium); margin: 0 0 20px; }
    .reset-btn { --border-color: var(--ion-color-medium-shade); --color: var(--ion-color-medium); font-weight: 600; }
  `],
})
export class GratitudeGameComponent {
  items = [{ text: '' }, { text: '' }, { text: '' }];
  saved = false;

  get allFilled(): boolean { return this.items.every(i => i.text.trim().length > 0); }

  guardar() {
    const entries = this.items.map(i => i.text.trim());
    try {
      const history = JSON.parse(localStorage.getItem('pb_gratitude') || '[]');
      history.unshift({ date: new Date().toISOString(), entries });
      localStorage.setItem('pb_gratitude', JSON.stringify(history.slice(0, 50)));
    } catch { }
    this.saved = true;
  }

  reset() { this.items = [{ text: '' }, { text: '' }, { text: '' }]; this.saved = false; }
}