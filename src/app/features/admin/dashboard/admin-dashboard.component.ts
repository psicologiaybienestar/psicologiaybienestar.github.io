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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        @for (stat of stats; track stat.label) {
          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <p class="text-gray-500 text-sm">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stat.count }}</p>
          </div>
        }
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a routerLink="/admin/noticias" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">Gestionar Noticias</h3>
          <p class="text-gray-500 text-sm mt-1">Crear, editar y publicar noticias</p>
        </a>
        <a routerLink="/admin/eventos" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">Gestionar Eventos</h3>
          <p class="text-gray-500 text-sm mt-1">Crear y administrar eventos</p>
        </a>
        <a routerLink="/admin/galeria" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">Galería</h3>
          <p class="text-gray-500 text-sm mt-1">Subir y administrar imágenes</p>
        </a>
        <a routerLink="/admin/testimonios" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-800">Testimonios</h3>
          <p class="text-gray-500 text-sm mt-1">Moderar testimonios</p>
        </a>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  stats = [
    { label: 'Noticias', count: 0 },
    { label: 'Eventos', count: 0 },
    { label: 'Imágenes', count: 0 },
    { label: 'Testimonios', count: 0 },
  ];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    try {
      const [
        { count: noticias },
        { count: eventos },
        { count: galeria },
        { count: testimonios },
      ] = await Promise.all([
        this.supabase.client.from('noticias').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('eventos').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('galeria').select('*', { count: 'exact', head: true }),
        this.supabase.client.from('testimonios').select('*', { count: 'exact', head: true }),
      ]);
      this.stats = [
        { label: 'Noticias', count: noticias ?? 0 },
        { label: 'Eventos', count: eventos ?? 0 },
        { label: 'Imágenes', count: galeria ?? 0 },
        { label: 'Testimonios', count: testimonios ?? 0 },
      ];
    } catch {}
  }
}
