import { Component, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';


const AFFIRMATIONS = [
  'Soy suficiente tal como soy.',
  'Merezco amor, paz y felicidad.',
  'Cada día es una nueva oportunidad.',
  'Confío en mi proceso de sanación.',
  'Mis emociones son válidas y merecen ser escuchadas.',
  'Soy fuerte, incluso en los momentos difíciles.',
  'Elijo enfocarme en lo que puedo controlar.',
  'Mi bienestar es una prioridad.',
  'Estoy orgulloso de mi esfuerzo y progreso.',
  'La calma vive dentro de mí.',
  'Hoy elijo ser amable conmigo mismo.',
  'Cada respiración me renueva.',
  'Mis pensamientos crean mi realidad. Elijo pensamientos que me fortalecen.',
  'Acepto mis imperfecciones porque me hacen único y auténtico.',
  'El perdón me libera. Suelto el pasado y abrazo el presente.',
  'La paz comienza en mi interior. Hoy cultivo la serenidad.',
  'Soy merecedor de todo lo bueno que la vida tiene para ofrecer.',
  'Mis errores son lecciones que me ayudan a crecer y evolucionar.',
  'Confío en el proceso de la vida. Todo llega en el momento perfecto.',
  'Hoy elijo enfocarme en lo que tengo, no en lo que me falta.',
];

@Component({
  selector: 'app-minijuegos',
  standalone: true,
  imports: [IonIcon],
  template: `
    <!-- Header -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <ion-icon class="hero-emoji" name="game-controller-outline"></ion-icon>
        <h1 class="hero-title">Minijuegos</h1>
        <p class="hero-subtitle">Ejercicios interactivos para tu bienestar emocional</p>
      </div>
    </section>

    <!-- Pestañas de juegos -->
    <section class="section">
      <div class="tabs">
        <button class="tab-btn" [class.tab-active]="activeGame === 'breathing'" (click)="activeGame = 'breathing'">
          <ion-icon name="body-outline"></ion-icon> Respiración
        </button>
        <button class="tab-btn" [class.tab-active]="activeGame === 'affirmations'" (click)="activeGame = 'affirmations'">
          <ion-icon name="chatbubble-ellipses-outline"></ion-icon> Afirmaciones
        </button>
        <button class="tab-btn" [class.tab-active]="activeGame === 'gratitude'" (click)="activeGame = 'gratitude'">
          <ion-icon name="star-outline"></ion-icon> Gratitud
        </button>
      </div>
    </section>

    <!-- Juego: Respiración -->
    @if (activeGame === 'breathing') {
      <section class="section">
        <div class="game-card-breathing">
          <h2 class="game-title">Respiración Guiada</h2>
          <p class="game-subtitle">Sigue el ritmo de tu respiración</p>
          <div class="breath-container">
            <div class="breath-circle" [class.breath-inhale]="breathPhase === 'inhale'" [class.breath-hold]="breathPhase === 'hold'" [class.breath-exhale]="breathPhase === 'exhale'">
              <div class="breath-inner">
                <span class="breath-label">{{ breathLabel }}</span>
              </div>
            </div>
          </div>
          <div class="breath-timer">
            <div class="breath-bar">
              <div class="breath-bar-fill" [style.width.%]="breathProgress"></div>
            </div>
          </div>
          <div class="breath-info">
            <span>Inhalar 4s</span>
            <span>Sostener 4s</span>
            <span>Exhalar 4s</span>
          </div>
          <button class="game-btn" (click)="toggleBreathing()">
            {{ breathActive ? 'Detener' : 'Comenzar' }}
          </button>
        </div>
      </section>
    }

    <!-- Juego: Afirmaciones -->
    @if (activeGame === 'affirmations') {
      <section class="section">
        <div class="game-card-affirm">
          <h2 class="game-title">Afirmaciones Positivas</h2>
          <p class="game-subtitle">Toca para revelar una nueva afirmación</p>
          <div class="affirm-card" [class.affirm-fade]="affirmationKey > 0" (click)="nextAffirmation()">
            <ion-icon class="affirm-icon" name="heart-outline"></ion-icon>
            <p class="affirm-text">{{ currentAffirmation }}</p>
            <button class="affirm-btn" (click)="nextAffirmation(); $event.stopPropagation()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Nueva
            </button>
          </div>
          <p class="affirm-hint">Toca la tarjeta para cambiar de afirmación</p>
        </div>
      </section>
    }

    <!-- Juego: Gratitud -->
    @if (activeGame === 'gratitude') {
      <section class="section">
        <div class="game-card-gratitude">
          <h2 class="game-title">Diario de Gratitud</h2>
          <p class="game-subtitle">¿Por qué estás agradecido hoy?</p>

          @if (gratitudeStreak > 0) {
            <div class="streak-badge">
              <ion-icon class="streak-fire" name="flame-outline"></ion-icon>
              <span><strong>{{ gratitudeStreak }}</strong> día{{ gratitudeStreak > 1 ? 's' : '' }} seguido{{ gratitudeStreak > 1 ? 's' : '' }}</span>
            </div>
          }

          <div class="gratitude-list">
            @if (gratitudeItems.length === 0) {
              <div class="gratitude-empty">
                <ion-icon class="gratitude-empty-icon" name="leaf-outline"></ion-icon>
                <p>Aún no has registrado nada. Escribe algo por lo que estés agradecido.</p>
              </div>
            }
            @for (item of gratitudeItems; track item; let i = $index) {
              <div class="gratitude-item">
                <span class="gratitude-number">{{ i + 1 }}</span>
                <span>{{ item }}</span>
                <button class="gratitude-remove" (click)="removeGratitude(i)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <div class="gratitude-input-group">
            <input
              #gratitudeInput
              (keydown.enter)="addGratitude(gratitudeInput.value); gratitudeInput.value = ''"
              placeholder="Estoy agradecido por..."
              class="gratitude-input"
              maxlength="120"
            />
            <button class="gratitude-add-btn" (click)="addGratitude(gratitudeInput.value); gratitudeInput.value = ''">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    }

    <div class="bottom-spacer"></div>
  `,
  styles: [`
    :host {
      display: block;
      background: #ffffff;
    }

    .hero-section {
      position: relative;
      padding: 32px 20px 16px;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%);
      opacity: 0.06;
    }
    .hero-content {
      position: relative;
      text-align: center;
    }
    .hero-emoji {
      font-size: 48px;
      display: block;
      margin-bottom: 8px;
    }
    .hero-title {
      font-size: 26px;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .hero-subtitle {
      font-size: 14px;
      color: #6b7280;
      max-width: 280px;
      margin: 0 auto;
    }

    .section {
      padding: 8px 20px 20px;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 8px;
    }
    .tab-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 6px;
      background: #F9FAFB;
      border: 2px solid transparent;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .tab-btn ion-icon {
      font-size: 22px;
    }
    .tab-active {
      background: #EEF2FF;
      border-color: #627eff;
      color: #627eff;
    }
    .tab-btn:active {
      transform: scale(0.96);
    }

    /* Breathing game */
    .game-card-breathing {
      background: linear-gradient(135deg, #EEF2FF 0%, #ffffff 100%);
      border: 1px solid #E0E7FF;
      border-radius: 20px;
      padding: 24px 20px;
      text-align: center;
    }
    .game-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }
    .game-subtitle {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 20px;
    }
    .breath-container {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }
    .breath-circle {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: linear-gradient(135deg, #627eff 0%, #53c6e4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s ease;
    }
    .breath-inhale {
      transform: scale(1.15);
      box-shadow: 0 0 50px rgba(98, 126, 255, 0.25);
    }
    .breath-hold {
      transform: scale(1.15);
    }
    .breath-exhale {
      transform: scale(0.85);
      box-shadow: 0 0 20px rgba(98, 126, 255, 0.1);
    }
    .breath-inner {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 110px;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .breath-label {
      color: #ffffff;
      font-size: 18px;
      font-weight: 700;
    }
    .breath-timer {
      margin-bottom: 8px;
    }
    .breath-bar {
      height: 4px;
      background: #E5E7EB;
      border-radius: 4px;
      overflow: hidden;
    }
    .breath-bar-fill {
      height: 100%;
      background: #627eff;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .breath-info {
      display: flex;
      justify-content: center;
      gap: 16px;
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 16px;
    }
    .game-btn {
      background: #627eff;
      color: #ffffff;
      border: none;
      border-radius: 30px;
      padding: 12px 36px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .game-btn:active {
      transform: scale(0.95);
      opacity: 0.8;
    }

    /* Affirmations game */
    .game-card-affirm {
      text-align: center;
    }
    .affirm-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 32px 24px;
      cursor: pointer;
      transition: transform 0.2s ease;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .affirm-card:active {
      transform: scale(0.97);
    }
    .affirm-fade {
      animation: affirmFadeIn 0.4s ease;
    }
    .affirm-icon {
      font-size: 36px;
      margin-bottom: 12px;
    }
    .affirm-text {
      color: #ffffff;
      font-size: 18px;
      font-weight: 500;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .affirm-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      border-radius: 20px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: inherit;
    }
    .affirm-btn:active {
      transform: scale(0.95);
      background: rgba(255, 255, 255, 0.3);
    }
    .affirm-hint {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
    }

    /* Gratitude game */
    .game-card-gratitude {
      background: #F9FAFB;
      border: 1px solid #F3F4F6;
      border-radius: 20px;
      padding: 24px 20px;
    }
    .gratitude-list {
      margin-bottom: 16px;
      min-height: 60px;
    }
    .gratitude-empty {
      text-align: center;
      padding: 20px;
      color: #9ca3af;
      font-size: 14px;
    }
    .gratitude-empty-icon {
      font-size: 36px;
      display: block;
      margin-bottom: 8px;
    }
    .gratitude-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: #ffffff;
      border-radius: 12px;
      margin-bottom: 6px;
      font-size: 14px;
      color: #1f2937;
      animation: slideIn 0.3s ease;
    }
    .gratitude-number {
      background: #EEF2FF;
      color: #627eff;
      font-weight: 700;
      font-size: 12px;
      width: 24px;
      height: 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .gratitude-remove {
      margin-left: auto;
      background: none;
      border: none;
      color: #d1d5db;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;
    }
    .gratitude-remove:active {
      color: #ef4444;
    }
    .gratitude-input-group {
      display: flex;
      gap: 8px;
    }
    .gratitude-input {
      flex: 1;
      border: 2px solid #E5E7EB;
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .gratitude-input:focus {
      border-color: #627eff;
    }
    .gratitude-add-btn {
      background: #627eff;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      width: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gratitude-add-btn:active {
      transform: scale(0.92);
    }

    .streak-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFF7ED;
      color: #9A3412;
      font-size: 13px;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 14px;
    }
    .streak-fire {
      font-size: 18px;
    }

    .bottom-spacer {
      height: 80px;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes affirmFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class MinijuegosComponent implements OnInit {
  activeGame: 'breathing' | 'affirmations' | 'gratitude' = 'breathing';

  // Breathing
  breathActive = false;
  breathPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
  breathLabel = 'Inhalar';
  breathProgress = 0;
  private breathTimer: any = null;
  private breathInterval: any = null;

  // Affirmations
  affirmations = AFFIRMATIONS;
  currentAffirmation = AFFIRMATIONS[0];

  // Gratitude
  gratitudeItems: string[] = [];
  gratitudeStreak = 0;
  affirmationKey = 0;

  ngOnInit() {
    this.loadGratitude();
    this.calcStreak();
    this.currentAffirmation = this.affirmations[Math.floor(Math.random() * this.affirmations.length)];
  }

  nextAffirmation() {
    this.affirmationKey++;
    let idx = Math.floor(Math.random() * this.affirmations.length);
    if (this.affirmations[idx] === this.currentAffirmation && this.affirmations.length > 1) {
      idx = (idx + 1) % this.affirmations.length;
    }
    this.currentAffirmation = this.affirmations[idx];
    this.affirmationKey++;
  }

  toggleBreathing() {
    if (this.breathActive) {
      this.stopBreathing();
    } else {
      this.startBreathing();
    }
  }

  private startBreathing() {
    this.breathActive = true;
    this.breathPhase = 'inhale';
    this.breathLabel = 'Inhalar';
    this.breathProgress = 0;

    const phases = [
      { phase: 'inhale' as const, label: 'Inhalar', duration: 4000 },
      { phase: 'hold' as const, label: 'Sostener', duration: 4000 },
      { phase: 'exhale' as const, label: 'Exhalar', duration: 4000 },
    ];

    let step = 0;

    const runStep = () => {
      if (!this.breathActive) return;
      const current = phases[step % 3];
      this.breathPhase = current.phase;
      this.breathLabel = current.label;
      this.breathProgress = 0;

      const startTime = Date.now();
      if (this.breathInterval) clearInterval(this.breathInterval);
      this.breathInterval = setInterval(() => {
        if (!this.breathActive) return;
        const elapsed = Date.now() - startTime;
        this.breathProgress = Math.min(100, (elapsed / current.duration) * 100);
      }, 50);

      this.breathTimer = setTimeout(() => {
        if (this.breathInterval) clearInterval(this.breathInterval);
        step++;
        runStep();
      }, current.duration);
    };

    runStep();
  }

  private stopBreathing() {
    this.breathActive = false;
    this.breathPhase = 'inhale';
    this.breathLabel = 'Inhalar';
    this.breathProgress = 0;
    if (this.breathTimer) { clearTimeout(this.breathTimer); this.breathTimer = null; }
    if (this.breathInterval) { clearInterval(this.breathInterval); this.breathInterval = null; }
  }

  addGratitude(value: string) {
    const text = value.trim();
    if (!text) return;
    this.gratitudeItems.unshift(text);
    if (this.gratitudeItems.length > 20) this.gratitudeItems.pop();
    this.saveGratitude();
    this.updateStreak();
  }

  removeGratitude(index: number) {
    this.gratitudeItems.splice(index, 1);
    this.saveGratitude();
  }

  private loadGratitude() {
    try {
      const data = localStorage.getItem('pb_gratitude');
      if (data) this.gratitudeItems = JSON.parse(data);
    } catch { /* ignore */ }
  }

  private saveGratitude() {
    try {
      localStorage.setItem('pb_gratitude', JSON.stringify(this.gratitudeItems));
    } catch { /* ignore */ }
  }

  private calcStreak() {
    try {
      const lastDate = localStorage.getItem('pb_gratitude_last');
      if (!lastDate) return;
      const last = new Date(lastDate);
      const today = new Date();
      const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        const stored = localStorage.getItem('pb_gratitude_streak');
        this.gratitudeStreak = stored ? parseInt(stored, 10) : 1;
      }
    } catch { /* ignore */ }
  }

  private updateStreak() {
    try {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem('pb_gratitude_last');
      if (lastDate === today) return;

      const last = lastDate ? new Date(lastDate) : null;
      const now = new Date();
      const diff = last ? Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) : 99;

      if (diff === 1) {
        this.gratitudeStreak++;
      } else if (diff > 1) {
        this.gratitudeStreak = 1;
      } else {
        this.gratitudeStreak = 1;
      }

      localStorage.setItem('pb_gratitude_last', today);
      localStorage.setItem('pb_gratitude_streak', String(this.gratitudeStreak));
    } catch { /* ignore */ }
  }
}
