import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-noticias-list',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Noticias</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>

        @if (loading) {
          <p class="text-center text-gray-500 py-10">Cargando noticias...</p>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (noticia of noticias; track noticia.id) {
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              @if (noticia.imagen) {
                <img [src]="noticia.imagen" [alt]="noticia.titulo" class="w-full h-48 object-cover" />
              }
              <div class="p-6">
                <span class="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{{ noticia.categoria || 'General' }}</span>
                <h3 class="text-xl font-bold text-gray-800 mt-3 mb-2">{{ noticia.titulo }}</h3>
                <p class="text-gray-600 text-sm mb-4">{{ noticia.resumen }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-xs">{{ noticia.fecha_publicacion | date:'dd/MM/yyyy' }}</span>
                  <a [routerLink]="['/noticia', noticia.slug]" class="text-primary font-semibold text-sm hover:text-accent transition-colors">Leer más &rarr;</a>
                </div>
              </div>
            </div>
          }
        </div>

        @if (noticias.length === 0 && !loading) {
          <p class="text-center text-gray-500 py-10">No hay noticias disponibles aún.</p>
        }
      </div>
    </div>
  `,
})
export class NoticiasListComponent implements OnInit {
  noticias: any[] = [];
  loading = true;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    try {
      const { data, error } = await this.supabase.client
        .from('noticias')
        .select('*')
        .eq('estado', 'publicado')
        .order('fecha_publicacion', { ascending: false });
      if (error) throw error;
      this.noticias = data || [];
    } catch {
      this.noticias = [];
    } finally {
      this.loading = false;
    }
  }
}
