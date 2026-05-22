import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../core/services/supabase.service';
import { TestimoniosService } from '../../core/services/testimonios.service';

const DAILY_TIPS = [
  { icon: '🧠', title: 'Respira profundo', text: 'Inhala 4 segundos, sostén 4, exhala 4. Calma tu mente al instante.' },
  { icon: '💚', title: 'Practica gratitud', text: 'Escribe 3 cosas por las que estás agradecido hoy.' },
  { icon: '🌿', title: 'Conecta con la naturaleza', text: 'Sal 10 minutos al aire libre. La naturaleza recarga.' },
  { icon: '☀️', title: 'Despierta tu cuerpo', text: 'Estira tu cuerpo al despertar. Activa tu energía.' },
  { icon: '📖', title: 'Lee algo inspirador', text: 'Dedica 15 minutos a leer algo que nutra tu mente.' },
  { icon: '💧', title: 'Hidrátate', text: 'Toma un vaso de agua ahora. Tu cerebro lo agradece.' },
  { icon: '🧘', title: 'Pausa consciente', text: 'Detente 2 minutos. Solo respira y observa tu entorno.' },
  { icon: '💭', title: 'Suelta lo que no controlas', text: 'Enfócate en lo que depende de ti. El resto, déjalo ir.' },
];

const MOTIVATIONAL_QUOTES = [
  { texto: 'No estás solo. Cada paso que das hacia tu bienestar es un acto de valentía.', autor: 'Psicología & Bienestar' },
  { texto: 'La salud mental no es un destino, es un viaje. Disfruta cada paso.', autor: 'Anónimo' },
  { texto: 'Tu mente es tu hogar. Cuídala con la misma ternura que cuidas a quienes amas.', autor: 'Psicología & Bienestar' },
  { texto: 'Pequeños pasos construyen grandes cambios. Hoy es un buen día para empezar.', autor: 'Anónimo' },
  { texto: 'Está bien no estar bien. Lo importante es buscar ayuda cuando la necesitas.', autor: 'Psicología & Bienestar' },
  { texto: 'La sanación comienza cuando te permites sentir. No hay emociones incorrectas.', autor: 'Psicología & Bienestar' },
  { texto: 'Eres más fuerte de lo que crees, más capaz de lo que imaginas.', autor: 'Anónimo' },
  { texto: 'Cada día es una nueva oportunidad para cuidar de ti mismo.', autor: 'Psicología & Bienestar' },
];

const WELLNESS_CARDS = [
  { icon: '🧘', title: 'Mindfulness', text: 'Vive el presente. Atención plena para reducir la ansiedad.', color: '#EEF2FF' },
  { icon: '🌱', title: 'Autocuidado', text: 'Rituales diarios que nutren tu cuerpo, mente y espíritu.', color: '#F0FDF4' },
  { icon: '💪', title: 'Bienestar', text: 'Hábitos saludables para una vida equilibrada y plena.', color: '#FFF7ED' },
  { icon: '🫂', title: 'Conexión', text: 'Vínculos auténticos que fortalecen tu salud emocional.', color: '#FDF2F8' },
];

