import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-citas',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Solicitudes de Citas</h1>
        <div class="flex space-x-2">
          @for (f of filters; track f.value) {
            <button (click)="statusFilter = f.value; applyFilter()"
              class="px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
              [class]="statusFilter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <!-- Filtros adicionales -->
      <div class="flex flex-wrap gap-3 mb-6">
        <div class="flex-1 min-w-[200px]">
          <input [(ngModel)]="searchTerm" (input)="applyFilter()" type="text" placeholder="Buscar por nombre o correo..."
            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-sm" />
        </div>
        <div>
          <input [(ngModel)]="dateFrom" (change)="applyFilter()" type="date" placeholder="Desde"
            class="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-sm" />
        </div>
        <div>
          <input [(ngModel)]="dateTo" (change)="applyFilter()" type="date" placeholder="Hasta"
            class="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-sm" />
        </div>
        <select [(ngModel)]="sortOrder" (change)="applyFilter()"
          class="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-sm">
          <option value="desc">Más recientes</option>
          <option value="asc">Más antiguos</option>
        </select>
      </div>

      @if (loading) { <p class="text-gray-500 text-center py-10">Cargando...</p> }

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha/Hora</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado emocional</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Creada</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (item of filteredItems; track item.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 font-medium text-gray-800">{{ item.user_name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    <p>{{ item.email }}</p>
                    @if (item.phone) { <p class="text-xs text-gray-400">{{ item.phone }}</p> }
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ item.requested_date ? (item.requested_date | date:'dd/MM/yyyy') : '—' }}
                    @if (item.requested_time) { <span class="text-xs ml-1">{{ item.requested_time }}</span> }
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ item.emotional_state || '—' }}</td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-semibold px-3 py-1 rounded-full"
                      [class]="statusClass(item.status)">
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ item.created_at | date:'dd/MM/yyyy' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col space-y-1">
                      @if (item.status === 'pendiente') {
                        <button (click)="cambiarStatus(item.id, 'confirmada')" class="text-green-600 hover:text-green-800 text-sm font-semibold">Confirmar</button>
                        <button (click)="cambiarStatus(item.id, 'cancelada')" class="text-red-500 hover:text-red-700 text-sm font-semibold">Cancelar</button>
                      }
                      @if (item.status === 'confirmada') {
                        <button (click)="cambiarStatus(item.id, 'completada')" class="text-blue-600 hover:text-blue-800 text-sm font-semibold">Completada</button>
                        <button (click)="abrirReagendar(item)" class="text-amber-600 hover:text-amber-800 text-sm font-semibold">Reagendar</button>
                      }
                      @if (item.status === 'reagendada') {
                        <button (click)="cambiarStatus(item.id, 'confirmada')" class="text-green-600 hover:text-green-800 text-sm font-semibold">Re-confirmar</button>
                        <button (click)="abrirReagendar(item)" class="text-amber-600 hover:text-amber-800 text-sm font-semibold">Reagendar</button>
                      }
                      <button (click)="eliminar(item.id)" class="text-gray-500 hover:text-gray-700 text-sm">Eliminar</button>
                    </div>
                  </td>
                </tr>
                @if (reagendandoId === item.id) {
                  <tr class="bg-amber-50">
                    <td colspan="7" class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <span class="text-sm font-semibold text-gray-700">Nueva fecha:</span>
                        <input [(ngModel)]="reagendarDate" type="date" class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm" />
                        <input [(ngModel)]="reagendarTime" type="time" class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm" />
                        <button (click)="reagendar(item.id)" class="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-amber-700">Guardar</button>
                        <button (click)="reagendandoId = null" class="text-gray-500 text-sm">Cancelar</button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        @if (filteredItems.length === 0 && !loading) { <p class="text-center text-gray-500 py-10">No hay citas.</p> }
      </div>
    </div>
  `,
})
export class AdminCitasComponent implements OnInit {
  items: any[] = [];
  loading = true;
  statusFilter = '';
  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  sortOrder = 'desc';
  reagendandoId: string | null = null;
  reagendarDate = '';
  reagendarTime = '';

  filters = [
    { label: 'Todas', value: '' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Confirmadas', value: 'confirmada' },
    { label: 'Completadas', value: 'completada' },
    { label: 'Reagendadas', value: 'reagendada' },
    { label: 'Canceladas', value: 'cancelada' },
  ];

  get filteredItems() {
    let result = [...this.items];

    if (this.statusFilter) {
      result = result.filter(i => i.status === this.statusFilter);
    }

    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      result = result.filter(i =>
        (i.user_name || '').toLowerCase().includes(s) ||
        (i.email || '').toLowerCase().includes(s)
      );
    }

    if (this.dateFrom) {
      result = result.filter(i => !i.requested_date || i.requested_date >= this.dateFrom);
    }

    if (this.dateTo) {
      result = result.filter(i => !i.requested_date || i.requested_date <= this.dateTo);
    }

    result.sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return this.sortOrder === 'desc' ? db - da : da - db;
    });

    return result;
  }

  constructor(private supabase: SupabaseService) {}

  ngOnInit() { this.cargar(); }

  applyFilter() {}

  private async cargar() {
    try {
      const { data, error } = await this.supabase.client.from('appointments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      this.items = data || [];
    } catch (e: any) { console.error(e); } finally { this.loading = false; }
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      completada: 'bg-blue-100 text-blue-800',
      cancelada: 'bg-red-100 text-red-800',
      reagendada: 'bg-amber-100 text-amber-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  async cambiarStatus(id: string, status: string) {
    try {
      await this.supabase.client.from('appointments').update({ status }).eq('id', id);
      await this.cargar();
    } catch (e: any) { console.error(e); }
  }

  abrirReagendar(item: any) {
    this.reagendandoId = item.id;
    this.reagendarDate = item.requested_date || '';
    this.reagendarTime = item.requested_time || '';
  }

  async reagendar(id: string) {
    if (!this.reagendarDate || !this.reagendarTime) return;
    try {
      await this.supabase.client.from('appointments').update({
        requested_date: this.reagendarDate,
        requested_time: this.reagendarTime,
        status: 'reagendada',
        reagendada_date: new Date().toISOString(),
      }).eq('id', id);
      this.reagendandoId = null;
      await this.cargar();
    } catch (e: any) { console.error(e); }
  }

  async eliminar(id: string) {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await this.supabase.client.from('appointments').delete().eq('id', id);
      await this.cargar();
    } catch {}
  }
}
