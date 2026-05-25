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
      <div class="hero">
        <h1>Bienvenido</h1>
        <p class="subtitle">Tu espacio seguro para el bienestar emocional</p>
      </div>

      @if (frase) {
        <div class="quote-card">
          <div class="quote-accent"></div>
          <div class="quote-body">
            <span class="quote-icon">&ldquo;</span>
            <p class="quote-text">{{ frase.quote }}</p>
            <p class="quote-author">&mdash; {{ frase.author || 'Anónimo' }}</p>
          </div>
          <button class="quote-refresh" (click)="cargarFrase()" [disabled]="cargandoFrase">
            <ion-icon name="refresh" [class.spinning]="cargandoFrase" />
          </button>
        </div>
      }

      <div class="stats-grid">
        <div class="stat-card">
          <ion-icon name="newspaper" color="primary" />
          <span class="stat-value">{{ stats.noticias }}</span>
          <span class="stat-label">Noticias</span>
        </div>
        <div class="stat-card">
          <ion-icon name="calendar" color="secondary" />
          <span class="stat-value">{{ stats.eventos }}</span>
          <span class="stat-label">Eventos</span>
        </div>
        <div class="stat-card">
          <ion-icon name="game-controller" color="tertiary" />
          <span class="stat-value">{{ stats.juegos }}</span>
          <span class="stat-label">Juegos</span>
        </div>
        <div class="stat-card">
          <ion-icon name="bulb" color="warning" />
          <span class="stat-value">{{ stats.consejos }}</span>
          <span class="stat-label">Consejos</span>
        </div>
      </div>

      <div class="quick-actions">
        <button class="action-card" (click)="irAgenda()">
          <ion-icon name="calendar-clear" color="primary" />
          <span>Agendar cita</span>
        </button>
        <button class="action-card" (click)="abrirWeb()">
          <ion-icon name="globe" color="secondary" />
          <span>Versión web</span>
        </button>
      </div>

      @if (ultimasNoticias.length > 0) {
        <div class="section">
          <h2 class="section-title">Últimas noticias</h2>
          @for (item of ultimasNoticias; track item.id) {
            <div class="news-card">
              <h3>{{ item.titulo }}</h3>
              <p>{{ item.resumen || item.contenido | slice:0:80 }}{{ (item.resumen || item.contenido)?.length > 80 ? '...' : '' }}</p>
            </div>
          }
        </div>
      }
    </ion-content>
  `,
  styles: `
    .hero { padding: 8px 0 16px; }
    .hero h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; color: var(--ion-text-color); }
    .hero .subtitle { font-size: 14px; color: var(--ion-color-medium); margin: 0; }

    .quote-card { display: flex; background: var(--ion-color-primary-contrast); border-radius: 16px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(98,126,255,0.08); overflow: hidden; position: relative; }
    .quote-accent { width: 4px; background: var(--ion-color-primary); flex-shrink: 0; }
    .quote-body { flex: 1; padding: 16px 12px; }
    .quote-icon { font-size: 28px; color: var(--ion-color-primary); opacity: 0.3; line-height: 1; font-family: Georgia, serif; }
    .quote-text { font-size: 15px; font-style: italic; color: var(--ion-text-color); line-height: 1.5; margin: 4px 0 8px; }
    .quote-author { font-size: 12px; color: var(--ion-color-medium); margin: 0; }
    .quote-refresh { position: absolute; top: 8px; right: 8px; background: var(--ion-color-light); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ion-color-medium); font-size: 16px; }
    .spinning { animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .stat-card { background: var(--ion-color-primary-contrast); border-radius: 14px; padding: 16px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .stat-card ion-icon { font-size: 28px; margin-bottom: 6px; }
    .stat-value { display: block; font-size: 22px; font-weight: 800; color: var(--ion-text-color); }
    .stat-label { display: block; font-size: 12px; color: var(--ion-color-medium); margin-top: 2px; }

    .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .action-card { display: flex; flex-direction: column; align-items: center; gap: 8px; background: var(--ion-color-primary-contrast); border: none; border-radius: 14px; padding: 20px 12px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.04); font-family: inherit; transition: transform 0.15s; }
    .action-card:active { transform: scale(0.96); }
    .action-card ion-icon { font-size: 28px; }
    .action-card span { font-size: 13px; font-weight: 600; color: var(--ion-text-color); }

    .section { margin-bottom: 20px; }
    .section-title { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: var(--ion-text-color); }
    .news-card { background: var(--ion-color-primary-contrast); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .news-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 4px; color: var(--ion-text-color); }
    .news-card p { font-size: 13px; color: var(--ion-color-medium); margin: 0; line-height: 1.4; }
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
    } catch { /* ignore */ }
  }

  async cargarFrase() {
    this.cargandoFrase = true;
    try {
      const quotes = await this.quotesService.getActivas(10);
      const restantes = quotes.filter(q => q.id !== this.frase?.id);
      const pool = restantes.length > 0 ? restantes : quotes;
      this.frase = pool[Math.floor(Math.random() * pool.length)] || quotes[0];
    } catch { /* ignore */ }
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
    } catch { /* ignore */ }
  }

  irAgenda() {
    this.router.navigate(['/agenda']);
  }

  abrirWeb() {
    window.open('https://psicologiaybienestar.netlify.app', '_blank');
  }
}
