import { Component, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-reaction-game',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Reflejos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="reset()">
            <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <div class="game-stats">
          <span>Puntaje: {{ score }}</span>
          <span>Tiempo: {{ tiempoMs }}ms</span>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="game-area" (click)="onAreaClick()">
        @if (gameState === 'waiting') {
          <div class="state-msg">
            <ion-icon name="hand-left-outline" class="state-icon"></ion-icon>
            <p>Toca cuando el circulo se ponga verde</p>
            <ion-button (click)="startRound()" class="start-btn gradient-primary">Comenzar</ion-button>
          </div>
        } @else if (gameState === 'countdown') {
          <div class="state-msg">
            <p class="wait-text">Espera...</p>
          </div>
        } @else if (gameState === 'ready') {
          <div class="target" [style.--c]="targetColor" (click)="onTargetClick(); $event.stopPropagation()">
            <ion-icon [name]="targetIcon" class="target-icon"></ion-icon>
          </div>
        } @else if (gameState === 'too-soon') {
          <div class="state-msg error">
            <ion-icon name="alert-circle-outline" class="error-icon"></ion-icon>
            <p>Muy pronto! Espera al verde</p>
          </div>
        } @else if (gameState === 'result') {
          <div class="state-msg">
            <ion-icon name="time-outline" class="time-icon"></ion-icon>
            <p class="result-ms">{{ lastTime }}ms</p>
            <p class="result-label">{{ resultLabel }}</p>
            <ion-button (click)="startRound()" class="start-btn gradient-primary">Siguiente</ion-button>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .game-stats { display: flex; justify-content: space-between; padding: 0 20px 10px; font-size: 13px; color: var(--ion-color-medium); font-weight: 500; }

    .game-area { display: flex; align-items: center; justify-content: center; min-height: 420px; padding: 20px; }

    .state-msg { text-align: center; }
    .state-msg p { font: var(--pg-font-body); color: var(--ion-color-medium); margin: 0 0 20px; }
    .state-msg.error p { color: #ef4444; }
    .wait-text { font-size: 20px; font-weight: 600; }

    .state-icon { font-size: 52px; color: var(--ion-color-primary); margin-bottom: 16px; display: block; }
    .start-btn { --background: var(--pg-gradient-primary); --border-radius: var(--pg-radius-md); font-weight: 600; }

    .target { width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--c) 60%, white), var(--c)); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 12px 40px color-mix(in srgb, var(--c) 40%, transparent); animation: pop 0.25s ease; }
    .target-icon { font-size: 64px; color: white; }

    .error-icon { font-size: 52px; color: #ef4444; margin-bottom: 16px; display: block; }
    .time-icon { font-size: 52px; color: var(--ion-color-primary); margin-bottom: 16px; display: block; }
    .result-ms { font-size: 40px; font-weight: 700; color: var(--ion-text-color) !important; margin-bottom: 4px !important; }
    .result-label { font-size: 15px; color: var(--ion-color-medium); margin-top: 4px !important; }

    @keyframes pop { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  `],
})
export class ReactionGameComponent implements OnDestroy {
  score = 0;
  tiempoMs = 0;
  lastTime = 0;
  gameState: 'waiting' | 'countdown' | 'ready' | 'too-soon' | 'result' = 'waiting';
  targetColor = '#22c55e';
  targetIcon = 'flash-outline';

  private timer: any = null;
  private startTime = 0;
  private roundCount = 0;

  private readonly COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
  private readonly ICONS = ['flash-outline', 'happy-outline', 'star-outline', 'heart-outline', 'sparkles-outline', 'flame-outline'];

  ngOnDestroy() { this.clearTimer(); }

  startRound() {
    this.clearTimer(); this.gameState = 'countdown'; this.roundCount++;
    const delay = 1000 + Math.random() * 2500;
    this.timer = setTimeout(() => {
      this.gameState = 'ready';
      const idx = Math.floor(Math.random() * this.COLORS.length);
      this.targetColor = this.COLORS[idx]; this.targetIcon = this.ICONS[idx];
      this.startTime = Date.now();
    }, delay);
  }

  onTargetClick() {
    if (this.gameState !== 'ready') return;
    this.lastTime = Date.now() - this.startTime;
    this.tiempoMs = this.lastTime;
    this.score += Math.max(0, 1000 - this.lastTime * 2);
    this.gameState = 'result';
  }

  onAreaClick() {
    if (this.gameState === 'waiting') return;
    if (this.gameState === 'countdown') { this.clearTimer(); this.gameState = 'too-soon'; }
  }

  get resultLabel(): string {
    if (this.lastTime < 200) return 'Reflejos ultra-rapidos!';
    if (this.lastTime < 350) return 'Muy rapido!';
    if (this.lastTime < 500) return 'Buen tiempo';
    if (this.lastTime < 750) return 'Bien';
    return 'Puedes mejorar';
  }

  reset() { this.clearTimer(); this.score = 0; this.tiempoMs = 0; this.lastTime = 0; this.roundCount = 0; this.gameState = 'waiting'; }
  private clearTimer() { if (this.timer) { clearTimeout(this.timer); this.timer = null; } }
}