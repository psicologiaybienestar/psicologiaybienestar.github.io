import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  publicado: { label: 'Publicado', color: '#627eff', bg: '#eef2ff' },
  proximo: { label: 'Proximo', color: '#60a5fa', bg: '#eff6ff' },
  pospuesto: { label: 'Pospuesto', color: '#f59e0b', bg: '#fef3c7' },
  finalizado: { label: 'Finalizado', color: '#10b981', bg: '#ecfdf5' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: '#fef2f2' },
};

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Eventos</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>

        @if (loading) {
          <p class="text-center text-gray-500 py-10">Cargando eventos...</p>
        }

        <div class="flex flex-wrap justify-center gap-3 mb-10">
          <button (click)="filtroEstado = ''"
            class="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            [class]="filtroEstado === '' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            Todos
          </button>
          @for (item of filtros; track item.key) {
            <button (click)="filtroEstado = item.key"
              class="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              [class]="filtroEstado === item.key ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              {{ item.label }}
            </button>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (evento of filteredEventos; track evento.id) {
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              @if (evento.imagen) {
                <img [src]="evento.imagen" [alt]="evento.titulo" class="w-full h-48 object-cover" />
              }
              <div class="p-6">
                <div class="flex items-center flex-wrap gap-2 mb-3">
                  <span class="text-xs font-semibold px-3 py-1 rounded-full" [style]="statusStyle(evento.estado)">{{ eventLabel(evento.estado) }}</span>
                  <span class="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full">{{ evento.modalidad || 'Presencial' }}</span>
                  @if (evento.cupos) {
                    <span class="text-xs text-gray-500">{{ evento.cupos }} cupos</span>
                  }
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">{{ evento.titulo }}</h3>
                <p class="text-gray-600 text-sm mb-4">{{ evento.descripcion }}</p>
                <div class="space-y-1 text-sm text-gray-500 mb-4">
                  <p>Inicio: {{ evento.fecha_inicio | date:'dd/MM/yyyy HH:mm' }}</p>
                  @if (evento.fecha_fin) {
                    <p>Fin: {{ evento.fecha_fin | date:'dd/MM/yyyy HH:mm' }}</p>
                  }
                  @if (evento.ubicacion) {
                    <p>Ubicacion: {{ evento.ubicacion }}</p>
                  }
                </div>
                <div class="flex space-x-2">
                  <a [routerLink]="['/evento', evento.id]" class="text-primary font-semibold text-sm hover:text-accent transition-colors">Ver detalles &rarr;</a>
                  <a [href]="googleCalendarUrl(evento)" target="_blank" rel="noopener noreferrer" class="text-secondary font-semibold text-sm hover:text-accent transition-colors">Agregar a Google Calendar</a>
                </div>
              </div>
            </div>
          }
        </div>

        @if (filteredEventos.length === 0 && !loading) {
          <p class="text-center text-gray-500 py-10">No hay eventos en esta categoria.</p>
        }
      </div>
    </div>
  `,
})
export class EventosListComponent implements OnInit {
  eventos: any[] = [];
  loading = true;
  filtroEstado = '';
  filtros = [
    { key: 'publicado', label: 'Activos' },
    { key: 'proximo', label: 'Proximos' },
    { key: 'finalizado', label: 'Finalizados' },
    { key: 'pospuesto', label: 'Pospuestos' },
    { key: 'cancelado', label: 'Cancelados' },
  ];

  get filteredEventos(): any[] {
    if (!this.filtroEstado) return this.eventos;
    return this.eventos.filter(e => e.estado === this.filtroEstado);
  }

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    try {
      const { data, error } = await this.supabase.client
        .from('eventos')
        .select('*')
        .in('estado', ['publicado', 'proximo', 'finalizado', 'pospuesto', 'cancelado'])
        .order('fecha_inicio', { ascending: false, nullsFirst: false });
      if (error) throw error;
      this.eventos = data || [];
    } catch {
      this.eventos = [];
    } finally {
      this.loading = false;
    }
  }

  eventLabel(estado: string): string {
    return STATUS_CONFIG[estado]?.label || estado || 'Evento';
  }

  statusStyle(estado: string): any {
    const cfg = STATUS_CONFIG[estado];
    if (!cfg) return {};
    return { background: cfg.bg, color: cfg.color };
  }

  googleCalendarUrl(evento: any): string {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: evento.titulo,
      dates: this.formatGoogleDate(evento.fecha_inicio) + '/' + this.formatGoogleDate(evento.fecha_fin || evento.fecha_inicio),
      details: evento.descripcion || '',
      location: evento.ubicacion || '',
    });
    return base + '&' + params.toString();
  }

  private formatGoogleDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}
