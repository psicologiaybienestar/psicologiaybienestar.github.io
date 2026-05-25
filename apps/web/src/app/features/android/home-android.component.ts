import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../core/services/supabase.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { QuotesService } from '../../core/services/quotes.service';
import { EmotionalTipsService } from '../../core/services/emotional-tips.service';
import { WellnessActivitiesService } from '../../core/services/wellness-activities.service';
import { MiniGamesService } from '../../core/services/mini-games.service';
import { InternalNotificationsService } from '../../core/services/internal-notifications.service';

const WELLNESS_COLORS = ['#EEF2FF', '#F0FDF4', '#FFF7ED', '#FDF2F8', '#FEF2F2', '#F5F3FF', '#ECFDF5', '#FFF1F2'];
const TIP_ICONS: Record<string, string> = {
  ansiedad: '🧠', autoestima: '💚', relajación: '🧘', estrés: '💭',
  motivación: '💪', mindfulness: '🌿', bienestar: '☀️', respiración: '🫁',
  general: '💧',
};
const ACTIVITY_ICONS: Record<string, string> = {
  mindfulness: '🧘', meditacion: '🌿', respiracion: '🫁', relajacion: '😌',
  yoga: '🧘‍♀️', ejercicio: '💪', lectura: '📖', musica: '🎵',
};

