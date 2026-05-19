import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-noticia-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-4xl">
        <a routerLink="/noticias" class="inline-flex items-center text-primary hover:text-accent transition-colors mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Volver a noticias
        </a>

        @if (loading) {
          <p class="text-center text-gray-500 py-20">Cargando...</p>
        }

        @if (noticia) {
          <article>
            @if (noticia.imagen) {
              <img [src]="noticia.imagen" [alt]="noticia.titulo" class="w-full h-72 md:h-96 object-cover rounded-2xl mb-8 shadow-lg" />
            }
            <span class="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{{ noticia.categoria || 'General' }}</span>
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mt-4 mb-4">{{ noticia.titulo }}</h1>
            <div class="flex items-center text-gray-500 text-sm mb-8 space-x-4">
              <span>{{ noticia.fecha_publicacion | date:'dd/MM/yyyy' }}</span>
              @if (noticia.autor) {
                <span>Por {{ noticia.autor }}</span>
              }
            </div>
            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {{ noticia.contenido }}
            </div>
          </article>
        }

        @if (!noticia && !loading) {
          <div class="text-center py-20">
            <p class="text-gray-500 text-lg">Noticia no encontrada.</p>
            <a routerLink="/noticias" class="text-primary hover:underline mt-4 inline-block">Ver todas las noticias</a>
          </div>
        }
      </div>
    </div>
  `,
})
export class NoticiaDetailComponent implements OnInit {
  noticia: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading = false;
      return;
    }
    try {
      const { data, error } = await this.supabase.client
        .from('noticias')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      this.noticia = data;
    } catch {
      this.noticia = null;
    } finally {
      this.loading = false;
    }
  }
}
