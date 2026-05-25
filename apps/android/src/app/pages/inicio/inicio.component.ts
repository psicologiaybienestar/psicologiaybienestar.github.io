import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SlicePipe } from '@angular/common';
import { SupabaseService } from '@shared/services/supabase.service';
import { QuotesService } from '@shared/services/quotes.service';

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
      <div class="welcome-section">
        <h1>Bienvenido</h1>
        <p>Tu espacio seguro para el bienestar emocional</p>
        @if (frase) {
          <div class="frase-card">
            <p class="frase-texto">"{{ frase.quote }}"</p>
            <p class="frase-autor">— {{ frase.author || 'Anónimo' }}</p>
          </div>
        }
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <ion-icon name="newspaper" color="primary" />
          <span class="stat-value">{{ noticiasCount }}</span>
          <span class="stat-label">Noticias</span>
        </div>
        <div class="stat-card">
          <ion-icon name="calendar" color="tertiary" />
          <span class="stat-value">{{ eventosCount }}</span>
          <span class="stat-label">Eventos</span>
        </div>
        <div class="stat-card">
          <ion-icon name="game-controller" color="secondary" />
          <span class="stat-value">{{ juegosCount }}</span>
          <span class="stat-label">Minijuegos</span>
        </div>
        <div class="stat-card">
          <ion-icon name="bulb" color="warning" />
          <span class="stat-value">{{ consejosCount }}</span>
          <span class="stat-label">Consejos</span>
        </div>
      </div>

      @if (ultimasNoticias.length > 0) {
        <ion-list-header>
          <ion-label>Últimas noticias</ion-label>
        </ion-list-header>
        @for (item of ultimasNoticias; track item.id) {
          <ion-item>
            <ion-label>
              <h2>{{ item.titulo }}</h2>
              <p>{{ item.resumen || item.contenido | slice:0:80 }}{{ (item.resumen || item.contenido)?.length > 80 ? '...' : '' }}</p>
            </ion-label>
          </ion-item>
        }
      }
    </ion-content>
  `,
  styles: `
    .welcome-section { text-align: center; padding: 16px 0 8px; }
    .welcome-section h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; color: var(--ion-text-color); }
    .welcome-section p { font-size: 14px; color: var(--ion-color-medium); margin: 0 0 16px; }
    .frase-card { background: var(--ion-color-primary-contrast); border-radius: 16px; padding: 16px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid var(--ion-color-light-shade); }
    .frase-texto { font-size: 15px; font-style: italic; color: var(--ion-text-color); line-height: 1.5; margin-bottom: 8px; }
    .frase-autor { font-size: 12px; color: var(--ion-color-medium); text-align: right; margin: 0; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .stat-card { background: var(--ion-color-primary-contrast); border-radius: 14px; padding: 16px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .stat-card ion-icon { font-size: 28px; margin-bottom: 6px; }
    .stat-value { display: block; font-size: 22px; font-weight: 800; color: var(--ion-text-color); }
    .stat-label { display: block; font-size: 12px; color: var(--ion-color-medium); margin-top: 2px; }
  `,
})
export class InicioComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private quotesService = inject(QuotesService);

  frase: any = null;
  noticiasCount = 0;
  eventosCount = 0;
  juegosCount = 0;
  consejosCount = 0;
  ultimasNoticias: any[] = [];

  async ngOnInit() {
    await this.loadCounts();
    await this.loadFrase();
    await this.loadNoticias();
  }

  private async loadCounts() {
    try {
      const [n, e, j, c] = await Promise.all([
        this.supabase.client.from('noticias').select('*', { count: 'exact', head: true }).eq('estado', 'publicado'),
        this.supabase.client.from('eventos').select('*', { count: 'exact', head: true }).eq('estado', 'publicado'),
        this.supabase.client.from('mini_games').select('*', { count: 'exact', head: true }).eq('is_active', true),
        this.supabase.client.from('emotional_tips').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      this.noticiasCount = n.count ?? 0;
      this.eventosCount = e.count ?? 0;
      this.juegosCount = j.count ?? 0;
      this.consejosCount = c.count ?? 0;
    } catch { /* ignore */ }
  }

  private async loadFrase() {
    try {
      const quotes = await this.quotesService.getActivas(1);
      if (quotes.length > 0) this.frase = quotes[0];
    } catch { /* ignore */ }
  }

  private async loadNoticias() {
    try {
      const { data } = await this.supabase.client
        .from('noticias')
        .select('id, titulo, slug, resumen, contenido, created_at')
        .eq('estado', 'publicado')
        .order('created_at', { ascending: false })
        .limit(5);
      this.ultimasNoticias = data || [];
    } catch { /* ignore */ }
  }
}
