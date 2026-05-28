import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { EmotionsService, EmotionCheckIn } from '@shared/services/emotions.service';
import { LocalEmotion } from '@shared/services/content-engine.service';

const EMOTION_EMOJI_MAP: Record<string, string> = {
  feliz: '😊', tranquilo: '😌', ansioso: '😰',
  triste: '😢', enojado: '😠', estresado: '😩',
  motivado: '💪', agradecido: '🙏', cansado: '😴',
  confundido: '🤔', esperanzado: '🌟', inseguro: '😟',
  frustrado: '😤', nostalgico: '🥹', orgulloso: '🥳',
  sorprendido: '😮', abrumado: '😫', sereno: '🧘',
  inspirado: '✨', agotado: '😵', optimista: '🌈',
  preocupado: '😣', relajado: '🛀', entusiasmado: '🤩',
  vulnerable: '🥺', equilibrado: '⚖️', solitario: '🫂',
  concentrado: '🎯', avergonzado: '😳', renovado: '🌅'
};

@Component({
  selector: 'app-emociones',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page">
        <section class="hero-section">
          <div class="hero-bg"></div>
          <div class="hero-content">
            <ion-icon name="heart" class="hero-icon"></ion-icon>
            <h1 class="hero-title">Como te sientes</h1>
            <p class="hero-subtitle">Registra tu estado emocional para ver tu progreso.</p>
          </div>
        </section>

        <section class="section">
          <div class="emotion-grid">
            @for (e of emociones; track e.id; let i = $index) {
              <button class="emotion-card" [class.active]="seleccionada === e.id"
                      [style.--c]="e.color" (click)="seleccionar(e)">
                <span class="emotion-icon">{{ getEmotionEmoji(e.id) }}</span>
                <span class="emotion-name">{{ e.nombre }}</span>
              </button>
            }
          </div>

          @if (seleccionada && emotionSel) {
            <div class="card card-detail">
              <div class="detail-row">
                <span class="detail-icon" [style.background]="emotionSel.color + '18'" [style.color]="emotionSel.color">
                  {{ getEmotionEmoji(emotionSel.id) }}
                </span>
                <div>
                  <h3>{{ emotionSel.nombre }}</h3>
                  <p>{{ emotionSel.description }}</p>
                </div>
              </div>
              <div class="form-group">
                <label>Que provoco esta emocion? (Opcional)</label>
                <textarea [(ngModel)]="nota" placeholder="Escribe algo aqui..." rows="2"></textarea>
              </div>
              <button class="btn-primary btn-full" (click)="guardar()" [disabled]="guardando">
                @if (guardando) { <ion-spinner name="crescent"></ion-spinner> }
                @else { Registrar Emocion }
              </button>
            </div>
          }
        </section>

        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Historial</h2>
            @if (historial.length > 0) {
              <span class="count">{{ historial.length }}</span>
            }
          </div>

          @if (historial.length === 0) {
            <div class="empty-state">
              <ion-icon name="happy-outline"></ion-icon>
              <p>Aun no has registrado emociones.</p>
            </div>
          }

          <div class="timeline">
            @for (item of historial; track item.created_at; let i = $index) {
              <div class="timeline-item">
                <div class="timeline-line"></div>
                <div class="timeline-dot" [style.background]="item.emotion_color"></div>
                <div class="card card-timeline">
                  <div class="tl-row">
                    <span class="tl-icon" [style.background]="(item.emotion_color || '#627eff') + '18'" [style.color]="item.emotion_color || '#627eff'">
                      {{ getEmotionEmoji(item.emotion_id || '') }}
                    </span>
                    <div class="tl-info">
                      <h3>{{ item.emotion_name }}</h3>
                      <span class="tl-time">{{ item.created_at | date:'shortTime' }} | {{ item.created_at | date:'dd MMM' }}</span>
                    </div>
                  </div>
                  @if (item.note) {
                    <p class="tl-note">{{ item.note }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </section>

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page { background: #ffffff; min-height: 100%; }
    .hero-section { position: relative; padding: 32px 20px 16px; overflow: hidden; text-align: center; }
    .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%); opacity: 0.06; pointer-events: none; }
    .hero-content { position: relative; }
    .hero-icon { font-size: 48px; color: var(--ion-color-primary); display: block; margin: 0 auto 8px; }
    .hero-title { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0 0 4px; }
    .hero-subtitle { font-size: 14px; color: #6b7280; max-width: 280px; margin: 0 auto; line-height: 1.5; }
    .section { padding: 8px 20px 20px; }
    .section-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .count { background: #f3f4f6; color: #6b7280; padding: 2px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; }
    .card { background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: 0 10px 24px rgba(31, 41, 55, 0.04); }
    .emotion-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .emotion-card { display: flex; flex-direction: column; align-items: center; gap: 7px; min-height: 82px; padding: 12px 6px; background: white; border: 2px solid #f3f4f6; border-radius: 16px; transition: all 0.2s; }
    .emotion-card.active { border-color: var(--c); background: color-mix(in srgb, var(--c) 5%, white); transform: scale(1.05); }
    .emotion-icon { width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--c) 12%, white); color: var(--c); font-size: 24px; line-height: 1; }
    .emotion-name { font-size: 10px; font-weight: 700; color: #6b7280; text-align: center; line-height: 1.1; }
    .emotion-card.active .emotion-name { color: var(--c); font-weight: 700; }
    .card-detail { margin-top: 16px; }
    .detail-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .detail-icon { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 25px; line-height: 1; flex-shrink: 0; }
    .detail-row h3 { font-size: 17px; font-weight: 700; color: #1f2937; margin: 0; }
    .detail-row p { font-size: 12px; color: #6b7280; margin: 2px 0 0; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px; }
    .form-group textarea { width: 100%; background: white; border: 1px solid #f3f4f6; border-radius: 10px; padding: 10px; font-size: 14px; color: #1f2937; outline: none; }
    .btn-primary { background: var(--ion-color-primary); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; }
    .btn-full { width: 100%; }
    .empty-state { text-align: center; padding: 32px; color: #d1d5db; }
    .empty-state ion-icon { font-size: 40px; margin-bottom: 8px; }
    .empty-state p { font-size: 14px; color: #9ca3af; }
    .timeline { padding-left: 20px; position: relative; }
    .timeline-item { position: relative; padding-bottom: 20px; }
    .timeline-line { position: absolute; left: -14px; top: 0; bottom: 0; width: 2px; background: #f3f4f6; }
    .timeline-dot { position: absolute; left: -20px; top: 18px; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; z-index: 1; box-shadow: 0 0 0 3px rgba(98, 126, 255, 0.08); }
    .card-timeline { margin-bottom: 0; }
    .tl-row { display: flex; align-items: center; gap: 10px; }
    .tl-icon { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; line-height: 1; flex-shrink: 0; }
    .tl-info h3 { font-size: 14px; font-weight: 700; color: #1f2937; margin: 0; }
    .tl-time { font-size: 10px; color: #9ca3af; font-weight: 600; }
    .tl-note { margin-top: 10px; font-size: 12px; color: #6b7280; padding-top: 10px; border-top: 1px solid #f3f4f6; }
    .bottom-spacer { height: 90px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `],
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

  getEmotionEmoji(id: string): string {
    return EMOTION_EMOJI_MAP[id] || '🫶';
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
