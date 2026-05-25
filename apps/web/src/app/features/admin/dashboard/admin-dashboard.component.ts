import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        @for (stat of stats; track stat.label) {
          <div class="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 text-center">
            <span class="text-2xl">
              @switch (stat.icon) {
                @case ('noticias') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                }
                @case ('eventos') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                }
                @case ('imagenes') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                }
                @case ('testimonios') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                }
                @case ('frases') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                }
                @case ('consejos') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                }
                @case ('citas') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                }
              }
            </span>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ stat.count }}</p>
            <p class="text-gray-500 text-xs mt-0.5">{{ stat.label }}</p>
          </div>
        }
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a routerLink="/admin/noticias" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg> Noticias</h3>
          <p class="text-gray-500 text-sm mt-1">Crear, editar y publicar</p>
        </a>
        <a routerLink="/admin/eventos" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Eventos</h3>
          <p class="text-gray-500 text-sm mt-1">Administrar eventos con filtros</p>
        </a>
        <a routerLink="/admin/galeria" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Galería</h3>
          <p class="text-gray-500 text-sm mt-1">Subir imágenes</p>
        </a>
        <a routerLink="/admin/testimonios" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> Testimonios</h3>
          <p class="text-gray-500 text-sm mt-1">Moderar testimonios</p>
        </a>
        <a routerLink="/admin/frases" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg> Frases</h3>
          <p class="text-gray-500 text-sm mt-1">Importar/exportar frases motivacionales</p>
        </a>
        <a routerLink="/admin/consejos" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> Consejos</h3>
          <p class="text-gray-500 text-sm mt-1">Consejos emocionales por tipo</p>
        </a>
        <a routerLink="/admin/emociones" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Emociones</h3>
          <p class="text-gray-500 text-sm mt-1">Categorías emocionales</p>
        </a>
        <a routerLink="/admin/actividades" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg> Actividades</h3>
          <p class="text-gray-500 text-sm mt-1">Mindfulness y bienestar</p>
        </a>
        <a routerLink="/admin/minijuegos" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Minijuegos</h3>
          <p class="text-gray-500 text-sm mt-1">Catálogo de actividades</p>
        </a>
        <a routerLink="/admin/citas" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> Citas</h3>
          <p class="text-gray-500 text-sm mt-1">Gestionar solicitudes</p>
        </a>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  stats: { label: string; count: number; icon: string }[] = [];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    try {
      const [
        { count: noticias },
        { count: eventos },
        { count: galeria },
        { count: testimonios },
        { count: frases },
        { count: consejos },
        { count: citasPendientes },
      ] = await Promise.all([
        this.supabase.client.from('noticias').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('eventos').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('galeria').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('testimonios').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('motivational_quotes').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('emotional_tips').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
      ]);
      this.stats = [
        { label: 'Noticias', count: noticias ?? 0, icon: 'noticias' },
        { label: 'Eventos', count: eventos ?? 0, icon: 'eventos' },
        { label: 'Imágenes', count: galeria ?? 0, icon: 'imagenes' },
        { label: 'Testimonios', count: testimonios ?? 0, icon: 'testimonios' },
        { label: 'Frases', count: frases ?? 0, icon: 'frases' },
        { label: 'Consejos', count: consejos ?? 0, icon: 'consejos' },
        { label: 'Citas pend.', count: citasPendientes ?? 0, icon: 'citas' },
      ];
    } catch {}
  }
}
