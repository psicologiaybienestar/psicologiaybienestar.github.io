import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (evento of eventos; track evento.id) {
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              @if (evento.imagen) {
                <img [src]="evento.imagen" [alt]="evento.titulo" class="w-full h-48 object-cover" />
              }
              <div class="p-6">
                <div class="flex items-center space-x-2 mb-3">
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
                    <p>Ubicación: {{ evento.ubicacion }}</p>
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

        @if (eventos.length === 0 && !loading) {
          <p class="text-center text-gray-500 py-10">No hay eventos próximos.</p>
        }
      </div>
    </div>
  `,
})
export class EventosListComponent implements OnInit {
  eventos: any[] = [];
  loading = true;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    try {
      const { data, error } = await this.supabase.client
        .from('eventos')
        .select('*')
        .eq('estado', 'publicado')
        .order('fecha_inicio', { ascending: true });
      if (error) throw error;
      this.eventos = data || [];
    } catch {
      this.eventos = [];
    } finally {
      this.loading = false;
    }
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
