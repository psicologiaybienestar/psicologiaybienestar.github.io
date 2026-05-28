import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, SlicePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '@shared/services/supabase.service';
import { ContentEngineService, LocalQuote, LocalActivity, LocalTip } from '@shared/services/content-engine.service';
import { EmotionsService, EmotionCheckIn } from '@shared/services/emotions.service';
import { UserProfileService } from '@shared/services/user-profile.service';

const EMOTION_EMOJI_MAP: Record<string, string> = {
  feliz: 'ðŸ˜Š', tranquilo: 'ðŸ˜Œ', ansioso: 'ðŸ˜°',
  triste: 'ðŸ˜¢', enojado: 'ðŸ˜ ', estresado: 'ðŸ˜©',
  motivado: 'ðŸ’ª', agradecido: 'ðŸ™', cansado: 'ðŸ˜´',
  confundido: 'ðŸ¤”', esperanzado: 'ðŸŒŸ', inseguro: 'ðŸ˜Ÿ',
  frustrado: 'ðŸ˜¤', nostalgico: 'ðŸ¥¹', orgulloso: 'ðŸ¥³',
  sorprendido: 'ðŸ˜®', abrumado: 'ðŸ˜«', sereno: 'ðŸ§˜',
  inspirado: 'âœ¨', agotado: 'ðŸ˜µ', optimista: 'ðŸŒˆ',
  preocupado: 'ðŸ˜£', relajado: 'ðŸ›€', entusiasmado: 'ðŸ¤©',
  vulnerable: 'ðŸ¥º', equilibrado: 'âš–ï¸', solitario: 'ðŸ«‚',
  concentrado: 'ðŸŽ¯', avergonzado: 'ðŸ˜³', renovado: 'ðŸŒ…'
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  ansiedad: 'Ansiedad',
  autoestima: 'Autoestima',
  relajacion: 'Relajación',
  Relajación: 'Relajación',
  estres: 'Estrés',
  Estrés: 'Estrés',
  motivacion: 'Motivación',
  Motivación: 'Motivación',
  mindfulness: 'Mindfulness',
  bienestar: 'Bienestar',
  respiracion: 'Respiración',
  Respiración: 'Respiración',
  meditation: 'Meditación',
  breathing: 'Respiración',
  relaxation: 'Relajación',
  exercise: 'Ejercicio',
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
          <div class="hero-bg"></div>
          <div class="hero-content">
            <p class="hero-date">{{ hoy | date:'fullDate' }}</p>
            <ion-icon name="sunny" class="hero-icon"></ion-icon>
            <h1 class="hero-title">{{ saludo }}, {{ nickname || 'Bienvenido' }}</h1>
            <p class="hero-subtitle">Tu espacio seguro para el bienestar emocional</p>
          </div>
        </section>

        <!-- CHECK-IN -->
        <section class="section">
          @if (checkinHoy) {
            <div class="card card-checkin">
              <div class="checkin-row">
                <div class="checkin-icon">
                  {{ getEmotionEmoji(checkinHoy.emotion_name) }}
                </div>
                <div class="checkin-info">
                  <span class="checkin-label">Hoy te sientes</span>
                  <strong class="checkin-value">{{ checkinHoy.emotion_name }}</strong>
                </div>
                <button class="btn-small" (click)="irEmociones()">Actualizar</button>
              </div>
            </div>
          } @else {
            <div class="card card-checkin">
              <div class="checkin-row">
                <div class="checkin-prompt-text">
                  <h3>Cómo va tu día</h3>
                  <p>Registra tu estado emocional ahora</p>
                </div>
                <button class="btn-primary" (click)="irEmociones()">Comenzar</button>
              </div>
            </div>
          }
        </section>

        <!-- QUOTE -->
        <section class="section">
          <div class="card card-quote">
            <ion-icon name="chatbubble-ellipses" class="quote-icon"></ion-icon>
            <p class="quote-text">"{{ dailyQuote?.quote }}"</p>
            <div class="quote-footer">
              <span class="quote-author">{{ dailyQuote?.author || 'AnÃ³nimo' }}</span>
              <button class="btn-icon" (click)="refreshQuote()">
                <ion-icon name="refresh" [class.spinning]="loadingQuote"></ion-icon>
              </button>
            </div>
          </div>
        </section>



        <!-- CONSEJOS MODAL -->
        @if (mostrarConsejos) {
          <div class="modal-overlay" (click)="mostrarConsejos = false">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Consejos para ti <span class="modal-count">{{ filteredTips.length }}</span></h2>
                <button class="btn-icon" (click)="mostrarConsejos = false"><ion-icon name="close"></ion-icon></button>
              </div>
              <div class="modal-search">
                <ion-icon name="search"></ion-icon>
                <input [(ngModel)]="tipsSearch" placeholder="Buscar consejos..." class="search-input" (click)="$event.stopPropagation()" />
              </div>
              <div class="modal-tabs">
                <button class="tab-btn" [class.active]="tipsFiltro === ''" (click)="tipsFiltro = ''">Todas</button>
                @for (cat of tipCategories; track cat) {
                  <button class="tab-btn" [class.active]="tipsFiltro === cat" (click)="tipsFiltro = cat">{{ getCategoryLabel(cat) }}</button>
                }
              </div>
              <div class="modal-body">
                @for (tip of filteredTips; track tip.id) {
                  <div class="modal-item">
                    <span class="modal-item-icon tips"><ion-icon name="bulb-outline"></ion-icon></span>
                    <div>
                      <strong>{{ tip.title }}</strong>
                      <p>{{ tip.description }}</p>
                      <span class="modal-tag">{{ getCategoryLabel(tip.emotion_type) }}</span>
                    </div>
                  </div>
                }
                @if (filteredTips.length === 0) {
                  <p class="empty-text">No se encontraron consejos.</p>
                }
              </div>
            </div>
          </div>
        }

        <!-- ACTIVIDADES MODAL -->
        @if (mostrarActividades) {
          <div class="modal-overlay" (click)="mostrarActividades = false">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Actividades de Bienestar <span class="modal-count">{{ filteredActivities.length }}</span></h2>
                <button class="btn-icon" (click)="mostrarActividades = false"><ion-icon name="close"></ion-icon></button>
              </div>
              <div class="modal-search">
                <ion-icon name="search"></ion-icon>
                <input [(ngModel)]="actsSearch" placeholder="Buscar actividades..." class="search-input" (click)="$event.stopPropagation()" />
              </div>
              <div class="modal-tabs">
                <button class="tab-btn" [class.active]="actsFiltro === ''" (click)="actsFiltro = ''">Todas</button>
                @for (cat of activityCategories; track cat) {
                  <button class="tab-btn" [class.active]="actsFiltro === cat" (click)="actsFiltro = cat">{{ getCategoryLabel(cat) }}</button>
                }
              </div>
              <div class="modal-body">
                @for (act of filteredActivities; track act.id) {
                  <div class="modal-item">
                    <span class="modal-item-icon activities"><ion-icon name="leaf-outline"></ion-icon></span>
                    <div>
                      <strong>{{ act.title }}</strong>
                      <p>{{ act.description }}</p>
                      <span class="modal-tag">{{ act.duration }} min | {{ getCategoryLabel(act.activity_type) }}</span>
                    </div>
                  </div>
                }
                @if (filteredActivities.length === 0) {
                  <p class="empty-text">No se encontraron actividades.</p>
                }
              </div>
            </div>
          </div>
        }

        <!-- EVENTS SECTION -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Eventos</h2>
            @if (eventos.length > 0) {
              <span class="count">{{ eventos.length }}</span>
            }
          </div>
          @if (eventosFiltrados.length === 0) {
            <div class="empty-state">
              <ion-icon name="calendar-outline"></ion-icon>
              <p>No hay eventos disponibles</p>
            </div>
          }
          <div class="events-list">
            @for (ev of eventosFiltrados; track ev.id) {
              <div class="card card-event clickable" [style.border-left]="'4px solid ' + eventColor(ev.estado)" (click)="irEvento(ev.id)">
                <div class="event-header">
                  <h3>{{ ev.titulo }}</h3>
                  <span class="event-badge" [style.background]="eventBg(ev.estado)" [style.color]="eventColor(ev.estado)">
                    <ion-icon [name]="eventIcon(ev.estado)"></ion-icon>
                    {{ eventLabel(ev.estado) }}
                  </span>
                </div>
                <p class="event-desc">{{ (ev.descripcion || ev.resumen || ev.contenido || '') | slice:0:100 }}{{ (ev.descripcion || ev.resumen || ev.contenido || '').length > 100 ? '...' : '' }}</p>
                <div class="event-footer">
                  <span><ion-icon name="calendar-outline"></ion-icon> {{ ev.fecha_inicio || ev.fecha || ev.created_at | date:'dd MMM yyyy' }}</span>
                  @if (ev.ubicacion || ev.lugar) {
                    <span><ion-icon name="location-outline"></ion-icon> {{ ev.ubicacion || ev.lugar }}</span>
                  }
                </div>
              </div>
            }
          </div>
        </section>

        <!-- DAILY TIP -->
        <section class="section">
          <div class="card card-daily">
            <span class="daily-badge">Consejo recomendado del día</span>
            <div class="daily-row">
              <div class="daily-icon daily-icon-tip"><ion-icon name="bulb"></ion-icon></div>
              <div class="daily-text">
                <h3>{{ dailyTip?.title || 'Consejo para hoy' }}</h3>
                <p>{{ dailyTip?.description || 'Tomate un momento para reflexionar y cuidar tu bienestar emocional.' }}</p>
                <span class="daily-meta">{{ getCategoryLabel(dailyTip?.emotion_type || 'bienestar') }}</span>
              </div>
            </div>
            <button class="btn-outline btn-full" (click)="mostrarConsejos = true">Ver más consejos</button>
          </div>
        </section>

        <!-- DAILY ACTIVITY -->
        <section class="section">
          <div class="card card-daily">
            <span class="daily-badge">Recomendado para ti</span>
            <div class="daily-row">
              <div class="daily-icon daily-icon-activity"><ion-icon name="leaf"></ion-icon></div>
              <div class="daily-text">
                <h3>{{ dailyActivity?.title || 'Relajacion Guiada' }}</h3>
                <p>{{ dailyActivity?.description || 'Tomate un momento para respirar y reconectar contigo mismo.' }}</p>
                <span class="daily-meta">{{ dailyActivity?.duration || 5 }} min | {{ getCategoryLabel(dailyActivity?.activity_type || 'mindfulness') }}</span>
              </div>
            </div>
            <button class="btn-outline btn-full" (click)="mostrarActividades = true">Ver actividad</button>
          </div>
        </section>

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page { background: #ffffff; min-height: 100%; }
    .hero-section { position: relative; padding: 28px 20px 8px; overflow: hidden; text-align: center; }
    .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%); opacity: 0.06; pointer-events: none; }
    .hero-content { position: relative; }
    .hero-date { font-size: 12px; color: #9ca3af; text-transform: capitalize; margin-bottom: 8px; }
    .hero-icon { font-size: 48px; color: var(--ion-color-primary); display: block; margin: 0 auto 8px; }
    .hero-title { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0 0 4px; }
    .hero-subtitle { font-size: 14px; color: #6b7280; max-width: 280px; margin: 0 auto; line-height: 1.5; }
    .section { padding: 4px 20px 22px; }
    .section-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .section-header .section-title { margin: 0; }
    .count { background: #f3f4f6; color: #6b7280; padding: 2px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; }
    .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .card-checkin .checkin-row { display: flex; align-items: center; gap: 12px; }
    .checkin-icon { width: 44px; height: 44px; border-radius: 12px; background: #eef2ff; color: var(--ion-color-primary); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
    .checkin-info { flex: 1; }
    .checkin-label { display: block; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; }
    .checkin-value { font-size: 16px; color: #1f2937; }
    .checkin-prompt-text { flex: 1; }
    .checkin-prompt-text h3 { font-size: 16px; font-weight: 700; color: #1f2937; margin: 0; }
    .checkin-prompt-text p { font-size: 13px; color: #6b7280; margin: 2px 0 0; }
    .btn-primary { background: var(--ion-color-primary); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; white-space: nowrap; }
    .btn-outline { background: transparent; color: var(--ion-color-primary); border: 1.5px solid var(--ion-color-primary); padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 15px; white-space: nowrap; transition: all 0.15s ease; }
    .btn-outline:active { background: #eef2ff; }
    .btn-full { width: 100%; margin-top: 14px; }
    .btn-small { background: none; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; color: var(--ion-color-primary); white-space: nowrap; transition: all 0.15s ease; }
    .btn-icon { background: none; border: none; font-size: 20px; color: #9ca3af; padding: 4px; }
    .spinning { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .card-quote { position: relative; background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%); padding-left: 20px; overflow: hidden; }
    .card-quote::before { content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 4px; background: linear-gradient(180deg, var(--ion-color-primary), #53c6e4); border-radius: 0 4px 4px 0; }
    .quote-icon { position: absolute; top: 8px; right: 8px; font-size: 44px; color: var(--ion-color-primary); opacity: 0.08; }
    .quote-text { font-size: 15px; line-height: 1.7; color: #374151; font-weight: 500; font-style: italic; margin: 0 0 12px; padding-right: 20px; }
    .quote-footer { display: flex; justify-content: space-between; align-items: center; }
    .quote-author { font-size: 12px; color: #6b7280; font-weight: 600; }

    .modal-overlay { position: fixed; inset: 0; z-index: 900; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); }
    .modal-content { background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%); border-radius: 28px 28px 0 0; width: 100%; max-height: 80vh; display: flex; flex-direction: column; padding: 20px 20px 0; box-shadow: 0 -20px 60px rgba(31, 41, 55, 0.18); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; }
    .modal-header h2 { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 6px; }
    .modal-count { display: inline-flex; align-items: center; justify-content: center; background: #eef2ff; color: var(--ion-color-primary); font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 8px; min-width: 22px; }
    .modal-search { display: flex; align-items: center; background: white; border: 1px solid #eef2ff; border-radius: 14px; padding: 0 14px; margin-bottom: 12px; flex-shrink: 0; box-shadow: 0 8px 20px rgba(98, 126, 255, 0.06); }
    .modal-search ion-icon { color: #9ca3af; font-size: 18px; flex-shrink: 0; }
    .search-input { background: none; border: none; padding: 12px 10px; width: 100%; font-size: 14px; color: #1f2937; outline: none; }
    .modal-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 10px; flex-shrink: 0; }
    .modal-tabs::-webkit-scrollbar { display: none; }
    .tab-btn { white-space: nowrap; background: transparent; border: 1px solid #eef2ff; padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #6b7280; flex-shrink: 0; transition: all 0.18s ease; }
    .tab-btn.active { background: #eef2ff; color: var(--ion-color-primary); border-color: #dbe3ff; box-shadow: 0 6px 14px rgba(98, 126, 255, 0.12); }
    .modal-body { display: flex; flex-direction: column; gap: 14px; overflow-y: auto; padding-bottom: 22px; }
    .modal-item { display: flex; gap: 14px; align-items: flex-start; background: #ffffff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.02); transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .modal-item:active { transform: scale(0.98); box-shadow: 0 6px 16px rgba(31, 41, 55, 0.06); }
    .modal-item-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .modal-item-icon.tips { background: #fff7ed; color: #f59e0b; }
    .modal-item-icon.activities { background: #ecfdf5; color: #10b981; }
    .modal-item strong { display: block; font-size: 14px; color: #1f2937; line-height: 1.3; }
    .modal-item p { font-size: 12px; color: #6b7280; margin: 4px 0 0; line-height: 1.45; }
    .modal-tag { font-size: 10px; background: #f0f4ff; color: #6366f1; padding: 4px 10px; border-radius: 999px; display: inline-block; margin-top: 8px; font-weight: 700; letter-spacing: 0.02em; border: 1px solid rgba(99,102,241,0.12); }
    .empty-text { text-align: center; color: #9ca3af; font-size: 14px; padding: 24px; }
    .empty-state { text-align: center; padding: 32px 24px; color: #d1d5db; }
    .empty-state ion-icon { font-size: 40px; margin-bottom: 10px; }
    .empty-state p { font-size: 14px; color: #9ca3af; }
    .events-list { display: flex; flex-direction: column; gap: 10px; }
    .card-event { border-left: 4px solid var(--ion-color-primary); }
    .event-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .event-header h3 { font-size: 15px; font-weight: 700; color: #1f2937; margin: 0; flex: 1; }
    .event-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; white-space: nowrap; display: inline-flex; align-items: center; gap: 3px; }
    .event-badge ion-icon { font-size: 11px; }
    .card-event.clickable { cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .card-event.clickable:active { transform: scale(0.99); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .event-desc { font-size: 12px; color: #6b7280; margin: 0 0 10px; line-height: 1.45; }
    .event-footer { display: flex; gap: 16px; font-size: 11px; color: #9ca3af; }
    .event-footer span { display: flex; align-items: center; gap: 4px; }
    .card-daily { }
    .daily-badge { display: inline-block; background: #eef2ff; color: var(--ion-color-primary); font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; letter-spacing: 0.03em; }
    .daily-row { display: flex; gap: 12px; }
    .daily-icon { width: 46px; height: 46px; border-radius: 14px; background: #eef2ff; display: flex; align-items: center; justify-content: center; font-size: 22px; color: var(--ion-color-primary); flex-shrink: 0; }
    .daily-icon-tip { background: #fef3c7; color: #f59e0b; }
    .daily-icon-activity { background: #ecfdf5; color: #10b981; }
    .daily-text h3 { font-size: 16px; font-weight: 700; color: #1f2937; margin: 0; }
    .daily-text p { font-size: 13px; color: #6b7280; margin: 4px 0; line-height: 1.5; }
    .daily-meta { font-size: 11px; color: #9ca3af; font-weight: 500; }

    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `],
})
export class InicioComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private content = inject(ContentEngineService);
  private emotionsService = inject(EmotionsService);
  private userProfileService = inject(UserProfileService);
  private router = inject(Router);

  hoy = new Date();
  saludo = '';
  nickname = '';
  checkinHoy: EmotionCheckIn | undefined;
  dailyQuote: LocalQuote | undefined;
  dailyTip: LocalTip | undefined;
  dailyActivity: LocalActivity | undefined;
  eventos: any[] = [];
  loadingQuote = false;

  get eventosFiltrados(): any[] {
    return this.eventos.filter(ev =>
      ['publicado', 'proximo', 'finalizado', 'cancelado', 'pospuesto'].includes(ev.estado)
    );
  }
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
    this.setSaludo();
    await this.content.init();
    await this.emotionsService.init();

    const profile = this.userProfileService.currentProfile;
    if (profile?.nickname) this.nickname = profile.nickname;

    this.checkinHoy = this.emotionsService.getTodayCheckin();
    this.dailyQuote = this.content.getDailyQuote();
    this.dailyTip = this.content.getDailyTip();
    this.allTips = this.content.getAvailableTips();
    this.allActivities = this.content.getAvailableActivities();
    this.tipCategories = [...new Set(this.allTips.map(t => t.emotion_type).filter(Boolean))];
    this.activityCategories = [...new Set(this.allActivities.map(a => a.activity_type).filter(Boolean))];

    this.dailyActivity = this.content.getDailyActivity();
    await this.loadEventos();
  }

  private setSaludo() {
    const h = new Date().getHours();
    if (h < 12) this.saludo = 'Buenos dias';
    else if (h < 18) this.saludo = 'Buenas tardes';
    else this.saludo = 'Buenas noches';
  }

  private async loadEventos() {
    try {
      const { data } = await this.supabase.client
        .from('eventos')
        .select('*')
        .order('fecha_inicio', { ascending: false, nullsFirst: false })
        .limit(20);
      this.eventos = data || [];
    } catch {}
  }

  eventColor(estado: string): string {
    switch (estado) {
      case 'publicado': return '#627eff';
      case 'proximo': return '#60a5fa';
      case 'pospuesto': return '#f59e0b';
      case 'finalizado': return '#10b981';
      case 'cancelado': return '#ef4444';
      default: return '#9ca3af';
    }
  }

  eventBg(estado: string): string {
    switch (estado) {
      case 'publicado': return '#eef2ff';
      case 'proximo': return '#eff6ff';
      case 'pospuesto': return '#fef3c7';
      case 'finalizado': return '#ecfdf5';
      case 'cancelado': return '#fef2f2';
      default: return '#f3f4f6';
    }
  }

  eventIcon(estado: string): string {
    switch (estado) {
      case 'publicado': return 'checkmark-circle';
      case 'proximo': return 'time';
      case 'pospuesto': return 'alert-circle';
      case 'finalizado': return 'checkmark-done';
      case 'cancelado': return 'close-circle';
      default: return 'ellipse';
    }
  }

  eventLabel(estado: string): string {
    switch (estado) {
      case 'publicado': return 'Publicado';
      case 'proximo': return 'Proximo';
      case 'pospuesto': return 'Pospuesto';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return estado || 'Evento';
    }
  }

  refreshQuote() {
    this.loadingQuote = true;
    setTimeout(() => {
      this.dailyQuote = this.content.getRandomQuote();
      this.loadingQuote = false;
    }, 600);
  }

  getEmotionEmoji(emotionName: string): string {
    return EMOTION_EMOJI_MAP[emotionName?.toLowerCase().trim()] || 'ðŸ«¶';
  }

  getCategoryLabel(value: string): string {
    return CATEGORY_LABELS[value?.toLowerCase().trim()] || value || 'General';
  }

  irAgenda() { this.router.navigate(['/agenda']); }
  irEmociones() { this.router.navigate(['/emociones']); }
  irJuegos() { this.router.navigate(['/minijuegos']); }
  irEvento(id: string) { this.router.navigate(['/evento', id]); }
}
