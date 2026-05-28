import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { AppIconComponent } from '@shared/components/app-icon.component';
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
  imports: [IonicModule, FormsModule, CommonModule, DatePipe, AppIconComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page">
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-icon-wrap"><app-icon name="heart" class="hero-icon"></app-icon></div>
            <h1 class="hero-title">Cómo te sientes</h1>
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
                <label>¿Qué provocó esta emoción? (Opcional)</label>
                <textarea [(ngModel)]="nota" placeholder="Escribe algo aquí..." rows="2"></textarea>
              </div>
              <button class="btn-primary btn-full" (click)="guardar()" [disabled]="guardando">
                @if (guardando) { <ion-spinner name="crescent"></ion-spinner> }
                @else { Registrar Emoción }
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
              <app-icon name="happy-outline"></app-icon>
              <p>Aún no has registrado emociones.</p>
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
                      <span class="tl-time">{{ item.created_at | date:'shortTime' }} • {{ item.created_at | date:'dd MMM' }}</span>
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
    .page { background: #fafafa; min-height: 100%; font-family: var(--pg-font-body); }
    .hero-section { padding: 40px 24px 20px; text-align: center; }
    .hero-content { display: flex; flex-direction: column; align-items: center; }
    .hero-icon-wrap { width: 64px; height: 64px; border-radius: 20px; background: #fff1f2; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.1); }
    .hero-icon { font-size: 32px; color: #e11d48; }
    .hero-title { font-size: 26px; font-weight: 800; color: #111827; margin: 0 0 4px; }
    .hero-subtitle { font-size: 15px; color: #6b7280; max-width: 280px; margin: 0; line-height: 1.5; }
    
    .section { padding: 0 24px 24px; }
    .section-title { font-size: 18px; font-weight: 800; color: #111827; margin: 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .count { background: #e5e7eb; color: #4b5563; padding: 2px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; }
    
    .card { background: #ffffff; border: 1px solid #f3f4f6; border-radius: 24px; padding: 20px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
    
    .emotion-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .emotion-card { display: flex; flex-direction: column; align-items: center; gap: 8px; min-height: 84px; padding: 14px 6px; background: white; border: 2px solid transparent; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
    .emotion-card.active { border-color: var(--c); background: color-mix(in srgb, var(--c) 5%, white); transform: scale(1.04); box-shadow: 0 8px 24px color-mix(in srgb, var(--c) 20%, transparent); }
    .emotion-card:active { transform: scale(0.96); }
    .emotion-icon { width: 40px; height: 40px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--c) 10%, white); color: var(--c); font-size: 26px; line-height: 1; }
    .emotion-name { font-size: 11px; font-weight: 600; color: #6b7280; text-align: center; line-height: 1.2; }
    .emotion-card.active .emotion-name { color: var(--c); font-weight: 800; }
    
    .card-detail { margin-top: 20px; animation: slideUp 0.3s ease; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .detail-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .detail-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; }
    .detail-row h3 { font-size: 18px; font-weight: 800; color: #1f2937; margin: 0 0 4px; }
    .detail-row p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4; }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em; }
    .form-group textarea { width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 14px; font-size: 15px; color: #111827; outline: none; transition: border-color 0.2s ease, background 0.2s ease; resize: vertical; }
    .form-group textarea:focus { border-color: #627eff; background: white; box-shadow: 0 0 0 3px rgba(98, 126, 255, 0.1); }
    
    .btn-primary { background: linear-gradient(135deg, #627eff 0%, #53c6e4 100%); color: white; border: none; padding: 16px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 20px rgba(98, 126, 255, 0.25); transition: transform 0.2s ease; }
    .btn-primary:active { transform: scale(0.98); }
    .btn-primary:disabled { opacity: 0.7; transform: none; }
    .btn-full { width: 100%; }
    
    .empty-state { text-align: center; padding: 40px 24px; color: #d1d5db; }
    .empty-state ion-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state p { font-size: 15px; color: #9ca3af; }
    
    .timeline { padding-left: 24px; position: relative; margin-top: 12px; }
    .timeline-item { position: relative; padding-bottom: 24px; }
    .timeline-item:last-child { padding-bottom: 0; }
    .timeline-item:last-child .timeline-line { display: none; }
    .timeline-line { position: absolute; left: -12px; top: 24px; bottom: 0; width: 2px; background: #e5e7eb; }
    .timeline-dot { position: absolute; left: -17px; top: 20px; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; z-index: 1; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
    
    .card-timeline { margin-bottom: 0; padding: 16px; }
    .tl-row { display: flex; align-items: center; gap: 12px; }
    .tl-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .tl-info h3 { font-size: 15px; font-weight: 800; color: #111827; margin: 0 0 2px; }
    .tl-time { font-size: 12px; color: #9ca3af; font-weight: 600; }
    .tl-note { margin-top: 12px; font-size: 14px; color: #4b5563; padding-top: 12px; border-top: 1px solid #f3f4f6; line-height: 1.5; }
    
    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `]
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
