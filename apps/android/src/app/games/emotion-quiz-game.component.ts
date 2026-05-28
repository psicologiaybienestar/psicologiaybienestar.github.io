import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AppIconComponent } from '@shared/components/app-icon.component';
import { ContentEngineService, LocalEmotion } from '@shared/services/content-engine.service';

@Component({
  selector: 'app-emotion-quiz-game',
  standalone: true,
  imports: [IonicModule, AppIconComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Que Emocion es?</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <div class="game-stats">
          <span>Aciertos: {{ correctas }}/{{ total }}</span>
          <span>Racha: {{ racha }}</span>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (gameOver) {
        <div class="result animate-scaleIn">
          <div class="result-icon-wrap">
            <app-icon name="trophy-outline" class="trophy-icon"></app-icon>
          </div>
          <h2>Completado!</h2>
          <p class="result-score">{{ correctas }} de {{ total }} aciertos</p>
          @if (correctas === total) {
            <p class="result-msg">Conoces todas las emociones!</p>
          }
          <ion-button expand="block" (click)="startGame()" class="play-again-btn gradient-primary">
            <app-icon name="refresh-outline"></app-icon>
            Jugar de nuevo
          </ion-button>
        </div>
      } @else {
        <div class="question-section">
          <p class="q-label">Como se llama esta emocion?</p>
          <div class="q-emotion-wrap">
            <app-icon [name]="currentEmotion?.icon || ''" [style.color]="currentEmotion?.color" class="q-icon"></app-icon>
          </div>
        </div>

        <div class="options">
          @for (opt of options; track opt) {
            <button class="option-btn" [class.correct]="answered && opt === currentEmotion?.id"
                    [class.incorrect]="answered && opt === selectedOpt && opt !== currentEmotion?.id"
                    [disabled]="answered" (click)="answer(opt)">
              {{ getEmotionName(opt) }}
            </button>
          }
        </div>

        @if (answered) {
          <div class="feedback animate-slideUp">
            @if (selectedOpt === currentEmotion?.id) {
              <p class="fb-correct">Correcto!</p>
            } @else {
              <p class="fb-incorrect">Era: {{ currentEmotion?.nombre }}</p>
            }
            <ion-button expand="block" (click)="next()" class="next-btn gradient-primary">
              {{ isLast ? 'Ver resultado' : 'Siguiente' }}
            </ion-button>
          </div>
        }
      }
    </ion-content>
  `,
  styles: [`
    .game-stats { display: flex; justify-content: space-between; padding: 0 20px 10px; font-size: 13px; color: var(--ion-color-medium); font-weight: 500; }

    .question-section { text-align: center; padding: 16px 0 24px; }
    .q-label { font: var(--pg-font-body); color: var(--ion-color-medium); margin: 0 0 20px; }
    .q-emotion-wrap { display: flex; justify-content: center; padding: 24px; background: var(--ion-color-light); border-radius: var(--pg-radius-xl); margin: 0 auto; max-width: 200px; }
    .q-icon { font-size: 72px; }

    .options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .option-btn { padding: 16px 20px; border-radius: var(--pg-radius-md); border: 2px solid var(--ion-color-light-shade); background: var(--ion-color-primary-contrast); font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; text-align: left; box-shadow: var(--pg-shadow-sm); }
    .option-btn:active:not(:disabled) { transform: scale(0.97); }
    .option-btn.correct { border-color: #22c55e; background: color-mix(in srgb, #22c55e 10%, white); color: #22c55e; }
    .option-btn.incorrect { border-color: #ef4444; background: color-mix(in srgb, #ef4444 10%, white); color: #ef4444; }

    .feedback { text-align: center; padding: 16px 0; }
    .fb-correct { color: #22c55e; font-weight: 700; font-size: 18px; margin: 0 0 16px; }
    .fb-incorrect { color: #ef4444; font-weight: 700; font-size: 16px; margin: 0 0 16px; }
    .next-btn { --background: var(--pg-gradient-primary); --border-radius: var(--pg-radius-md); font-weight: 600; }

    .result { text-align: center; padding: 48px 0; }
    .result-icon-wrap { width: 80px; height: 80px; border-radius: 50%; background: color-mix(in srgb, #f59e0b 12%, white); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .trophy-icon { font-size: 44px; color: #f59e0b; }
    .result h2 { font: var(--pg-font-display); color: var(--ion-text-color); margin: 0 0 4px; }
    .result-score { font-size: 36px; font-weight: 700; margin: 0; color: var(--ion-color-primary); }
    .result-msg { font: var(--pg-font-body); color: var(--ion-color-medium); margin: 4px 0 20px; }
    .play-again-btn { --background: var(--pg-gradient-primary); --border-radius: var(--pg-radius-md); font-weight: 600; height: 48px; }
  `],
})
export class EmotionQuizGameComponent implements OnInit {
  private engine = inject(ContentEngineService);

  private allEmotions: LocalEmotion[] = [];
  private queue: LocalEmotion[] = [];
  private index = 0;

  currentEmotion: LocalEmotion | null = null;
  options: string[] = [];
  correctas = 0;
  total = 0;
  racha = 0;
  answered = false;
  selectedOpt = '';
  gameOver = false;

  get isLast(): boolean { return this.index >= this.queue.length - 1; }

  async ngOnInit() {
    await this.engine.init();
    this.allEmotions = this.engine.getEmotions();
    this.startGame();
  }

  startGame() {
    const shuffled = [...this.allEmotions].sort(() => Math.random() - 0.5);
    this.queue = shuffled.slice(0, 10);
    this.index = 0; this.correctas = 0; this.total = 0; this.racha = 0;
    this.answered = false; this.gameOver = false;
    this.showQuestion();
  }

  private showQuestion() {
    this.currentEmotion = this.queue[this.index];
    this.answered = false; this.selectedOpt = '';
    const correct = this.currentEmotion.id;
    const wrong = this.allEmotions.filter(e => e.id !== correct).sort(() => Math.random() - 0.5).slice(0, 3).map(e => e.id);
    this.options = [correct, ...wrong].sort(() => Math.random() - 0.5);
  }

  getEmotionName(id: string): string { return this.allEmotions.find(e => e.id === id)?.nombre || id; }

  answer(opt: string) {
    this.selectedOpt = opt; this.answered = true; this.total++;
    if (opt === this.currentEmotion?.id) { this.correctas++; this.racha++; } else { this.racha = 0; }
  }

  next() { if (this.isLast) { this.gameOver = true; return; } this.index++; this.showQuestion(); }
}