@Component({
  selector: 'app-home-android',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <!-- Hero compacto emocional -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <button class="notif-pill" (click)="toggleNotifications()" aria-label="Novedades">
          <svg xmlns="http://www.w3.org/2000/svg" class="notif-pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          @if (unreadCount > 0) {
            <span class="notif-pill-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          }
        </button>
        <div class="hero-logo">
          <img src="assets/img/logo.png" alt="Psicología & Bienestar" class="hero-logo-img" />
        </div>
        <h1 class="hero-title">Bienvenido</h1>
        <p class="hero-subtitle">Tu espacio seguro para el bienestar emocional</p>
      </div>
      @if (showNotifications) {
        <div class="notif-overlay" (click)="toggleNotifications()"></div>
        <div class="notif-panel">
          <div class="notif-panel-header">
            <span class="notif-panel-title">Novedades</span>
            @if (unreadCount > 0) {
              <button class="notif-mark-read" (click)="markAllAsRead(); $event.stopPropagation()">Leer todo</button>
            }
            @if (notificationsList.length > 0) {
              <button class="notif-delete-all" (click)="deleteAllRead(); $event.stopPropagation()">🗑️</button>
            }
            <button class="notif-close" (click)="toggleNotifications()">✕</button>
          </div>
          @if (notificationsList.length === 0) {
            <div class="notif-empty">Sin novedades aún</div>
          }
          @for (n of notificationsList; track n.id) {
            <div class="notif-item" [class.notif-unread]="!n.is_read">
              <span class="notif-item-icon">{{ getNotifIcon(n.type) }}</span>
              <div class="notif-item-body" (click)="markAsRead(n.id)">
                <p class="notif-item-title">{{ n.title }}</p>
                @if (n.body) {
                  <p class="notif-item-text">{{ n.body }}</p>
                }
                <span class="notif-item-time">{{ n.created_at | date:'dd MMM HH:mm' }}</span>
              </div>
              <button class="notif-delete-one" (click)="deleteOne(n.id); $event.stopPropagation()">✕</button>
            </div>
          }
        </div>
      }
    </section>

    <!-- Consejos diarios -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Consejos del día</h2>
        <span class="section-badge">Hoy</span>
      </div>
      <div class="swiper tips-swiper">
        <div class="swiper-wrapper">
          @for (tip of dynamicTips; track tip.title; let i = $index) {
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
        @for (card of dynamicWellness; track card.title) {
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
        <!-- Hardcoded clásicos -->
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
        <!-- Dinámicos desde BD -->
        @for (game of dynamicGames; track game.id) {
          <a [routerLink]="game.route || '/minijuegos'" class="game-card"
             [style.background]="'linear-gradient(135deg, ' + getGradientColor($index + 3, 0) + ', ' + getGradientColor($index + 3, 1) + ')'">
            <div class="game-card-icon">{{ game.icon || '🎮' }}</div>
            <div>
              <h3 class="game-card-title">{{ game.title }}</h3>
              <p class="game-card-text">{{ (game.description || '').substring(0, 40) }}</p>
            </div>
          </a>
        }
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
              @if (noticia.imagen) {
                <div class="scroll-card-img">
                  <img [src]="noticia.imagen" [alt]="noticia.titulo" loading="lazy" />
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

    <!-- Accesos Rápidos -->
    <section class="section">
      <h2 class="section-title">Accesos rápidos</h2>
      <div class="quick-access-grid">
        <button class="quick-card" (click)="openWebVersion()">
          <svg xmlns="http://www.w3.org/2000/svg" class="quick-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
          <span class="quick-label">Versión web</span>
          <span class="quick-desc">Abrir en navegador</span>
        </button>
        <a routerLink="/configuracion" class="quick-card">
          <svg xmlns="http://www.w3.org/2000/svg" class="quick-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          <span class="quick-label">Configuración</span>
          <span class="quick-desc">Notificaciones y preferencias</span>
        </a>
      </div>
    </section>

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
      padding-top: max(32px, env(safe-area-inset-top, 32px));
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
    .hero-logo {
      margin-bottom: 12px;
      animation: floaty 3s ease-in-out infinite;
    }
    .hero-logo-img {
      width: 72px;
      height: 72px;
      object-fit: contain;
      margin: 0 auto;
      border-radius: 18px;
      box-shadow: 0 4px 20px rgba(98, 126, 255, 0.2);
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
      padding-left: max(20px, env(safe-area-inset-left, 20px));
      padding-right: max(20px, env(safe-area-inset-right, 20px));
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

    /* ===== Quick Access ===== */
    .quick-access-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .quick-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 16px 12px;
      background: #F9FAFB;
      border: 1px solid #F3F4F6;
      border-radius: 16px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .quick-card:active {
      transform: scale(0.96);
      background: #EEF2FF;
    }
    .quick-icon {
      width: 28px;
      height: 28px;
      color: #627eff;
    }
    .quick-label {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }
    .quick-desc {
      font-size: 11px;
      color: #9ca3af;
    }

    /* ===== Notification Pill in Hero ===== */
    .notif-pill {
      position: absolute;
      top: max(12px, env(safe-area-inset-top, 12px));
      right: 16px;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.5);
      border-radius: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .notif-pill:active {
      transform: scale(0.92);
      background: rgba(255,255,255,1);
    }
    .notif-pill-icon {
      width: 20px;
      height: 20px;
      color: #627eff;
    }
    .notif-pill-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      box-shadow: 0 2px 4px rgba(239,68,68,0.3);
    }
    .notif-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 98;
    }
    .notif-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 75vh;
      background: #ffffff;
      border-radius: 20px 20px 0 0;
      z-index: 99;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
      padding-bottom: calc(72px + env(safe-area-inset-bottom, 24px));
    }
    .notif-panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px 12px;
      border-bottom: 1px solid #F3F4F6;
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 1;
    }
    .notif-panel-title {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      flex: 1;
    }
    .notif-mark-read {
      font-size: 12px;
      color: #627eff;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 8px;
    }
    .notif-mark-read:active {
      background: #EEF2FF;
    }
    .notif-close {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
    }
    .notif-close:active {
      background: #F3F4F6;
    }
    .notif-delete-all {
      background: none;
      border: none;
      font-size: 14px;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 8px;
      opacity: 0.6;
    }
    .notif-delete-all:active {
      opacity: 1;
      background: #FEF2F2;
    }
    .notif-delete-one {
      background: none;
      border: none;
      color: #d1d5db;
      font-size: 12px;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 8px;
      flex-shrink: 0;
      align-self: flex-start;
      margin-top: 2px;
    }
    .notif-delete-one:active {
      color: #ef4444;
      background: #FEF2F2;
    }
    .notif-empty {
      padding: 32px 20px;
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
    }
    .notif-item {
      display: flex;
      gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid #F9FAFB;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .notif-item:last-child {
      border-bottom: none;
    }
    .notif-item:active {
      background: #F9FAFB;
    }
    .notif-unread {
      background: #F0F4FF;
    }
    .notif-item-icon {
      font-size: 22px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .notif-item-body {
      flex: 1;
      min-width: 0;
    }
    .notif-item-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .notif-item-text {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .notif-item-time {
      font-size: 11px;
      color: #9ca3af;
    }

    /* ===== Bottom spacer ===== */
    .bottom-spacer {
      height: 80px;
      height: calc(80px + env(safe-area-inset-bottom, 0px));
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

  dynamicTips: any[] = [];
  currentQuote: any = { texto: 'Cargando...', autor: '' };
  dynamicWellness: any[] = [];
  dynamicGames: any[] = [];
  latestNoticias: any[] = [];
  proximosEventos: any[] = [];
  unreadCount = 0;
  notificationsList: any[] = [];
  showNotifications = false;

  private supabaseService = inject(SupabaseService);
  private userProfileService = inject(UserProfileService);
  private notificationsService = inject(NotificationsService);
  private quotesService = inject(QuotesService);
  private tipsService = inject(EmotionalTipsService);
  private wellnessService = inject(WellnessActivitiesService);
  private gamesService = inject(MiniGamesService);
  private internalNotificationsService = inject(InternalNotificationsService);
  private homeRealtimeChannel: any;
  private notifRealtimeChannel: any;
  private realtimeChannels: any[] = [];

  openWebVersion() {
    const url = 'https://psicologiaybienestar.netlify.app';
    window.open(url, '_blank');
  }

  ngOnInit() {
    this.loadData();
    this.loadDynamicContent();

    this.homeRealtimeChannel = this.notificationsService.subscribeToAllChanges((table) => {
      if (table === 'eventos' || table === 'noticias') {
        this.loadData();
      }
      this.loadDynamicContent();
    });

    this.notifRealtimeChannel = this.internalNotificationsService.subscribeToNew(() => {
      this.loadUnreadCount();
    });
    this.loadUnreadCount();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initTipSwiper(), 300);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.homeRealtimeChannel?.unsubscribe();
    this.notifRealtimeChannel?.unsubscribe();
    this.realtimeChannels.forEach(ch => ch?.unsubscribe());
  }

  nextQuote() {
    const quotes = this.quotesService['quotesSubject'].value;
    if (quotes.length === 0) return;
    let idx = Math.floor(Math.random() * quotes.length);
    if (quotes[idx].quote === this.currentQuote.texto && quotes.length > 1) {
      idx = (idx + 1) % quotes.length;
    }
    this.currentQuote = { texto: quotes[idx].quote, autor: quotes[idx].author || 'Anónimo' };
  }

  private async loadDynamicContent() {
    try {
      const [quotes, tips, wellness, games] = await Promise.all([
        this.quotesService.getActivas(8),
        this.tipsService.getActivos(8),
        this.wellnessService.getActivas(8),
        this.gamesService.getActivos(6),
      ]);

      this.dynamicTips = tips.map(t => ({
        icon: TIP_ICONS[t.emotion_type] || '💡',
        title: t.title,
        text: t.description || t.title,
      }));

      if (quotes.length > 0) {
        this.currentQuote = { texto: quotes[0].quote, autor: quotes[0].author || 'Anónimo' };
      }

      this.dynamicWellness = wellness.slice(0, 4).map((a, i) => ({
        icon: ACTIVITY_ICONS[a.activity_type] || '🌟',
        title: a.title,
        text: (a.content || '').substring(0, 60),
        color: WELLNESS_COLORS[i % WELLNESS_COLORS.length],
      }));

      this.dynamicGames = games;

      this.initTipSwiper();
    } catch {
      // silent
    }
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

  private async loadUnreadCount() {
    try {
      this.unreadCount = await this.internalNotificationsService.getUnreadCount();
      this.notificationsList = await this.internalNotificationsService.getLatest(10);
    } catch { /* ignore */ }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  async markAsRead(id: string) {
    await this.internalNotificationsService.markAsRead(id);
    this.loadUnreadCount();
  }

  async markAllAsRead() {
    await this.internalNotificationsService.markAllAsRead();
    this.loadUnreadCount();
  }

  async deleteOne(id: string) {
    await this.internalNotificationsService.deleteNotification(id);
    this.loadUnreadCount();
  }

  async deleteAllRead() {
    await this.internalNotificationsService.deleteAllRead();
    this.loadUnreadCount();
  }

  getNotifIcon(type: string): string {
    const icons: Record<string, string> = {
      eventos: '📅', noticias: '📰', motivational_quotes: '💬',
      emotional_tips: '💡', wellness_activities: '🧘', mini_games: '🎮',
    };
    return icons[type] || '🔔';
  }

  private gradients = [
    ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#a18cd1', '#fbc2eb'],
  ];

  getGradientColor(index: number, pos: number): string {
    return this.gradients[index % this.gradients.length][pos];
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
