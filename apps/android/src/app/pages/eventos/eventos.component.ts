import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppIconComponent } from '@shared/components/app-icon.component';
import { SupabaseService } from '@shared/services/supabase.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, AppIconComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page">
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">Eventos</h1>
            <p class="hero-subtitle">Actividades, talleres y sesiones especiales.</p>
          </div>
        </section>

        <section class="section">
          <div class="tabs-container">
            <div class="tabs-scroll">
              <button class="tab-btn" [class.active]="currentTab === 'todos'" (click)="currentTab = 'todos'">Todos</button>
              <button class="tab-btn" [class.active]="currentTab === 'proximos'" (click)="currentTab = 'proximos'">Proximos</button>
              <button class="tab-btn" [class.active]="currentTab === 'finalizados'" (click)="currentTab = 'finalizados'">Finalizados</button>
              <button class="tab-btn" [class.active]="currentTab === 'pospuestos'" (click)="currentTab = 'pospuestos'">Pospuestos</button>
              <button class="tab-btn" [class.active]="currentTab === 'cancelados'" (click)="currentTab = 'cancelados'">Cancelados</button>
            </div>
          </div>

          @if (cargando) {
            <div class="loading-state">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Cargando eventos...</p>
            </div>
          } @else if (filteredEventos.length === 0) {
            <div class="empty-state">
              <div class="empty-icon-circle"><app-icon name="calendar-clear-outline"></app-icon></div>
              <p>No hay eventos {{ currentTab === 'todos' ? 'disponibles' : currentTab }}</p>
            </div>
          }

          <div class="eventos-list">
            @for (evento of filteredEventos; track evento.id) {
              <div class="card event-card" [routerLink]="['/evento', evento.id]">
                <div class="event-image-container">
                  @if (evento.imagen_url) {
                    <img [src]="getPublicUrl(evento.imagen_url)" class="event-img" alt="Evento" onerror="this.style.display='none'">
                  } @else {
                    <div class="event-img-placeholder">
                      <app-icon name="calendar"></app-icon>
                    </div>
                  }
                  <div class="event-date-badge">
                    <span class="day">{{ evento.fecha_inicio | date:'dd' }}</span>
                    <span class="month">{{ evento.fecha_inicio | date:'MMM' }}</span>
                  </div>
                </div>
                <div class="event-content">
                  <span class="event-status" [style.background]="badgeBg(evento.estado)" [style.color]="badgeColor(evento.estado)">
                    {{ statusLabel(evento.estado) }}
                  </span>
                  <h3>{{ evento.titulo }}</h3>
                  <p class="event-date-row"><app-icon name="calendar-outline"></app-icon> {{ evento.fecha_inicio | date:'dd MMM yyyy' }}</p>
                  <p class="event-meta">
                    <app-icon name="time-outline"></app-icon> {{ evento.fecha_inicio | date:'shortTime' }}
                    @if (evento.ubicacion) {
                      <span class="meta-dot">.</span>
                      <app-icon name="location-outline"></app-icon> {{ evento.ubicacion }}
                    }
                  </p>
                  @if (evento.descripcion_corta) {
                    <p class="event-desc">{{ evento.descripcion_corta }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </section>

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page { background: #fafafa; min-height: 100%; font-family: var(--pg-font-body); }
    .hero-section { padding: 40px 24px 20px; }
    .hero-content { display: flex; justify-content: space-between; align-items: center; }
    .hero-title { font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 4px; }
    .hero-subtitle { font-size: 15px; color: #6b7280; max-width: 280px; margin: 0; line-height: 1.5; }

    .section { padding: 0 24px 24px; }

    .tabs-container { margin-bottom: 24px; margin-left: -24px; margin-right: -24px; }
    .tabs-scroll { display: flex; gap: 8px; padding: 0 24px; overflow-x: auto; scrollbar-width: none; }
    .tabs-scroll::-webkit-scrollbar { display: none; }
    .tab-btn { background: white; border: 1px solid #e5e7eb; border-radius: 999px; padding: 10px 20px; font-size: 13px; font-weight: 700; color: #6b7280; white-space: nowrap; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
    .tab-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }

    .loading-state { text-align: center; padding: 40px 24px; }
    .loading-state ion-spinner { color: #627eff; margin-bottom: 12px; }
    .loading-state p { font-size: 14px; color: #6b7280; margin: 0; }

    .empty-state { text-align: center; padding: 40px 24px; }
    .empty-icon-circle { width: 80px; height: 80px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #9ca3af; margin: 0 auto 16px; }
    .empty-state p { font-size: 16px; font-weight: 700; color: #374151; margin: 0 0 8px; }

    .eventos-list { display: flex; flex-direction: column; gap: 12px; }
    .event-card { background: white; border-radius: 20px; padding: 12px; display: flex; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03); border: 1px solid #f3f4f6; text-decoration: none; color: inherit; transition: transform 0.2s; cursor: pointer; }
    .event-card:active { transform: scale(0.98); }
    .event-image-container { position: relative; width: 80px; height: 120px; border-radius: 16px; overflow: hidden; flex-shrink: 0; background: #f3f4f6; }
    .event-img { width: 100%; height: 100%; object-fit: cover; }
    .event-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #9ca3af; }
    .event-date-badge { position: absolute; top: 8px; left: 8px; right: 8px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .event-date-badge .day { font-size: 14px; font-weight: 800; color: #1f2937; line-height: 1; }
    .event-date-badge .month { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #627eff; letter-spacing: 0.02em; }

    .event-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .event-status { align-self: flex-start; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.05em; margin-bottom: 8px; }
    .event-content h3 { margin: 0 0 6px; font-size: 15px; font-weight: 800; color: #1f2937; line-height: 1.3; }
    .event-date-row { margin: 0 0 4px; font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
    .event-meta { margin: 0 0 4px; font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
    .meta-dot { color: #d1d5db; margin: 0 4px; }
    .event-desc { margin: 4px 0 0; font-size: 12px; color: #9ca3af; line-height: 1.4; }

    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `],
})
export class EventosListComponent implements OnInit {
  private supabase = inject(SupabaseService);

  todosEventos: any[] = [];
  cargando = true;
  currentTab = 'todos';

  get filteredEventos(): any[] {
    return this.todosEventos.filter(e => {
      const s = (e.estado || '').toLowerCase();
      if (this.currentTab === 'todos') return true;
      if (this.currentTab === 'proximos') return s === 'publicado';
      if (this.currentTab === 'finalizados') return s === 'finalizado';
      if (this.currentTab === 'pospuestos') return s === 'pospuesto';
      if (this.currentTab === 'cancelados') return s === 'cancelado';
      return false;
    }).sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());
  }

  async ngOnInit() {
    await this.cargarEventos();
  }

  async cargarEventos() {
    this.cargando = true;
    try {
      const { data, error } = await this.supabase.client
        .from('eventos')
        .select('*')
        .in('estado', ['publicado', 'finalizado', 'pospuesto', 'cancelado'])
        .order('fecha_inicio', { ascending: false });
      if (error) throw error;
      this.todosEventos = data || [];
    } catch {
      this.todosEventos = [];
    } finally {
      this.cargando = false;
    }
  }

  getPublicUrl(path: string): string {
    if (!path) return '';
    return this.supabase.getPublicUrl('eventos', path);
  }

  statusLabel(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'publicado': return 'Publicado';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      case 'pospuesto': return 'Pospuesto';
      default: return estado || '';
    }
  }

  badgeColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
      case 'publicado': return '#10b981';
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
      case 'activo':
      case 'publicado': return '#ecfdf5';
      case 'proximo':
      case 'próximo': return '#eff6ff';
      case 'finalizado': return '#f3f4f6';
      case 'cancelado': return '#fef2f2';
      case 'pospuesto': return '#fffbeb';
      default: return '#f3e8ff';
    }
  }
}
