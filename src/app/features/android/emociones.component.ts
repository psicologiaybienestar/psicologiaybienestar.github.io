import { Component } from '@angular/core';


const MOODS = [
  { emoji: '😊', label: 'Feliz', color: '#F0FDF4' },
  { emoji: '😌', label: 'Tranquilo', color: '#EEF2FF' },
  { emoji: '😐', label: 'Neutral', color: '#F9FAFB' },
  { emoji: '😔', label: 'Triste', color: '#FFF7ED' },
  { emoji: '😟', label: 'Preocupado', color: '#FEF2F2' },
  { emoji: '😤', label: 'Enojado', color: '#FDF2F8' },
];

const EMOTIONAL_TIPS = [
  {
    icon: '🫂',
    title: 'Permítete sentir',
    text: 'Todas las emociones son válidas. No las juzgues, solo obsérvalas y acéptalas.',
  },
  {
    icon: '📝',
    title: 'Escribe lo que sientes',
    text: 'Poner tus emociones en palabras las hace más manejables.',
  },
  {
    icon: '🌊',
    title: 'Déjalas fluir',
    text: 'Las emociones son como olas: llegan, crecen y se van. No te aferres a ellas.',
  },
  {
    icon: '🧘',
    title: 'Respira conscientemente',
    text: 'Inhalas, exhalas. Con cada respiración, vuelves al centro.',
  },
  {
    icon: '💬',
    title: 'Habla con alguien',
    text: 'Compartir lo que sientes con alguien de confianza alivia la carga.',
  },
  {
    icon: '☀️',
    title: 'Cambia tu energía',
    text: 'Sal a caminar, escucha música o haz algo que te haga bien.',
  },
];

@Component({
  selector: 'app-emociones',
  standalone: true,
  imports: [],
  template: `
    <!-- Header emocional -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="hero-emoji">💙</span>
        <h1 class="hero-title">¿Cómo te sientes?</h1>
        <p class="hero-subtitle">Reconocer tus emociones es el primer paso para sanar</p>
      </div>
    </section>

    <!-- Selector de estado de ánimo -->
    <section class="section">
      <h2 class="section-title">Tu estado de ánimo</h2>
      <p class="section-subtitle">Toca cómo te sientes ahora</p>
      <div class="moods-grid">
        @for (mood of moods; track mood.label) {
          <button
            class="mood-btn"
            [class.mood-active]="selectedMood === mood.label"
            [style.background]="mood.color"
            (click)="selectMood(mood.label)"
          >
            <span class="mood-emoji">{{ mood.emoji }}</span>
            <span class="mood-label">{{ mood.label }}</span>
          </button>
        }
      </div>
      @if (selectedMood) {
        <div class="mood-message">
          <p>Has seleccionado: <strong>{{ selectedMood }}</strong></p>
          <p class="mood-message-text">{{ getMoodMessage() }}</p>
        </div>
      }
    </section>

    <!-- Consejos emocionales -->
    <section class="section">
      <h2 class="section-title">Apoyo emocional</h2>
      <div class="tips-list">
        @for (tip of emotionalTips; track tip.title) {
          <div class="emotion-tip-card">
            <span class="emotion-tip-icon">{{ tip.icon }}</span>
            <div>
              <h3 class="emotion-tip-title">{{ tip.title }}</h3>
              <p class="emotion-tip-text">{{ tip.text }}</p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- Ejercicio de respiración rápida -->
    <section class="section">
      <h2 class="section-title">Respira conmigo</h2>
      <p class="section-subtitle">Un ejercicio rápido para centrarte</p>
      <div class="breathing-card">
        <div class="breathing-circle" [class.breathing-inhale]="breathingPhase === 'inhale'" [class.breathing-hold]="breathingPhase === 'hold'" [class.breathing-exhale]="breathingPhase === 'exhale'">
          <div class="breathing-inner">
            <span class="breathing-text">{{ breathingText }}</span>
          </div>
        </div>
        <button class="breathing-toggle" (click)="toggleBreathing()">
          {{ breathingActive ? 'Detener' : 'Comenzar' }}
        </button>
      </div>
    </section>

    <div class="bottom-spacer"></div>
  `,
  styles: [`
    :host {
      display: block;
      background: #ffffff;
    }

    .hero-section {
      position: relative;
      padding: 32px 20px 24px;
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
      animation: floaty 3s ease-in-out infinite;
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
      line-height: 1.5;
    }

    .section {
      padding: 8px 20px 20px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .section-subtitle {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 12px;
    }

    .moods-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .mood-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 14px 8px;
      border-radius: 16px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .mood-btn:active {
      transform: scale(0.94);
    }
    .mood-active {
      border-color: #627eff !important;
      box-shadow: 0 0 0 3px rgba(98, 126, 255, 0.2);
    }
    .mood-emoji {
      font-size: 28px;
    }
    .mood-label {
      font-size: 12px;
      font-weight: 600;
      color: #4b5563;
    }
    .mood-message {
      margin-top: 12px;
      padding: 12px 16px;
      background: #EEF2FF;
      border-radius: 14px;
      font-size: 14px;
      color: #1f2937;
    }
    .mood-message-text {
      color: #6b7280;
      font-size: 13px;
      margin-top: 4px;
    }

    .tips-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .emotion-tip-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px;
      background: #F9FAFB;
      border-radius: 14px;
      border: 1px solid #F3F4F6;
    }
    .emotion-tip-icon {
      font-size: 28px;
      flex-shrink: 0;
    }
    .emotion-tip-title {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .emotion-tip-text {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.4;
    }

    .breathing-card {
      background: linear-gradient(135deg, #EEF2FF 0%, #ffffff 100%);
      border: 1px solid #E0E7FF;
      border-radius: 20px;
      padding: 28px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .breathing-circle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: linear-gradient(135deg, #627eff 0%, #53c6e4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s ease;
    }
    .breathing-inhale {
      transform: scale(1.2);
      box-shadow: 0 0 40px rgba(98, 126, 255, 0.3);
    }
    .breathing-hold {
      transform: scale(1.2);
    }
    .breathing-exhale {
      transform: scale(0.9);
      box-shadow: 0 0 20px rgba(98, 126, 255, 0.15);
    }
    .breathing-inner {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .breathing-text {
      color: #ffffff;
      font-size: 16px;
      font-weight: 700;
      text-align: center;
      padding: 4px;
    }
    .breathing-toggle {
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
    .breathing-toggle:active {
      transform: scale(0.95);
      opacity: 0.8;
    }

    .bottom-spacer {
      height: 80px;
    }

    @keyframes floaty {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `]
})
export class EmocionesComponent {
  moods = MOODS;
  emotionalTips = EMOTIONAL_TIPS;
  selectedMood: string | null = null;

