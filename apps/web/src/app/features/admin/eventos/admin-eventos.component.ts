import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Eventos</h1>
        <button (click)="toggleForm()"
          class="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-semibold">
          {{ showForm ? 'Cancelar' : 'Nuevo evento' }}
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <span class="text-sm text-gray-500 font-medium mr-1">Filtrar:</span>
        @for (f of filterOptions; track f.value) {
          <button (click)="statusFilter = f.value"
            class="px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
            [class]="statusFilter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            {{ f.label }}
          </button>
        }
        <div class="flex-1"></div>
        <input (input)="searchText = $any($event.target).value" placeholder="Buscar por título..." class="px-4 py-1.5 rounded-xl border border-gray-300 text-sm focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none w-56" />
      </div>

      @if (showForm) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ editando ? 'Editar' : 'Crear' }} evento</h2>
          <form [formGroup]="eventoForm" (ngSubmit)="guardar()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input formControlName="titulo" type="text" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                <select formControlName="modalidad" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none">
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea formControlName="descripcion" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input formControlName="fecha_inicio" type="datetime-local" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input formControlName="fecha_fin" type="datetime-local" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input formControlName="ubicacion" type="text" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cupos</label>
                <input formControlName="cupos" type="number" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select formControlName="estado" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none">
                  <option value="publicado">Publicado</option>
                  <option value="borrador">Borrador</option>
                  <option value="pospuesto">Pospuesto</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Enlace (opcional)</label>
              <input formControlName="enlace" type="url" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              <div
                class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary transition-colors cursor-pointer"
                (click)="imgInput.click()"
                (dragover)="$event.preventDefault()"
                (drop)="onDropImg($event)"
              >
                @if (imgPreview) {
                  <img [src]="imgPreview" class="max-h-40 mx-auto rounded-lg mb-2" />
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="text-gray-500 text-sm">Arrastra o selecciona imagen</p>
                }
                <input #imgInput type="file" accept="image/*" (change)="onImgSelected($event)" class="hidden" />
              </div>
              <input formControlName="imagen" type="hidden" />
            </div>
            <div class="flex space-x-3 pt-2">
              <button type="submit" [disabled]="eventoForm.invalid || guardando"
                class="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                @if (guardando) { Guardando... } @else { Guardar }
              </button>
              <button type="button" (click)="showForm = false" class="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">Cancelar</button>
            </div>
            @if (formError) { <p class="text-red-500 text-sm">{{ formError }}</p> }
          </form>
        </div>
      }

      @if (loading) { <p class="text-gray-500 text-center py-10">Cargando...</p> }

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (e of filteredEventos; track e.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4"><p class="font-medium text-gray-800">{{ e.titulo }}</p></td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ e.fecha_inicio | date:'dd/MM/yyyy' }}</td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-semibold px-3 py-1 rounded-full" [class]="statusBadgeClass(e.estado)">{{ e.estado }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex space-x-2">
                      <button (click)="editar(e)" class="text-primary hover:text-accent text-sm font-semibold">Editar</button>
                      <button (click)="eliminar(e.id)" class="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (filteredEventos.length === 0 && !loading) { <p class="text-center text-gray-500 py-10">No hay eventos.</p> }
      </div>
    </div>
  `,
})
export class AdminEventosComponent implements OnInit {
  eventos: any[] = [];
  eventoForm: FormGroup;
  showForm = false;
  editando = false;
  editandoId: string | null = null;
  loading = true;
  guardando = false;
  formError = '';
  imgPreview: string | null = null;
  imgSubiendo = false;

  statusFilter = '';
  searchText = '';
  filterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Publicados', value: 'publicado' },
    { label: 'Borradores', value: 'borrador' },
    { label: 'Próximos', value: 'proximos' },
    { label: 'Pospuestos', value: 'pospuesto' },
    { label: 'Finalizados', value: 'finalizado' },
    { label: 'Cancelados', value: 'cancelado' },
  ];

  get filteredEventos() {
    let filtered = this.eventos;
    if (this.statusFilter === 'proximos') {
      const now = new Date().toISOString();
      filtered = filtered.filter(e => e.fecha_inicio && e.fecha_inicio >= now);
    } else if (this.statusFilter) {
      filtered = filtered.filter(e => e.estado === this.statusFilter);
    }
    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      filtered = filtered.filter(e => e.titulo?.toLowerCase().includes(q));
    }
    return filtered;
  }

  statusBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      publicado: 'bg-green-100 text-green-800',
      borrador: 'bg-yellow-100 text-yellow-800',
      pospuesto: 'bg-amber-100 text-amber-800',
      cancelado: 'bg-red-100 text-red-800',
      finalizado: 'bg-gray-100 text-gray-800',
    };
    return map[estado] || 'bg-gray-100 text-gray-800';
  }

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService
  ) {
    this.eventoForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      imagen: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      ubicacion: [''],
      modalidad: ['Presencial'],
      enlace: [''],
      cupos: [null],
      estado: ['publicado'],
    });
  }

  ngOnInit() { this.cargarEventos(); }

  private async cargarEventos() {
    try {
      const { data, error } = await this.supabase.client.from('eventos').select('*').order('fecha_inicio', { ascending: false });
      if (error) throw error;
      this.eventos = data || [];
    } catch (e: any) { console.error(e); } finally { this.loading = false; }
  }

  toggleForm() { this.showForm = !this.showForm; if (this.showForm) this.resetForm(); }

  resetForm() {
    this.eventoForm.reset({ modalidad: 'Presencial', estado: 'publicado' });
    this.editando = false;
    this.editandoId = null;
    this.formError = '';
    this.imgPreview = null;
  }

  onDropImg(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.subirImagen(file);
  }

  onImgSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.subirImagen(file);
    input.value = '';
  }

  private async subirImagen(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      this.formError = 'La imagen excede 10MB';
      return;
    }
    this.imgSubiendo = true;
    this.formError = '';
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `eventos/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
      await this.supabase.uploadImage('eventos', path, file);
      const url = this.supabase.getPublicUrl('eventos', path);
      this.eventoForm.patchValue({ imagen: url });
      this.imgPreview = url;
    } catch (e: any) {
      this.formError = 'Error al subir imagen: ' + (e.message || '');
    } finally {
      this.imgSubiendo = false;
    }
  }

  editar(evento: any) {
    this.editando = true;
    this.editandoId = evento.id;
    this.showForm = true;
    this.imgPreview = evento.imagen || null;
    this.eventoForm.patchValue({
      ...evento,
      fecha_inicio: evento.fecha_inicio ? evento.fecha_inicio.substring(0, 16) : '',
      fecha_fin: evento.fecha_fin ? evento.fecha_fin.substring(0, 16) : '',
    });
  }

  async guardar() {
    if (this.eventoForm.invalid) return;
    this.guardando = true;
    this.formError = '';
    try {
      const data = { ...this.eventoForm.value };
      if (this.editandoId) {
        const { error } = await this.supabase.client.from('eventos').update(data).eq('id', this.editandoId);
        if (error) throw error;
      } else {
        const { error } = await this.supabase.client.from('eventos').insert(data);
        if (error) throw error;
      }
      this.showForm = false;
      await this.cargarEventos();
    } catch (e: any) { this.formError = e.message || 'Error al guardar'; } finally { this.guardando = false; }
  }

  async eliminar(id: string) {
    if (!confirm('¿Eliminar este evento?')) return;
    try { await this.supabase.client.from('eventos').delete().eq('id', id); await this.cargarEventos(); } catch {}
  }
}
