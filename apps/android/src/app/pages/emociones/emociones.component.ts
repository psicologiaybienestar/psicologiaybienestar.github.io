import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EmotionsService, EmotionCheckIn } from '@shared/services/emotions.service';
import { LocalEmotion } from '@shared/services/content-engine.service';

@Component({
  selector: 'app-emociones',
  standalone: true,
  imports: [IonicModule, FormsModule, DatePipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>¿Cómo te sientes?</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="page-intro">Selecciona tu estado emocional y haz seguimiento a tu bienestar</p>

      <div class="grid">
        @for (e of emociones; track e.id) {
          <button class="glass-card card-emoji" [class.selected]="seleccionada === e.id"
                  [style.--c]="e.color" (click)="seleccionar(e)">
            <ion-icon [name]="e.icon" class="emojii" [style.color]="e.color"></ion-icon>
            <span class="label">{{ e.nombre }}</span>
          </button>
        }
      </div>

      @if (seleccionada && emotionSel) {
        <div class="glass-card-strong form-block">
          <div class="sel-hint">
            <ion-icon [name]="emotionSel.icon" [style.color]="emotionSel.color" class="sel-icon"></ion-icon>
            <span>{{ emotionSel.nombre }}</span>
          </div>
          <p class="desc">{{ emotionSel.description }}</p>
          <ion-textarea [(ngModel)]="nota" placeholder="¿Qué provocó esta emoción?" autoGrow rows="2"
                        fill="outline" label="Nota (opcional)" labelPlacement="stacked"></ion-textarea>
          <ion-button expand="block" (click)="guardar()" [disabled]="guardando" class="ion-margin-top">
            @if (guardando) {
              <ion-spinner slot="start" />
              Guardando...
            } @else {
              Registrar emoción
            }
          </ion-button>
        </div>
      }

      <div class="section">
        <h2 class="section-title">Tu historial</h2>

        @if (historial.length === 0) {
          <div class="glass-card empty">
            <ion-icon name="happy-outline" class="empty-icon"></ion-icon>
            <p>Aún no has registrado emociones</p>
          </div>
        }

        <div class="timeline">
          @for (item of historial; track item.id || $index) {
            <div class="tl-item">
              <div class="tl-dot" [style.--c]="item.emotion_color"></div>
              <div class="glass-card tl-body">
                <div class="tl-head">
                  <ion-icon [name]="item.emotion_icon" class="tl-icon" [style.color]="item.emotion_color"></ion-icon>
                  <span class="tl-name">{{ item.emotion_name }}</span>
                  <span class="tl-date">{{ item.created_at | date:'dd/MM/yy HH:mm' }}</span>
                </div>
                @if (item.note) {
                  <p class="tl-note">{{ item.note }}</p>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </ion-content>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--pg-space-sm); margin-bottom: var(--pg-space-xl); }
    .card-emoji { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: var(--pg-space-lg) var(--pg-space-xs); border: 2px solid transparent; cursor: pointer; transition: var(--pg-transition); font-family: inherit; }
    .card-emoji:active { transform: scale(0.94); }
    .card-emoji.selected { border-color: var(--c); background: color-mix(in srgb, var(--c) 10%, white); box-shadow: 0 2px 12px color-mix(in srgb, var(--c) 25%, transparent); }
    .emojii { font-size: 30px; }
    .label { font-size: 11px; font-weight: 600; color: var(--ion-text-color); }

    .form-block { padding: var(--pg-space-lg); margin-bottom: var(--pg-space-xl); }
    .sel-hint { display: flex; align-items: center; gap: var(--pg-space-sm); font-size: 16px; font-weight: 600; margin-bottom: var(--pg-space-xs); }
    .sel-icon { font-size: 24px; }
    .desc { font-size: 13px; color: var(--ion-color-medium); margin: var(--pg-space-xs) 0 var(--pg-space-md); line-height: 1.4; }

    .section { margin-bottom: var(--pg-space-xl); }
    .empty { text-align: center; padding: var(--pg-space-xl); color: var(--ion-color-medium); font-size: 14px; }
    .empty-icon { font-size: 48px; margin-bottom: var(--pg-space-sm); opacity: 0.3; }

    .timeline { position: relative; padding-left: 20px; }
    .timeline::before { content: ''; position: absolute; left: 8px; top: 4px; bottom: 4px; width: 2px; background: linear-gradient(to bottom, var(--ion-color-primary), var(--ion-color-secondary), transparent); border-radius: 1px; }
    .tl-item { position: relative; padding-bottom: var(--pg-space-lg); }
    .tl-dot { position: absolute; left: -16px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--c, var(--ion-color-primary)) 80%, white), var(--c, var(--ion-color-primary))); border: 2px solid var(--ion-color-primary-contrast); box-shadow: 0 0 0 2px var(--c, var(--ion-color-primary)), 0 0 8px color-mix(in srgb, var(--c, var(--ion-color-primary)) 40%, transparent); }
    .tl-body { padding: var(--pg-space-sm) var(--pg-space-md); }
    .tl-head { display: flex; align-items: center; gap: 6px; margin-bottom: var(--pg-space-xs); }
    .tl-icon { font-size: 16px; }
    .tl-name { font-size: 14px; font-weight: 600; color: var(--ion-text-color); }
    .tl-date { font-size: 11px; color: var(--ion-color-medium); margin-left: auto; }
    .tl-note { font-size: 13px; color: var(--ion-color-medium); margin: 0; line-height: 1.4; }
  `,
})
export class EmocionesComponent implements OnInit {
  private emotionsService = inject(EmotionsService);

  emociones: LocalEmotion[] = [];
  seleccionada = '';
  emotionSel: LocalEmotion | null = null;
  nota = '';
  guardando = false;
  historial: EmotionCheckIn[] = [];

  async ngOnInit() {
    await this.emotionsService.init();
    this.emociones = this.emotionsService.getDailyOptions();
    this.historial = this.emotionsService.getHistory();
    if (this.historial.length === 0) {
      await this.emotionsService.syncFromSupabase();
      this.historial = this.emotionsService.getHistory();
    }
  }

  seleccionar(emotion: LocalEmotion) {
    if (this.seleccionada === emotion.id) {
      this.seleccionada = '';
      this.emotionSel = null;
    } else {
      this.seleccionada = emotion.id;
      this.emotionSel = emotion;
    }
  }

  async guardar() {
    if (!this.seleccionada) return;
    this.guardando = true;
    try {
      await this.emotionsService.checkIn(this.seleccionada, this.nota || undefined);
      this.seleccionada = '';
      this.emotionSel = null;
      this.nota = '';
      this.historial = this.emotionsService.getHistory();
    } catch { }
    this.guardando = false;
  }
}