@Component({
  selector: 'app-home-android',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <!-- Hero compacto emocional -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-emoji">💛</div>
        <h1 class="hero-title">Bienvenido</h1>
        <p class="hero-subtitle">Tu espacio seguro para el bienestar emocional</p>
      </div>
    </section>

    <!-- Consejos diarios -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Consejos del día</h2>
        <span class="section-badge">Hoy</span>
      </div>
      <div class="swiper tips-swiper">
        <div class="swiper-wrapper">
          @for (tip of dailyTips; track tip.title; let i = $index) {
            <div class="swiper-slide">
              <div class="tip-card" [style.animationDelay]="i * 0.05 + 's'">
                <span class="tip-icon">{{ tip.icon }}</span>
                <div>
                  <h3 class="tip-title">{{ tip.title }}</h3>
                  <p class="tip-text">{{ tip.text }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Frase motivacional -->
    <section class="section">
      <div class="quote-card" (click)="nextQuote()">
        <div class="quote-icon">"</div>
        <p class="quote-text">{{ currentQuote.texto }}</p>
        <div class="quote-footer">
          <span class="quote-author">— {{ currentQuote.autor }}</span>
          <button class="quote-refresh" (click)="nextQuote(); $event.stopPropagation()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Tu bienestar grid -->
    <section class="section">
      <h2 class="section-title">Tu bienestar</h2>
      <div class="wellness-grid">
        @for (card of wellnessCards; track card.title) {
          <div class="wellness-card" [style.background]="card.color">
            <span class="wellness-icon">{{ card.icon }}</span>
            <h3 class="wellness-title">{{ card.title }}</h3>
            <p class="wellness-text">{{ card.text }}</p>
          </div>
        }
      </div>
    </section>

    <!-- Minijuegos preview -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Minijuegos</h2>
        <a routerLink="/minijuegos" class="section-link">Ver todos</a>
      </div>
      <div class="games-scroll">
        <a routerLink="/minijuegos" class="game-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div class="game-card-icon">🧘</div>
          <div>
            <h3 class="game-card-title">Respiración</h3>
            <p class="game-card-text">Guía de respiración consciente</p>
          </div>
        </a>
        <a routerLink="/minijuegos" class="game-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <div class="game-card-icon">💭</div>
          <div>
            <h3 class="game-card-title">Afirmaciones</h3>
            <p class="game-card-text">Tarjetas de pensamiento positivo</p>
          </div>
        </a>
        <a routerLink="/minijuegos" class="game-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <div class="game-card-icon">🌟</div>
          <div>
            <h3 class="game-card-title">Gratitud</h3>
            <p class="game-card-text">Tu diario de agradecimiento</p>
          </div>
        </a>
      </div>
    </section>

    <!-- Noticias -->
    @if (latestNoticias.length > 0) {
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Noticias</h2>
          <a routerLink="/noticias" class="section-link">Ver más</a>
        </div>
        <div class="horizontal-scroll">
          @for (noticia of latestNoticias; track noticia.id) {
            <a [routerLink]="'/noticia/' + noticia.slug" class="scroll-card">
              @if (noticia.imagen_destacada) {
                <div class="scroll-card-img">
                  <img [src]="noticia.imagen_destacada" [alt]="noticia.titulo" loading="lazy" />
                </div>
              }
              <div class="scroll-card-body">
                <h3 class="scroll-card-title">{{ noticia.titulo }}</h3>
                <p class="scroll-card-text">{{ (noticia.resumen || noticia.contenido)?.substring(0, 80) }}...</p>
              </div>
            </a>
          }
        </div>
      </section>
    }

    <!-- Eventos -->
    @if (proximosEventos.length > 0) {
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Eventos</h2>
          <a routerLink="/eventos" class="section-link">Ver más</a>
        </div>
        <div class="horizontal-scroll">
          @for (evento of proximosEventos; track evento.id) {
            <a [routerLink]="'/evento/' + evento.id" class="scroll-card event-card">
              <div class="event-date-badge">
                <span class="event-date-day">{{ evento.fecha_inicio | date:'dd' }}</span>
                <span class="event-date-month">{{ evento.fecha_inicio | date:'MMM' }}</span>
              </div>
              <div class="scroll-card-body">
                <h3 class="scroll-card-title">{{ evento.titulo }}</h3>
                <p class="scroll-card-text">{{ evento.descripcion?.substring(0, 60) }}...</p>
              </div>
            </a>
          }
        </div>
      </section>
    }

    <!-- Espacio para el bottom nav -->
    <div class="bottom-spacer"></div>
  `,
  styles: [`
    :host {
      display: block;
      background: #ffffff;
    }

    /* ===== Hero ===== */
    .hero-section {
      position: relative;
      padding: 32px 20px 28px;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%);
      opacity: 0.08;
    }
    .hero-content {
      position: relative;
      text-align: center;
    }
    .hero-emoji {
      font-size: 48px;
      margin-bottom: 8px;
      animation: floaty 3s ease-in-out infinite;
    }
    .hero-title {
      font-size: 28px;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .hero-subtitle {
      font-size: 15px;
      color: #6b7280;
      line-height: 1.5;
      max-width: 260px;
      margin: 0 auto;
    }

    /* ===== Sections ===== */
    .section {
      padding: 8px 20px 20px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }
    .section-badge {
      font-size: 12px;
      font-weight: 600;
      color: #627eff;
      background: #EEF2FF;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .section-link {
      font-size: 13px;
      font-weight: 600;
      color: #627eff;
      text-decoration: none;
    }

    /* ===== Tips carrusel ===== */
    .tips-swiper {
      padding: 4px 0 8px;
      overflow: visible;
    }
    .tips-swiper .swiper-wrapper {
      display: flex;
    }
    .tips-swiper .swiper-slide {
      width: 280px !important;
      flex-shrink: 0;
    }
    .tip-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: #F9FAFB;
      border: 1px solid #F3F4F6;
      border-radius: 16px;
      padding: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .tip-card:active {
      transform: scale(0.97);
    }
    .tip-icon {
      font-size: 32px;
      line-height: 1;
      flex-shrink: 0;
    }
    .tip-title {
      font-size: 15px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .tip-text {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.4;
    }

    /* ===== Quote ===== */
    .quote-card {
      background: linear-gradient(135deg, #EEF2FF 0%, #ffffff 100%);
      border: 1px solid #E0E7FF;
      border-radius: 20px;
      padding: 24px;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .quote-card:active {
      transform: scale(0.98);
    }
    .quote-icon {
      font-size: 48px;
      line-height: 0.6;
      color: #627eff;
      opacity: 0.2;
      font-family: Georgia, serif;
      margin-bottom: 4px;
    }
    .quote-text {
      font-size: 17px;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.6;
      margin-bottom: 16px;
      font-style: italic;
    }
    .quote-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .quote-author {
      font-size: 13px;
      color: #6b7280;
    }
    .quote-refresh {
      background: #ffffff;
      border: 1px solid #E5E7EB;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #627eff;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .quote-refresh:active {
      transform: rotate(180deg);
      background: #EEF2FF;
    }

    /* ===== Wellness Grid ===== */
    .wellness-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .wellness-card {
      border-radius: 18px;
      padding: 18px 14px;
      transition: transform 0.2s ease;
    }
    .wellness-card:active {
      transform: scale(0.96);
    }
    .wellness-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 6px;
    }
    .wellness-title {
      font-size: 15px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .wellness-text {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
    }

    /* ===== Games Scroll ===== */
    .games-scroll {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      padding: 2px 0 4px;
      scrollbar-width: none;
    }
    .games-scroll::-webkit-scrollbar {
      display: none;
    }
    .game-card {
      flex-shrink: 0;
      width: 200px;
      border-radius: 18px;
      padding: 18px;
      text-decoration: none;
      scroll-snap-align: start;
      transition: transform 0.2s ease;
    }
    .game-card:active {
      transform: scale(0.96);
    }
    .game-card-icon {
      font-size: 36px;
      margin-bottom: 8px;
    }
    .game-card-title {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 2px;
    }
    .game-card-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.3;
    }

    /* ===== Horizontal Scroll ===== */
    .horizontal-scroll {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      padding: 2px 0 4px;
      scrollbar-width: none;
    }
    .horizontal-scroll::-webkit-scrollbar {
      display: none;
    }
    .scroll-card {
      flex-shrink: 0;
      width: 240px;
      background: #ffffff;
      border: 1px solid #F3F4F6;
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      scroll-snap-align: start;
      transition: transform 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .scroll-card:active {
      transform: scale(0.97);
    }
    .scroll-card-img {
      height: 110px;
      overflow: hidden;
    }
    .scroll-card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .scroll-card-body {
      padding: 12px;
    }
    .scroll-card-title {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .scroll-card-text {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ===== Event card ===== */
    .event-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
    }
    .event-date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #EEF2FF;
      border-radius: 10px;
      padding: 8px 10px;
      min-width: 48px;
      flex-shrink: 0;
    }
    .event-date-day {
      font-size: 16px;
      font-weight: 800;
      color: #627eff;
      line-height: 1.2;
    }
    .event-date-month {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
    }

    /* ===== Bottom spacer ===== */
    .bottom-spacer {
      height: 80px;
    }

    /* ===== Animations ===== */
    @keyframes floaty {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HomeAndroidComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];

  dailyTips = DAILY_TIPS;
  wellnessCards = WELLNESS_CARDS;
  quotes = MOTIVATIONAL_QUOTES;
  currentQuote = MOTIVATIONAL_QUOTES[0];

  latestNoticias: any[] = [];
  proximosEventos: any[] = [];

  private supabaseService = inject(SupabaseService);
  private testimoniosService = inject(TestimoniosService);

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initTipSwiper(), 300);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  nextQuote() {
    let idx = Math.floor(Math.random() * this.quotes.length);
    if (this.quotes[idx] === this.currentQuote && this.quotes.length > 1) {
      idx = (idx + 1) % this.quotes.length;
    }
    this.currentQuote = this.quotes[idx];
  }

  private async loadData() {
    try {
      const [noticias, eventos] = await Promise.all([
        this.supabaseService.getLatestNoticias(5),
        this.supabaseService.getProximosEventos(5),
      ]);
      this.latestNoticias = noticias;
      this.proximosEventos = eventos;
    } catch {
      // silent
    }
  }

  private initTipSwiper() {
    const el = document.querySelector('.tips-swiper');
    if (!el || (el as any).__swiper) return;
    new Swiper('.tips-swiper', {
      modules: [Autoplay],
      slidesPerView: 'auto',
      spaceBetween: 10,
      freeMode: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
    });
    (el as any).__swiper = true;
  }
}