  breathingActive = false;
  breathingPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
  breathingText = 'Inhalar';
  private breathingTimer: any = null;

  selectMood(label: string) {
    this.selectedMood = this.selectedMood === label ? null : label;
  }

  getMoodMessage(): string {
    const messages: Record<string, string> = {
      'Feliz': 'Qué bonito sentirte bien. Disfruta este momento y compártelo.',
      'Tranquilo': 'La calma es tu superpoder. Aprovecha este espacio de paz.',
      'Neutral': 'Está bien no sentir nada en especial. Solo observa el momento presente.',
      'Triste': 'Está bien sentir tristeza. Permítete ese espacio sin juzgarte.',
      'Preocupado': 'Respira profundo. Una preocupación a la vez. Todo va a estar bien.',
      'Enojado': 'Tu enojo es válido. Respira antes de actuar. Tómate tu tiempo.',
    };
    return messages[this.selectedMood!] || 'Gracias por reconocer cómo te sientes.';
  }

  toggleBreathing() {
    if (this.breathingActive) {
      this.stopBreathing();
    } else {
      this.startBreathing();
    }
  }

  private startBreathing() {
    this.breathingActive = true;
    this.breathingPhase = 'inhale';
    this.breathingText = 'Inhalar';
    let step = 0;
    const phases = [
      { phase: 'inhale' as const, text: 'Inhalar', duration: 4000 },
      { phase: 'hold' as const, text: 'Sostener', duration: 4000 },
      { phase: 'exhale' as const, text: 'Exhalar', duration: 4000 },
    ];
    const runStep = () => {
      if (!this.breathingActive) return;
      const current = phases[step % 3];
      this.breathingPhase = current.phase;
      this.breathingText = current.text;
      this.breathingTimer = setTimeout(() => {
        step++;
        runStep();
      }, current.duration);
    };
    runStep();
  }

  private stopBreathing() {
    this.breathingActive = false;
    this.breathingPhase = 'inhale';
    this.breathingText = 'Inhalar';
    if (this.breathingTimer) {
      clearTimeout(this.breathingTimer);
      this.breathingTimer = null;
    }
  }
}
