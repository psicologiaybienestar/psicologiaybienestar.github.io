import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

type Phase = 'inhala' | 'sostiene' | 'exhala' | 'espera';

@Component({
  selector: 'app-breathing-game',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Respiración Guiada</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="container">
        <p class="subtitle">Sigue el ritmo de la animación</p>

        <div class="circle-wrapper">
          <div class="circle" [class.inhala]="fase === 'inhala'" [class.sostiene]="fase === 'sostiene'"
               [class.exhala]="fase === 'exhala'" [class.espera]="fase === 'espera'">
            <div class="inner-circle">
              <span class="phase-text">{{ phaseLabel }}</span>
              <span class="phase-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <div class="controls">
          <ion-button fill="clear" (click)="toggle()">
            <ion-icon slot="start" [name]="running ? 'pause-outline' : 'play-outline'"></ion-icon>
            {{ running ? 'Pausar' : 'Iniciar' }}
          </ion-button>
          <ion-button fill="clear" (click)="reset()">
            <ion-icon slot="start" name="refresh-outline"></ion-icon>
            Reiniciar
          </ion-button>
        </div>

        <div class="cycles">
          <span class="cycle-label">Ciclos: {{ cycles }}</span>
          <div class="cycle-dots">
            @for (c of [].constructor(6); track $index) {
              <div class="dot" [class.done]="$index < cycleProgress"></div>
            }
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: `
    .container { display: flex; flex-direction: column; align-items: center; padding: 20px 16px 40px; }
    .subtitle { font-size: 14px; color: var(--ion-color-medium); margin-bottom: 32px; }

    .circle-wrapper { display: flex; align-items: center; justify-content: center; width: 220px; height: 220px; margin-bottom: 32px; }
    .circle { width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--ion-color-primary) 20%, white), color-mix(in srgb, var(--ion-color-primary) 40%, white)); display: flex; align-items: center; justify-content: center; transition: all 1s ease; box-shadow: 0 8px 32px color-mix(in srgb, var(--ion-color-primary) 30%, transparent); }
    .circle.inhala { width: 220px; height: 220px; background: radial-gradient(circle, color-mix(in srgb, var(--ion-color-primary) 30%, white), color-mix(in srgb, var(--ion-color-primary) 50%, white)); box-shadow: 0 12px 48px color-mix(in srgb, var(--ion-color-primary) 40%, transparent); }
    .circle.sostiene { width: 220px; height: 220px; }
    .circle.exhala { width: 180px; height: 180px; background: radial-gradient(circle, color-mix(in srgb, var(--ion-color-primary) 15%, white), color-mix(in srgb, var(--ion-color-primary) 30%, white)); box-shadow: 0 4px 16px color-mix(in srgb, var(--ion-color-primary) 20%, transparent); }
    .circle.espera { width: 180px; height: 180px; }
    .inner-circle { display: flex; flex-direction: column; align-items: center; color: white; }
    .phase-text { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .phase-count { font-size: 36px; font-weight: 300; margin-top: 4px; }

    .controls { display: flex; gap: 12px; margin-bottom: 24px; }

    .cycles { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .cycle-label { font-size: 13px; color: var(--ion-color-medium); font-weight: 500; }
    .cycle-dots { display: flex; gap: 6px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ion-color-light-shade); transition: background 0.3s; }
    .dot.done { background: var(--ion-color-primary); }
  `,
})
export class BreathingGameComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  running = false;
  fase: Phase = 'inhala';
  count = 4;
  cycles = 0;
  cycleProgress = 0;

  private timer: any = null;
  private countdown: any = null;
  private readonly PHASES: Phase[] = ['inhala', 'sostiene', 'exhala', 'espera'];
  private readonly DURATIONS: Record<Phase, number> = { inhala: 4, sostiene: 4, exhala: 6, espera: 2 };
  private phaseIndex = 0;
  private breathCount = 0;

  get phaseLabel(): string {
    switch (this.fase) {
      case 'inhala': return 'Inhala';
      case 'sostiene': return 'Sostén';
      case 'exhala': return 'Exhala';
      case 'espera': return 'Espera';
    }
  }

  ngOnInit() {
    this.reset();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  toggle() {
    if (this.running) {
      this.pause();
    } else {
      this.start();
    }
  }

  private start() {
    this.running = true;
    this.startPhase();
  }

  private pause() {
    this.running = false;
    this.stopTimer();
  }

  reset() {
    this.pause();
    this.phaseIndex = 0;
    this.fase = this.PHASES[0];
    this.count = this.DURATIONS[this.fase];
    this.cycles = 0;
    this.cycleProgress = 0;
    this.breathCount = 0;
  }

  private startPhase() {
    this.stopTimer();
    this.fase = this.PHASES[this.phaseIndex];
    this.count = this.DURATIONS[this.fase];

    this.countdown = setInterval(() => {
      this.count--;
      if (this.count <= 0) {
        this.nextPhase();
      }
    }, 1000);
  }

  private nextPhase() {
    this.phaseIndex++;

    if (this.phaseIndex >= this.PHASES.length) {
      this.phaseIndex = 0;
      this.breathCount++;
      this.cycles = Math.floor(this.breathCount / 6) + (this.breathCount % 6 === 0 ? 0 : 0);
      this.cycleProgress = this.breathCount % 6;
    }

    this.startPhase();
  }

  private stopTimer() {
    if (this.countdown) {
      clearInterval(this.countdown);
      this.countdown = null;
    }
  }
}
