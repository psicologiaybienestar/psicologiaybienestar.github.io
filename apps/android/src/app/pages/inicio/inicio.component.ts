import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SlicePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '@shared/services/supabase.service';
import { QuotesService } from '@shared/services/quotes.service';
import { PlatformService } from '@shared/services/platform.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [IonicModule, SlicePipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Psicología & Bienestar</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="hero-section gradient-primary">
        <div class="hero-content">
          <h1>Bienvenido</h1>
          <p>Tu espacio seguro para el bienestar emocional</p>
        </div>
        <div class="hero-glow"></div>
      </div>

      @if (frase) {
        <div class="glass-card quote-card">
          <div class="quote-mark"></div>
          <p class="quote-text">{{ frase.quote }}</p>
          <p class="quote-author">{{ frase.author || 'Anonimo' }}</p>
          <button class="quote-refresh" (click)="cargarFrase()" [disabled]="cargandoFrase">
            <ion-icon name="refresh" [class.spinning]="cargandoFrase" />
          </button>
        </div>
      }

      <div class="stats-grid">
        <div class="glass-card stat-card">
          <ion-icon name="newspaper" color="primary" />
          <span class="stat-value">{{ stats.noticias }}</span>
          <span class="stat-label">Noticias</span>
        </div>
        <div class="glass-card stat-card">
          <ion-icon name="calendar" color="secondary" />
          <span class="stat-value">{{ stats.eventos }}</span>
          <span class="stat-label">Eventos</span>
        </div>
        <div class="glass-card stat-card">
          <ion-icon name="game-controller" style="color: #8b5cf6" />
          <span class="stat-value">{{ stats.juegos }}</span>
          <span class="stat-label">Juegos</span>
        </div>
        <div class="glass-card stat-card">
          <ion-icon name="bulb" color="warning" />
          <span class="stat-value">{{ stats.consejos }}</span>
          <span class="stat-label">Consejos</span>
        </div>
      </div>

      <div class="quick-actions">
        <button class="glass-card action-card" (click)="irAgenda()">
          <div class="action-icon gradient-primary">
            <ion-icon name="calendar-clear" />
          </div>
          <span>Agendar cita</span>
        </button>
        <button class="glass-card action-card" (click)="abrirWeb()">
          <div class="action-icon gradient-purple">
            <ion-icon name="globe" />
          </div>
          <span>Version web</span>
        </button>
      </div>

      @if (ultimasNoticias.length > 0) {
        <div class="section">
          <h2 class="section-title">Ultimas noticias</h2>
          <div class="news-list">
            @for (item of ultimasNoticias; track item.id) {
              <div class="glass-card news-card">
                <div class="news-dot"></div>
                <div class="news-body">
                  <h3>{{ item.titulo }}</h3>
                  <p>{{ item.resumen || item.contenido | slice:0:80 }}{{ (item.resumen || item.contenido)?.length > 80 ? '...' : '' }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </ion-content>
  `,
  styles: `
    .hero-section { border-radius: var(--pg-radius-lg); padding: var(--pg-space-xl); margin: 0 0 var(--pg-space-lg); position: relative; overflow: hidden; }
    .hero-content { position: relative; z-index: 1; }
    .hero-content h1 { font: var(--pg-font-heading); color: white; margin: 0 0 var(--pg-space-xs); }
    .hero-content p { font: var(--pg-font-body); color: rgba(255,255,255,0.85); margin: 0; }
    .hero-glow { position: absolute; top: -50%; right: -30%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }

    .quote-card { padding: var(--pg-space-lg); margin-bottom: var(--pg-space-lg); position: relative; }
    .quote-mark { width: 3px; height: 36px; background: var(--pg-gradient-primary); border-radius: 2px; margin-bottom: var(--pg-space-sm); }
    .quote-text { font-size: 15px; font-style: italic; color: var(--ion-text-color); line-height: 1.6; margin: 0 0 var(--pg-space-sm); }
    .quote-author { font-size: 12px; color: var(--ion-color-medium); margin: 0; font-weight: 500; }
    .quote-refresh { position: absolute; top: var(--pg-space-md); right: var(--pg-space-md); width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--ion-color-light); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ion-color-medium); font-size: 16px; }
    .spinning { animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--pg-space-md); margin-bottom: var(--pg-space-lg); }
    .stat-card { padding: var(--pg-space-lg); text-align: center; }
    .stat-card ion-icon { font-size: 28px; margin-bottom: var(--pg-space-xs); }
    .stat-value { display: block; font-size: 22px; font-weight: 800; color: var(--ion-text-color); }
    .stat-label { display: block; font-size: 12px; color: var(--ion-color-medium); margin-top: 2px; font-weight: 500; }

    .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--pg-space-md); margin-bottom: var(--pg-space-lg); }
    .action-card { display: flex; flex-direction: column; align-items: center; gap: var(--pg-space-sm); padding: var(--pg-space-lg); cursor: pointer; transition: var(--pg-transition-fast); font-family: inherit; }
    .action-card:active { transform: scale(0.96); }
    .action-icon { width: 44px; height: 44px; border-radius: var(--pg-radius-sm); display: flex; align-items: center; justify-content: center; }
    .action-icon ion-icon { font-size: 22px; color: white; }
    .action-card span { font-size: 13px; font-weight: 600; color: var(--ion-text-color); }

    .section { margin-bottom: var(--pg-space-lg); }
    .section-title { font: var(--pg-font-subtitle); color: var(--ion-text-color); margin: 0 0 var(--pg-space-md); }

    .news-list { display: flex; flex-direction: column; gap: var(--pg-space-sm); }
    .news-card { display: flex; gap: var(--pg-space-md); padding: var(--pg-space-md); }
    .news-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ion-color-primary); flex-shrink: 0; margin-top: 6px; }
    .news-body { flex: 1; min-width: 0; }
    .news-body h3 { font-size: 15px; font-weight: 600; margin: 0 0 2px; color: var(--ion-text-color); }
    .news-body p { font-size: 13px; color: var(--ion-color-medium); margin: 0; line-height: 1.4; }
  `,
})
export class InicioComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private quotesService = inject(QuotesService);
  private platform = inject(PlatformService);
  private router = inject(Router);

  frase: any = null;
  cargandoFrase = false;
  stats = { noticias: 0, eventos: 0, juegos: 0, consejos: 0 };
  ultimasNoticias: any[] = [];

  async ngOnInit() {
    await Promise.all([
      this.cargarStats(),
      this.cargarFrase(),
      this.cargarNoticias(),
    ]);
  }

  private async cargarStats() {
    try {
      const [n, e, j, c] = await Promise.all([
        this.supabase.client.from('noticias').select('*', { count: 'exact', head: true }).eq('estado', 'publicado'),
        this.supabase.client.from('eventos').select('*', { count: 'exact', head: true }).eq('estado', 'publicado'),
        this.supabase.client.from('mini_games').select('*', { count: 'exact', head: true }).eq('is_active', true),
        this.supabase.client.from('emotional_tips').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      this.stats = {
        noticias: n.count ?? 0,
        eventos: e.count ?? 0,
        juegos: j.count ?? 0,
        consejos: c.count ?? 0,
      };
    } catch { }
  }

  async cargarFrase() {
    this.cargandoFrase = true;
    try {
      const quotes = await this.quotesService.getActivas(10);
      const restantes = quotes.filter(q => q.id !== this.frase?.id);
      const pool = restantes.length > 0 ? restantes : quotes;
      this.frase = pool[Math.floor(Math.random() * pool.length)] || quotes[0];
    } catch { }
    this.cargandoFrase = false;
  }

  private async cargarNoticias() {
    try {
      const { data } = await this.supabase.client
        .from('noticias')
        .select('id, titulo, slug, resumen, contenido')
        .eq('estado', 'publicado')
        .order('created_at', { ascending: false })
        .limit(5);
      this.ultimasNoticias = data || [];
    } catch { }
  }

  irAgenda() {
    this.router.navigate(['/agenda']);
  }

  abrirWeb() {
    window.open('https://psicologiaybienestar.netlify.app', '_blank');
  }
}
