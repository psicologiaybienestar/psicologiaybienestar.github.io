import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, SlicePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '@shared/services/supabase.service';
import { ContentEngineService, LocalQuote, LocalActivity, LocalTip } from '@shared/services/content-engine.service';
import { EmotionsService, EmotionCheckIn } from '@shared/services/emotions.service';

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General', ansiedad: 'Ansiedad', autoestima: 'Autoestima',
  relajacion: 'Relajación', Relajación: 'Relajación', estres: 'Estrés',
  Estrés: 'Estrés', motivacion: 'Motivación', Motivación: 'Motivación',
  mindfulness: 'Mindfulness', bienestar: 'Bienestar', respiracion: 'Respiración',
  Respiración: 'Respiración', meditation: 'Meditación', breathing: 'Respiración',
  relaxation: 'Relajación', exercise: 'Ejercicio',
};

const EMOTION_EMOJI_MAP: Record<string, string> = {
  feliz: '😊', tranquilo: '😌', ansioso: '😰', triste: '😢', enojado: '😠', 
  estresado: '😩', motivado: '💪', agradecido: '🙏', cansado: '😴', confundido: '🤔', 
  esperanzado: '🌟', inseguro: '😟', frustrado: '😤', nostalgico: '🥹', orgulloso: '🥳',
  sorprendido: '😮', abrumado: '😫', sereno: '🧘', inspirado: '✨', agotado: '😵', 
  optimista: '🌈', preocupado: '😣', relajado: '🛀', entusiasmado: '🤩',
  vulnerable: '🥺', equilibrado: '⚖️', solitario: '🫂', concentrado: '🎯', 
  avergonzado: '😳', renovado: '🌅'
};

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [IonicModule, CommonModule, SlicePipe, DatePipe, FormsModule, RouterModule],
  template: `
    <ion-content [fullscreen]="true" [scrollEvents]="true">
      <div class="page">
        <!-- HERO -->
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">¡Hola! 👋</h1>
              <p class="hero-subtitle">Bienvenido de nuevo</p>
              <p class="hero-date">Hoy es un buen día para cuidar de ti.</p>
            </div>
            <div class="hero-illustration">
              <div class="illustration-circle">
                <ion-icon name="leaf"></ion-icon>
              </div>
            </div>
          </div>
        </section>

        <!-- FRASE DEL DÍA -->
        <section class="section">
          <div class="card card-quote gradient-purple">
            <div class="quote-header">
              <span class="quote-label">(Frase del día)</span>
            </div>
            <p class="quote-text">{{ dailyQuote?.quote || 'La paz comienza con una sonrisa y se fortalece con cada respiración.' }}</p>
            <p class="quote-author">— {{ dailyQuote?.author || 'Cuida tu mente, cuida tu vida.' }}</p>
            <ion-icon name="chatbubble" class="quote-icon-bg"></ion-icon>
          </div>
        </section>

        <!-- ACCIONES RÁPIDAS -->
        <section class="section">
          <h2 class="section-title">Acciones rápidas</h2>
          <div class="quick-actions">
            <button class="action-btn" (click)="irJuegos()">
              <div class="action-icon action-respirar"><ion-icon name="leaf-outline"></ion-icon></div>
              <span>Respirar</span>
            </button>
            <button class="action-btn" (click)="mostrarConsejos = true">
              <div class="action-icon action-consejos"><ion-icon name="bulb-outline"></ion-icon></div>
              <span>Consejos</span>
            </button>
            <button class="action-btn" (click)="mostrarActividades = true">
              <div class="action-icon action-actividades"><ion-icon name="heart-outline"></ion-icon></div>
              <span>Actividades</span>
            </button>
            <button class="action-btn" (click)="irAgenda()">
              <div class="action-icon action-agenda"><ion-icon name="calendar-outline"></ion-icon></div>
              <span>Agenda</span>
            </button>
          </div>
        </section>

        <!-- TU BIENESTAR HOY -->
        <section class="section">
          <h2 class="section-title">Tu bienestar hoy</h2>
          <div class="stats-grid">
            <div class="stat-card" (click)="irEmociones()">
              <span class="stat-label">Ánimo</span>
              <div class="stat-value checkin-value">
                @if (checkinHoy) {
                  <span class="stat-emoji">{{ getEmotionEmoji(checkinHoy.emotion_id) }}</span>
                  <span class="stat-text color-primary">{{ checkinHoy.emotion_name }}</span>
                } @else {
                  <span class="stat-emoji">❓</span>
                  <span class="stat-text text-muted">Pendiente</span>
                }
              </div>
              @if (!checkinHoy) {
                <div class="stat-action">Hacer check-in</div>
              }
            </div>
            <div class="stat-card">
              <span class="stat-label">Racha actual</span>
              <div class="stat-value">
                <span class="stat-emoji">🔥</span>
                <span class="stat-text color-purple">{{ currentStreak }} días</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-label">Registros</span>
              <div class="stat-value">
                <span class="stat-emoji">📊</span>
                <span class="stat-text color-success">{{ totalCheckins }} total</span>
              </div>
            </div>
          </div>
        </section>

        <!-- SUGERENCIAS PARA TI -->
        <section class="section">
          <h2 class="section-title">Sugerencias para ti</h2>
          
          @if (dailyTip) {
            <div class="suggestion-card" (click)="mostrarConsejos = true">
              <div class="sugg-icon sugg-tip"><ion-icon name="star-outline"></ion-icon></div>
              <div class="sugg-content">
                <h3>{{ dailyTip.title }}</h3>
                <p>{{ dailyTip.description | slice:0:60 }}...</p>
              </div>
              <ion-icon name="chevron-forward" class="sugg-arrow"></ion-icon>
            </div>
          }

          @if (dailyActivity) {
            <div class="suggestion-card mt-2" (click)="mostrarActividades = true">
              <div class="sugg-icon sugg-act"><ion-icon name="leaf-outline"></ion-icon></div>
              <div class="sugg-content">
                <h3>{{ dailyActivity.title }}</h3>
                <p>{{ dailyActivity.description | slice:0:60 }}...</p>
              </div>
              <ion-icon name="chevron-forward" class="sugg-arrow"></ion-icon>
            </div>
          }
        </section>

        <!-- EVENTOS -->
        @if (eventos.length > 0) {
          <section class="section">
            <h2 class="section-title">Eventos próximos</h2>
            <div class="eventos-list">
              @for (evento of eventos; track evento.id) {
                <div class="card event-card" [routerLink]="['/evento', evento.id]">
                  <div class="event-image-container">
                    @if (evento.imagen_url) {
                      <img [src]="getPublicUrl(evento.imagen_url)" class="event-img" alt="Evento" onerror="this.style.display='none'">
                    } @else {
                      <div class="event-img-placeholder">
                        <ion-icon name="calendar"></ion-icon>
                      </div>
                    }
                    <div class="event-date-badge">
                      <span class="day">{{ evento.fecha_inicio | date:'dd' }}</span>
                      <span class="month">{{ evento.fecha_inicio | date:'MMM' }}</span>
                    </div>
                  </div>
                  <div class="event-content">
                    <span class="event-status" [style.background]="badgeBg(evento.estado)" [style.color]="badgeColor(evento.estado)">
                      {{ evento.estado }}
                    </span>
                    <h3>{{ evento.titulo }}</h3>
                    <p class="event-meta">
                      <ion-icon name="time-outline"></ion-icon> {{ evento.fecha_inicio | date:'shortTime' }}
                      @if (evento.ubicacion) {
                        <span class="meta-dot">•</span>
                        <ion-icon name="location-outline"></ion-icon> {{ evento.ubicacion }}
                      }
                    </p>
                  </div>
                </div>
              }
            </div>
          </section>
        }
        
        <div class="bottom-spacer"></div>
      </div>

      <!-- CONSEJOS MODAL -->
      @if (mostrarConsejos) {
        <div class="modal-overlay" (click)="mostrarConsejos = false">
          <div class="modal-content glass-card-strong" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Consejos para ti <span class="modal-count">{{ filteredTips.length }}</span></h2>
              <button class="btn-icon" (click)="mostrarConsejos = false"><ion-icon name="close-circle"></ion-icon></button>
            </div>
            <div class="modal-search">
              <ion-icon name="search-outline"></ion-icon>
              <input [(ngModel)]="tipsSearch" placeholder="Buscar consejos..." class="search-input" />
            </div>
            <div class="modal-tabs-container">
              <div class="modal-tabs">
                <button class="tab-btn" [class.active]="tipsFiltro === ''" (click)="tipsFiltro = ''">Todos</button>
                @for (cat of tipCategories; track cat) {
                  <button class="tab-btn" [class.active]="tipsFiltro === cat" (click)="tipsFiltro = cat">{{ getCategoryLabel(cat) }}</button>
                }
              </div>
            </div>
            <div class="modal-body">
              @for (tip of filteredTips; track tip.id) {
                <div class="modal-item">
                  <div class="modal-item-icon tips"><ion-icon name="star-outline"></ion-icon></div>
                  <div class="modal-item-content">
                    <strong>{{ tip.title }}</strong>
                    <p>{{ tip.description }}</p>
                    <div class="modal-item-footer">
                      <span class="modal-tag">{{ getCategoryLabel(tip.emotion_type) }}</span>
                      <ion-icon name="bookmark-outline" class="bookmark-icon"></ion-icon>
                    </div>
                  </div>
                </div>
              }
              @if (filteredTips.length === 0) {
                <div class="empty-state">
                  <ion-icon name="search-outline"></ion-icon>
                  <p>No se encontraron consejos.</p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- ACTIVIDADES MODAL -->
      @if (mostrarActividades) {
        <div class="modal-overlay" (click)="mostrarActividades = false">
          <div class="modal-content glass-card-strong" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Actividades <span class="modal-count">{{ filteredActivities.length }}</span></h2>
              <button class="btn-icon" (click)="mostrarActividades = false"><ion-icon name="close-circle"></ion-icon></button>
            </div>
            <div class="modal-search">
              <ion-icon name="search-outline"></ion-icon>
              <input [(ngModel)]="actsSearch" placeholder="Buscar actividades..." class="search-input" />
            </div>
            <div class="modal-tabs-container">
              <div class="modal-tabs">
                <button class="tab-btn" [class.active]="actsFiltro === ''" (click)="actsFiltro = ''">Todas</button>
                @for (cat of activityCategories; track cat) {
                  <button class="tab-btn" [class.active]="actsFiltro === cat" (click)="actsFiltro = cat">{{ getCategoryLabel(cat) }}</button>
                }
              </div>
            </div>
            <div class="modal-body">
              @for (act of filteredActivities; track act.id) {
                <div class="modal-item">
                  <div class="modal-item-icon activities"><ion-icon name="leaf"></ion-icon></div>
                  <div class="modal-item-content">
                    <div class="act-header">
                      <strong>{{ act.title }}</strong>
                    </div>
                    <p>{{ act.description }}</p>
                    <div class="modal-item-footer">
                      <span class="modal-tag">{{ act.duration }} min | {{ getCategoryLabel(act.activity_type) }}</span>
                      <button class="play-btn"><ion-icon name="play"></ion-icon></button>
                    </div>
                  </div>
                </div>
              }
              @if (filteredActivities.length === 0) {
                <div class="empty-state">
                  <ion-icon name="search-outline"></ion-icon>
                  <p>No se encontraron actividades.</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .page { background: #fafafa; min-height: 100%; font-family: var(--pg-font-body); }
    .hero-section { padding: 40px 24px 20px; }
    .hero-content { display: flex; justify-content: space-between; align-items: center; }
    .hero-title { font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 4px; }
    .hero-subtitle { font-size: 16px; font-weight: 700; color: #374151; margin: 0 0 4px; }
    .hero-date { font-size: 14px; color: #6b7280; margin: 0; }
    .illustration-circle { width: 64px; height: 64px; background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #10b981; box-shadow: 0 8px 16px rgba(0,0,0,0.06); border: 2px solid white; }
    
    .section { padding: 0 24px 24px; }
    .section-title { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 16px; }
    
    .card-quote { position: relative; overflow: hidden; padding: 24px; border-radius: var(--pg-radius-lg); box-shadow: var(--pg-shadow-md); margin-bottom: 8px; }
    .quote-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .quote-label { font-size: 13px; font-weight: 700; opacity: 0.9; }
    .quote-text { font-size: 16px; line-height: 1.5; font-weight: 600; margin: 0 0 16px; position: relative; z-index: 2; }
    .quote-author { font-size: 13px; opacity: 0.8; margin: 0; position: relative; z-index: 2; }
    .quote-icon-bg { position: absolute; right: -10px; bottom: -20px; font-size: 120px; opacity: 0.1; transform: rotate(10deg); }
    
    .quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .action-btn { background: transparent; border: none; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .action-icon { width: 56px; height: 56px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); background: white; transition: transform 0.2s; }
    .action-btn:active .action-icon { transform: scale(0.92); }
    .action-respirar { color: #10b981; border: 1px solid #ecfdf5; }
    .action-consejos { color: #8b5cf6; border: 1px solid #f3e8ff; }
    .action-actividades { color: #ef4444; border: 1px solid #fef2f2; }
    .action-agenda { color: #3b82f6; border: 1px solid #eff6ff; }
    .action-btn span { font-size: 12px; font-weight: 600; color: #4b5563; }
    
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .stat-card { background: white; border-radius: 20px; padding: 16px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 8px; border: 1px solid #f3f4f6; }
    .stat-label { font-size: 12px; color: #6b7280; font-weight: 600; text-align: center; }
    .stat-value { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .stat-emoji { font-size: 24px; }
    .stat-text { font-size: 14px; font-weight: 700; }
    .text-muted { color: #9ca3af; }
    .color-primary { color: #3b82f6; }
    .color-purple { color: #8b5cf6; }
    .color-success { color: #10b981; }
    .stat-action { font-size: 10px; color: #3b82f6; text-align: center; font-weight: 700; margin-top: 4px; background: #eff6ff; padding: 4px 0; border-radius: 8px; }
    
    .suggestion-card { background: white; border-radius: 20px; padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03); border: 1px solid #f3f4f6; transition: transform 0.2s; cursor: pointer; }
    .suggestion-card:active { transform: scale(0.98); }
    .sugg-icon { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .sugg-tip { background: #f3e8ff; color: #8b5cf6; }
    .sugg-act { background: #ecfdf5; color: #10b981; }
    .sugg-content { flex: 1; }
    .sugg-content h3 { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #111827; }
    .sugg-content p { margin: 0; font-size: 13px; color: #6b7280; line-height: 1.4; }
    .sugg-tag { display: inline-block; margin-top: 8px; font-size: 11px; font-weight: 600; color: #6b7280; }
    .sugg-arrow { color: #d1d5db; font-size: 20px; }
    .mt-2 { margin-top: 12px; }

    /* EVENTOS */
    .eventos-list { display: flex; flex-direction: column; gap: 12px; }
    .event-card { background: white; border-radius: 20px; padding: 12px; display: flex; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03); border: 1px solid #f3f4f6; text-decoration: none; color: inherit; transition: transform 0.2s; cursor: pointer; }
    .event-card:active { transform: scale(0.98); }
    .event-image-container { position: relative; width: 80px; height: 100px; border-radius: 16px; overflow: hidden; flex-shrink: 0; background: #f3f4f6; }
    .event-img { width: 100%; height: 100%; object-fit: cover; }
    .event-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #9ca3af; }
    .event-date-badge { position: absolute; top: 8px; left: 8px; right: 8px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .event-date-badge .day { font-size: 14px; font-weight: 800; color: #1f2937; line-height: 1; }
    .event-date-badge .month { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #627eff; letter-spacing: 0.02em; }
    .event-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .event-status { align-self: flex-start; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.05em; margin-bottom: 8px; }
    .event-content h3 { margin: 0 0 6px; font-size: 15px; font-weight: 800; color: #1f2937; line-height: 1.3; }
    .event-meta { margin: 0; font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
    .meta-dot { color: #d1d5db; margin: 0 4px; }
    
    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }

    /* MODALS */
    .modal-overlay { position: fixed; inset: 0; z-index: 900; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(8px); }
    .modal-content { background: white; border-radius: 32px 32px 0 0; width: 100%; max-height: 85vh; display: flex; flex-direction: column; padding: 24px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.1); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 0 24px; flex-shrink: 0; }
    .modal-header h2 { font-size: 20px; font-weight: 800; color: #111827; margin: 0; display: flex; align-items: center; gap: 8px; }
    .modal-count { background: #eff6ff; color: #3b82f6; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 10px; }
    .btn-icon { background: none; border: none; font-size: 28px; color: #d1d5db; padding: 0; display: flex; }
    .modal-search { display: flex; align-items: center; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 16px; padding: 0 16px; margin: 0 24px 16px; flex-shrink: 0; height: 48px; }
    .modal-search ion-icon { color: #9ca3af; font-size: 20px; }
    .search-input { background: none; border: none; padding: 0 12px; width: 100%; font-size: 15px; color: #111827; outline: none; }
    .modal-tabs-container { width: 100%; overflow-x: auto; scrollbar-width: none; flex-shrink: 0; margin-bottom: 8px; }
    .modal-tabs-container::-webkit-scrollbar { display: none; }
    .modal-tabs { display: inline-flex; gap: 8px; padding: 0 24px 8px; }
    .tab-btn { white-space: nowrap; background: white; border: 1px solid #e5e7eb; padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; color: #4b5563; flex-shrink: 0; transition: all 0.2s; }
    .tab-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.25); }
    .modal-body { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding: 8px 24px 32px; }
    .modal-item { display: flex; gap: 16px; background: white; border: 1px solid #f3f4f6; border-radius: 20px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
    .modal-item-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
    .modal-item-icon.tips { background: #fdf4ff; color: #c026d3; }
    .modal-item-icon.activities { background: #ecfdf5; color: #10b981; }
    .modal-item-content { flex: 1; display: flex; flex-direction: column; }
    .modal-item-content strong { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .modal-item-content p { font-size: 14px; color: #6b7280; margin: 0 0 12px; line-height: 1.5; }
    .modal-item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .modal-tag { font-size: 11px; background: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 8px; font-weight: 600; }
    .bookmark-icon { font-size: 22px; color: #9ca3af; }
    .act-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .play-btn { width: 36px; height: 36px; border-radius: 50%; background: #627eff; color: white; border: none; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(98, 126, 255, 0.3); }
    .empty-state { text-align: center; padding: 40px 0; color: #9ca3af; }
    .empty-state ion-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
    .empty-state p { font-size: 15px; margin: 0; }
  `]
})
export class InicioComponent implements OnInit {
  private content = inject(ContentEngineService);
  private emotionsService = inject(EmotionsService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  checkinHoy: EmotionCheckIn | undefined;
  dailyQuote: LocalQuote | undefined;
  dailyTip: LocalTip | undefined;
  dailyActivity: LocalActivity | undefined;
  
  currentStreak = 0;
  totalCheckins = 0;

  mostrarConsejos = false;
  mostrarActividades = false;
  allTips: LocalTip[] = [];
  allActivities: LocalActivity[] = [];
  tipsSearch = '';
  actsSearch = '';
  tipsFiltro = '';
  actsFiltro = '';
  tipCategories: string[] = [];
  activityCategories: string[] = [];
  eventos: any[] = [];

  get filteredTips(): LocalTip[] {
    let list = this.tipsFiltro ? this.allTips.filter(t => t.emotion_type === this.tipsFiltro) : this.allTips;
    if (this.tipsSearch) {
      const t = this.tipsSearch.toLowerCase();
      list = list.filter(item => item.title.toLowerCase().includes(t) || item.description.toLowerCase().includes(t));
    }
    return list;
  }

  get filteredActivities(): LocalActivity[] {
    let list = this.actsFiltro ? this.allActivities.filter(a => a.activity_type === this.actsFiltro) : this.allActivities;
    if (this.actsSearch) {
      const t = this.actsSearch.toLowerCase();
      list = list.filter(item => item.title.toLowerCase().includes(t) || item.description.toLowerCase().includes(t));
    }
    return list;
  }

  async ngOnInit() {
    await this.content.init();
    await this.emotionsService.init();

    this.checkinHoy = this.emotionsService.getTodayCheckin();
    this.dailyQuote = this.content.getDailyQuote();
    this.dailyTip = this.content.getDailyTip();
    this.allTips = this.content.getAvailableTips();
    this.allActivities = this.content.getAvailableActivities();
    this.tipCategories = [...new Set(this.allTips.map(t => t.emotion_type).filter(Boolean))];
    this.activityCategories = [...new Set(this.allActivities.map(a => a.activity_type).filter(Boolean))];
    this.dailyActivity = this.content.getDailyActivity();
    
    // Load Events
    try {
      this.eventos = await this.supabase.getProximosEventos(3);
    } catch (e) {
      console.error('Error loading events:', e);
    }

    const history = this.emotionsService.getHistory();
    this.totalCheckins = history.length;
    this.currentStreak = this.calculateStreak(history);
  }

  private calculateStreak(history: EmotionCheckIn[]): number {
    if (!history || history.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let currentDate = today;
    
    for (const c of history) {
      if (c.created_at) {
        const d = new Date(c.created_at);
        d.setHours(0,0,0,0);
        if (d.getTime() === currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (d.getTime() < currentDate.getTime()) {
          if (streak === 0 && d.getTime() === new Date(today.getTime() - 86400000).getTime()) {
            streak++;
            currentDate = new Date(today.getTime() - 86400000 * 2);
          } else {
            break;
          }
        }
      }
    }
    return streak > 0 ? streak : (history.length > 0 ? 1 : 0);
  }

  getEmotionEmoji(id: string | undefined): string {
    return EMOTION_EMOJI_MAP[id || ''] || '🤍';
  }

  getCategoryLabel(value: string | undefined): string {
    return CATEGORY_LABELS[(value || '').toLowerCase().trim()] || value || 'General';
  }

  getPublicUrl(path: string): string {
    if (!path) return '';
    return this.supabase.getPublicUrl('eventos', path);
  }

  badgeColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo': return '#10b981';
      case 'proximo':
      case 'próximo': return '#3b82f6';
      case 'finalizado': return '#6b7280';
      case 'cancelado': return '#ef4444';
      case 'pospuesto': return '#f59e0b';
      default: return '#8b5cf6';
    }
  }

  badgeBg(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo': return '#ecfdf5';
      case 'proximo':
      case 'próximo': return '#eff6ff';
      case 'finalizado': return '#f3f4f6';
      case 'cancelado': return '#fef2f2';
      case 'pospuesto': return '#fffbeb';
      default: return '#f3e8ff';
    }
  }

  irAgenda() { this.router.navigate(['/agenda']); }
  irEmociones() { this.router.navigate(['/emociones']); }
  irJuegos() { this.router.navigate(['/minijuegos']); }
}
