import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-testimonios',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Moderación de Testimonios</h1>

      @if (loading) { <p class="text-gray-500 text-center py-10">Cargando...</p> }

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Comentario</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (t of testimonios; track t.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 font-medium text-gray-800">{{ t.nombre }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{{ t.comentario }}</td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-semibold px-3 py-1 rounded-full"
                      [class]="t.estado === 'aprobado' ? 'bg-green-100 text-green-800' : t.estado === 'rechazado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'">
                      {{ t.estado }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ t.created_at | date:'dd/MM/yyyy' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex space-x-2">
                      @if (t.estado !== 'aprobado') {
                        <button (click)="cambiarEstado(t.id, 'aprobado')" class="text-green-600 hover:text-green-800 text-sm font-semibold">Aprobar</button>
                      }
                      @if (t.estado !== 'rechazado') {
                        <button (click)="cambiarEstado(t.id, 'rechazado')" class="text-red-500 hover:text-red-700 text-sm font-semibold">Rechazar</button>
                      }
                      <button (click)="eliminar(t.id)" class="text-gray-500 hover:text-gray-700 text-sm">Eliminar</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (testimonios.length === 0 && !loading) {
          <p class="text-center text-gray-500 py-10">No hay testimonios.</p>
        }
      </div>
    </div>
  `,
})
export class AdminTestimoniosComponent implements OnInit {
  testimonios: any[] = [];
  loading = true;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() { this.cargar(); }

  private async cargar() {
    try {
      const { data, error } = await this.supabase.client.from('testimonios').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      this.testimonios = data || [];
    } catch {} finally { this.loading = false; }
  }

  async cambiarEstado(id: string, estado: string) {
    try { await this.supabase.client.from('testimonios').update({ estado }).eq('id', id); await this.cargar(); } catch {}
  }

  async eliminar(id: string) {
    if (!confirm('¿Eliminar este testimonio?')) return;
    try { await this.supabase.client.from('testimonios').delete().eq('id', id); await this.cargar(); } catch {}
  }
}
