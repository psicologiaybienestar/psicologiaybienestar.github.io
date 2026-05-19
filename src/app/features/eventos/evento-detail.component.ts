import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-4xl">
        <a routerLink="/eventos" class="inline-flex items-center text-primary hover:text-accent transition-colors mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Volver a eventos
        </a>

        @if (loading) {
          <p class="text-center text-gray-500 py-20">Cargando...</p>
        }

        @if (evento) {
          <article>
            @if (evento.imagen) {
              <img [src]="evento.imagen" [alt]="evento.titulo" class="w-full h-72 md:h-96 object-cover rounded-2xl mb-8 shadow-lg" />
            }
            <span class="text-sm font-semibold text-white bg-primary px-3 py-1 rounded-full">{{ evento.modalidad || 'Presencial' }}</span>
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mt-4 mb-6">{{ evento.titulo }}</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl">
              <div>
                <p class="text-sm text-gray-500">Inicio</p>
                <p class="font-semibold text-gray-800">{{ evento.fecha_inicio | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              @if (evento.fecha_fin) {
                <div>
                  <p class="text-sm text-gray-500">Fin</p>
                  <p class="font-semibold text-gray-800">{{ evento.fecha_fin | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              }
              @if (evento.ubicacion) {
                <div>
                  <p class="text-sm text-gray-500">Ubicación</p>
                  <p class="font-semibold text-gray-800">{{ evento.ubicacion }}</p>
                </div>
              }
              @if (evento.cupos) {
                <div>
                  <p class="text-sm text-gray-500">Cupos</p>
                  <p class="font-semibold text-gray-800">{{ evento.cupos }}</p>
                </div>
              }
            </div>
            <div class="text-gray-700 leading-relaxed mb-8">{{ evento.descripcion }}</div>
            <a [href]="googleCalendarUrl(evento)" target="_blank" rel="noopener noreferrer" class="inline-flex items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Agregar a Google Calendar
            </a>
          </article>
        }

        @if (!evento && !loading) {
          <div class="text-center py-20">
            <p class="text-gray-500 text-lg">Evento no encontrado.</p>
            <a routerLink="/eventos" class="text-primary hover:underline mt-4 inline-block">Ver todos los eventos</a>
          </div>
        }
      </div>
    </div>
  `,
})
export class EventoDetailComponent implements OnInit {
  evento: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }
    try {
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
