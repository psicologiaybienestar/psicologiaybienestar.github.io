import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AppIconComponent } from '@shared/components/app-icon.component';

type Phase = 'inhala' | 'sostiene' | 'exhala' | 'espera';

@Component({
  selector: 'app-breathing-game',
  standalone: true,
  imports: [IonicModule, AppIconComponent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/minijuegos"></ion-back-button>
        </ion-buttons>
        <ion-title>Respiracion Guiada</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="container">
        <p class="subtitle">Sigue el ritmo de la animacion</p>

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
          <ion-button fill="clear" (click)="toggle()" class="control-btn">
            <app-icon [name]="running ? 'pause-outline' : 'play-outline'"></app-icon>
            {{ running ? 'Pausar' : 'Iniciar' }}
          </ion-button>
          <ion-button fill="clear" (click)="reset()" class="control-btn">
            <app-icon name="refresh-outline"></app-icon>
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
  styles: [`
    .container { display: flex; flex-direction: column; align-items: center; padding: 24px 16px 40px; }
    .subtitle { font: var(--pg-font-body); color: var(--ion-color-medium); margin-bottom: 36px; }

    .circle-wrapper { display: flex; align-items: center; justify-content: center; width: 240px; height: 240px; margin-bottom: 36px; }
    .circle { width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--ion-color-primary) 25%, white), color-mix(in srgb, var(--ion-color-primary) 45%, white)); display: flex; align-items: center; justify-content: center; transition: all 0.8s ease; box-shadow: 0 8px 32px color-mix(in srgb, var(--ion-color-primary) 30%, transparent); }
    .circle.inhala { width: 230px; height: 230px; background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--ion-color-primary) 35%, white), color-mix(in srgb, var(--ion-color-primary) 55%, white)); box-shadow: 0 12px 48px color-mix(in srgb, var(--ion-color-primary) 40%, transparent); }
    .circle.sostiene { width: 230px; height: 230px; }
    .circle.exhala { width: 170px; height: 170px; background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--ion-color-primary) 18%, white), color-mix(in srgb, var(--ion-color-primary) 30%, white)); box-shadow: 0 4px 16px color-mix(in srgb, var(--ion-color-primary) 20%, transparent); }
    .circle.espera { width: 170px; height: 170px; }
    .inner-circle { display: flex; flex-direction: column; align-items: center; color: white; }
    .phase-text { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .phase-count { font-size: 40px; font-weight: 300; margin-top: 4px; }

    .controls { display: flex; gap: 16px; margin-bottom: 28px; }
    .control-btn { --color: var(--ion-color-primary); font-weight: 600; }

    .cycles { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .cycle-label { font: var(--pg-font-caption); color: var(--ion-color-medium); font-weight: 500; }
    .cycle-dots { display: flex; gap: 8px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: var(--ion-color-light-shade); transition: all 0.3s; }
    .dot.done { background: var(--ion-color-primary); box-shadow: 0 0 8px color-mix(in srgb, var(--ion-color-primary) 40%, transparent); }
  `],
})
export class BreathingGameComponent implements OnInit, OnDestroy {
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
    switch (this.fase) { case 'inhala': return 'Inhala'; case 'sostiene': return 'Sosten'; case 'exhala': return 'Exhala'; case 'espera': return 'Espera'; }
  }

  ngOnInit() { this.reset(); }
  ngOnDestroy() { this.stopTimer(); }
  toggle() { this.running ? this.pause() : this.start(); }
  private start() { this.running = true; this.startPhase(); }
  private pause() { this.running = false; this.stopTimer(); }
  reset() { this.pause(); this.phaseIndex = 0; this.fase = this.PHASES[0]; this.count = this.DURATIONS[this.fase]; this.cycles = 0; this.cycleProgress = 0; this.breathCount = 0; }

  private startPhase() {
    this.stopTimer();
    this.fase = this.PHASES[this.phaseIndex];
    this.count = this.DURATIONS[this.fase];
    this.countdown = setInterval(() => { this.count--; if (this.count <= 0) this.nextPhase(); }, 1000);
  }

  private nextPhase() {
    this.phaseIndex++;
    if (this.phaseIndex >= this.PHASES.length) {
      this.phaseIndex = 0; this.breathCount++;
      this.cycles = Math.floor(this.breathCount / 6) + (this.breathCount % 6 === 0 ? 0 : 0);
      this.cycleProgress = this.breathCount % 6;
    }
    this.startPhase();
  }

  private stopTimer() { if (this.countdown) { clearInterval(this.countdown); this.countdown = null; } }
}