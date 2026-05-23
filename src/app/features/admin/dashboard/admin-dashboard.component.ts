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
            <span class="text-2xl">{{ stat.icon }}</span>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ stat.count }}</p>
            <p class="text-gray-500 text-xs mt-0.5">{{ stat.label }}</p>
          </div>
        }
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a routerLink="/admin/noticias" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">📰 Noticias</h3>
          <p class="text-gray-500 text-sm mt-1">Crear, editar y publicar</p>
        </a>
        <a routerLink="/admin/eventos" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">📅 Eventos</h3>
          <p class="text-gray-500 text-sm mt-1">Administrar eventos con filtros</p>
        </a>
        <a routerLink="/admin/galeria" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">🖼️ Galería</h3>
          <p class="text-gray-500 text-sm mt-1">Subir imágenes</p>
        </a>
        <a routerLink="/admin/testimonios" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">💬 Testimonios</h3>
          <p class="text-gray-500 text-sm mt-1">Moderar testimonios</p>
        </a>
        <a routerLink="/admin/frases" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">💛 Frases</h3>
          <p class="text-gray-500 text-sm mt-1">Importar/exportar frases motivacionales</p>
        </a>
        <a routerLink="/admin/consejos" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">💡 Consejos</h3>
          <p class="text-gray-500 text-sm mt-1">Consejos emocionales por tipo</p>
        </a>
        <a routerLink="/admin/emociones" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">😊 Emociones</h3>
          <p class="text-gray-500 text-sm mt-1">Categorías emocionales</p>
        </a>
        <a routerLink="/admin/actividades" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">🧘 Actividades</h3>
          <p class="text-gray-500 text-sm mt-1">Mindfulness y bienestar</p>
        </a>
        <a routerLink="/admin/minijuegos" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">🎮 Minijuegos</h3>
          <p class="text-gray-500 text-sm mt-1">Catálogo de actividades</p>
        </a>
        <a routerLink="/admin/citas" class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">📋 Citas</h3>
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
        { label: 'Noticias', count: noticias ?? 0, icon: '📰' },
        { label: 'Eventos', count: eventos ?? 0, icon: '📅' },
        { label: 'Imágenes', count: galeria ?? 0, icon: '🖼️' },
        { label: 'Testimonios', count: testimonios ?? 0, icon: '💬' },
        { label: 'Frases', count: frases ?? 0, icon: '💛' },
        { label: 'Consejos', count: consejos ?? 0, icon: '💡' },
        { label: 'Citas pend.', count: citasPendientes ?? 0, icon: '📋' },
      ];
    } catch {}
  }
}
