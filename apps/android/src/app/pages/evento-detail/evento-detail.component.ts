import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppIconComponent } from '@shared/components/app-icon.component';
import { SupabaseService } from '@shared/services/supabase.service';
import { EventosService } from '@shared/services/eventos.service';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  publicado: { label: 'Publicado', color: '#627eff', bg: '#eef2ff', icon: 'checkmark-circle' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: '#fef2f2', icon: 'close-circle' },
  finalizado: { label: 'Finalizado', color: '#10b981', bg: '#ecfdf5', icon: 'checkmark-done' },
  pospuesto: { label: 'Pospuesto', color: '#f59e0b', bg: '#fef3c7', icon: 'time' },
  borrador: { label: 'Borrador', color: '#9ca3af', bg: '#f3f4f6', icon: 'document' },
};

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, AppIconComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page">
        <section class="hero-section">
          <div class="hero-bg"></div>
          <div class="hero-content">
            <app-icon name="calendar" class="hero-icon"></app-icon>
            <h1 class="hero-title">{{ evento?.titulo || 'Evento' }}</h1>
          </div>
        </section>

        <section class="section">
          @if (loading) {
            <div class="loading-state">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Cargando evento...</p>
            </div>
          }

          @if (evento && !loading) {
            <div class="card card-evento">
              <div class="status-header">
                <span class="status-badge" [style.background]="statusConfig.bg" [style.color]="statusConfig.color">
                  <app-icon [name]="statusConfig.icon"></app-icon>
                  {{ statusConfig.label }}
                </span>
              </div>

              @if (evento.imagen) {
                <div class="evento-imagen">
                  <img [src]="evento.imagen" [alt]="evento.titulo" />
                </div>
              }

              <div class="evento-body">
                <div class="evento-meta">
                  <div class="meta-row">
                    <app-icon name="calendar-outline"></app-icon>
                    <span>Inicio: {{ evento.fecha_inicio | date:'dd MMM yyyy, HH:mm' }}</span>
                  </div>
                  @if (evento.fecha_fin) {
                    <div class="meta-row">
                      <app-icon name="calendar-outline"></app-icon>
                      <span>Fin: {{ evento.fecha_fin | date:'dd MMM yyyy, HH:mm' }}</span>
                    </div>
                  }
                  @if (evento.ubicacion) {
                    <div class="meta-row">
                      <app-icon name="location-outline"></app-icon>
                      <span>{{ evento.ubicacion }}</span>
                    </div>
                  }
                  @if (evento.modalidad) {
                    <div class="meta-row">
                      <app-icon name="globe-outline"></app-icon>
                      <span>{{ evento.modalidad }}</span>
                    </div>
                  }
                  @if (evento.cupos) {
                    <div class="meta-row">
                      <app-icon name="people-outline"></app-icon>
                      <span>{{ evento.cupos }} cupos disponibles</span>
                    </div>
                  }
                </div>

                @if (evento.descripcion) {
                  <div class="evento-desc">
                    <h3>Descripcion</h3>
                    <p>{{ evento.descripcion }}</p>
                  </div>
                }

                @if (evento.enlace) {
                  <a [href]="evento.enlace" target="_blank" rel="noopener noreferrer" class="btn-outline btn-full">
                    <app-icon name="link-outline"></app-icon>
                    Enlace del evento
                  </a>
                }
              </div>
            </div>
          }

          @if (!evento && !loading) {
            <div class="empty-state">
              <app-icon name="calendar-outline"></app-icon>
              <p>Evento no encontrado.</p>
            </div>
          }
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
    .hero-icon { font-size: 48px; color: var(--ion-color-primary); display: block; margin: 0 auto 8px; }
    .hero-title { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0 0 4px; }
    .section { padding: 4px 20px 22px; }
    .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .loading-state { text-align: center; padding: 48px 24px; }
    .loading-state ion-spinner { font-size: 28px; color: var(--ion-color-primary); margin-bottom: 12px; }
    .loading-state p { font-size: 14px; color: #9ca3af; }
    .empty-state { text-align: center; padding: 48px 24px; }
    .empty-state ion-icon { font-size: 40px; color: #d1d5db; margin-bottom: 10px; }
    .empty-state p { font-size: 14px; color: #9ca3af; }
    .status-header { margin-bottom: 14px; }
    .status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 5px 12px; border-radius: 999px; letter-spacing: 0.02em; }
    .status-badge ion-icon { font-size: 14px; }
    .evento-imagen { margin: 0 -16px 16px; }
    .evento-imagen img { width: 100%; height: 200px; object-fit: cover; }
    .evento-body { display: flex; flex-direction: column; gap: 16px; }
    .evento-meta { display: flex; flex-direction: column; gap: 10px; padding: 14px; background: #f9fafb; border-radius: 12px; }
    .meta-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #4b5563; font-weight: 600; }
    .meta-row ion-icon { color: #627eff; font-size: 17px; flex-shrink: 0; }
    .evento-desc h3 { font-size: 15px; font-weight: 700; color: #1f2937; margin: 0 0 8px; }
    .evento-desc p { font-size: 13px; color: #6b7280; line-height: 1.7; margin: 0; white-space: pre-line; }
    .btn-outline { display: flex; align-items: center; justify-content: center; gap: 8px; background: transparent; color: var(--ion-color-primary); border: 1.5px solid var(--ion-color-primary); padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; }
    .btn-outline:active { background: #eef2ff; }
    .btn-full { width: 100%; }
    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `],
})
export class EventoDetailComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private eventosService = inject(EventosService);

  evento: any = null;
  loading = true;

  get statusConfig() {
    const s = this.evento?.estado || 'publicado';
    return STATUS_CONFIG[s] || STATUS_CONFIG['publicado'];
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }
    try {
      await this.eventosService.autoFinalize();
      const { data, error } = await this.supabase.client
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      this.evento = data;
    } catch {
      this.evento = null;
    } finally {
      this.loading = false;
    }
  }
}
