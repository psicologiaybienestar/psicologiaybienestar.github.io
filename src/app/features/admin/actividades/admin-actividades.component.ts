import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { BulkImportService } from '../../../core/services/bulk-import.service';

@Component({
  selector: 'app-admin-actividades',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Actividades de Bienestar</h1>
        <div class="flex space-x-2">
          <button (click)="downloadTemplate()" class="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm">Plantilla</button>
          <label class="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer">
            Importar
            <input type="file" accept=".xlsx,.xls" (change)="onImportFile($event)" class="hidden" />
          </label>
          <button (click)="toggleForm()" class="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-semibold">
            {{ showForm ? 'Cancelar' : 'Nueva actividad' }}
          </button>
        </div>
      </div>

      @if (importResult) {
        <div class="mb-6 p-4 rounded-xl" [class]="importResult.errors.length === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
          <p class="font-semibold">{{ importResult.success }} importadas</p>
          @if (importResult.errors.length > 0) {
            <ul class="mt-2 text-sm list-disc list-inside">
              @for (err of importResult.errors; track err.row) {
                <li>Fila {{ err.row }}: {{ err.message }}</li>
              }
            </ul>
          }
        </div>
      }

      @if (showForm) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ editando ? 'Editar' : 'Crear' }} actividad</h2>
          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input formControlName="title" type="text" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
              <textarea formControlName="content" rows="5" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select formControlName="activity_type" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none">
                  <option value="mindfulness">Mindfulness</option>
                  <option value="meditation">Meditación</option>
                  <option value="breathing">Respiración</option>
                  <option value="relaxation">Relajación</option>
                  <option value="exercise">Ejercicio</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                <input formControlName="duration" type="number" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <div class="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-primary transition-colors cursor-pointer" (click)="imgInput.click()">
                  @if (imgPreview) {
                    <img [src]="imgPreview" class="max-h-16 mx-auto rounded-lg mb-1" />
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  }
                  <input #imgInput type="file" accept="image/*" (change)="onImgSelected($event)" class="hidden" />
                </div>
                <input formControlName="image_url" type="hidden" />
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <label class="flex items-center space-x-2">
                <input formControlName="is_active" type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" />
                <span class="text-sm text-gray-700">Activa</span>
              </label>
            </div>
            <div class="flex space-x-3 pt-2">
              <button type="submit" [disabled]="form.invalid || guardando" class="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                @if (guardando) { Guardando... } @else { Guardar }
              </button>
              <button (click)="showForm = false" class="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">Cancelar</button>
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
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duración</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (item of items; track item.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4"><p class="font-medium text-gray-800">{{ item.title }}</p></td>
                  <td class="px-6 py-4"><span class="text-xs font-semibold px-3 py-1 rounded-full bg-teal-100 text-teal-800">{{ item.activity_type }}</span></td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ item.duration ? item.duration + ' min' : '—' }}</td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-semibold px-3 py-1 rounded-full" [class]="item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                      {{ item.is_active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ item.created_at | date:'dd/MM/yyyy' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex space-x-2">
                      <button (click)="editar(item)" class="text-primary hover:text-accent text-sm font-semibold">Editar</button>
                      <button (click)="eliminar(item.id)" class="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (items.length === 0 && !loading) { <p class="text-center text-gray-500 py-10">No hay actividades.</p> }
      </div>
    </div>
  `,
})
export class AdminActividadesComponent implements OnInit {
  items: any[] = [];
  form: FormGroup;
  showForm = false;
  editando = false;
  editandoId: string | null = null;
  loading = true;
  guardando = false;
  formError = '';
  imgPreview: string | null = null;
  importResult: { success: number; errors: { row: number; message: string }[] } | null = null;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private bulkImport: BulkImportService,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: [''],
      activity_type: ['mindfulness'],
      duration: [null],
      image_url: [''],
      is_active: [true],
    });
  }

  ngOnInit() { this.cargar(); }

  private async cargar() {
    try {
      const { data, error } = await this.supabase.client.from('wellness_activities').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      this.items = data || [];
    } catch (e: any) { console.error(e); } finally { this.loading = false; }
  }

  toggleForm() { this.showForm = !this.showForm; if (this.showForm) this.resetForm(); }

  resetForm() {
    this.form.reset({ activity_type: 'mindfulness', is_active: true });
    this.editando = false;
    this.editandoId = null;
    this.formError = '';
    this.imgPreview = null;
  }

  onImgSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { this.formError = 'La imagen excede 10MB'; return; }
    const reader = new FileReader();
    reader.onload = () => { this.imgPreview = reader.result as string; };
    reader.readAsDataURL(file);
    this.subirImagen(file);
    input.value = '';
  }

  private async subirImagen(file: File) {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `wellness/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
      await this.supabase.uploadImage('wellness', path, file);
      const url = this.supabase.getPublicUrl('wellness', path);
      this.form.patchValue({ image_url: url });
    } catch (e: any) { this.formError = 'Error al subir imagen'; }
  }

  downloadTemplate() { this.bulkImport.downloadTemplate('wellness_activities'); }

  async onImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importResult = await this.bulkImport.importFromFile(file, 'wellness_activities');
    input.value = '';
    if (this.importResult.success > 0) await this.cargar();
  }

  editar(item: any) {
    this.editando = true;
    this.editandoId = item.id;
    this.showForm = true;
    this.imgPreview = item.image_url || null;
    this.form.patchValue(item);
  }

  async guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    this.formError = '';
    try {
      const data = this.form.value;
      if (this.editandoId) {
        const { error } = await this.supabase.client.from('wellness_activities').update(data).eq('id', this.editandoId);
        if (error) throw error;
      } else {
        const { error } = await this.supabase.client.from('wellness_activities').insert(data);
        if (error) throw error;
      }
      this.showForm = false;
      await this.cargar();
    } catch (e: any) { this.formError = e.message || 'Error al guardar'; } finally { this.guardando = false; }
  }

  async eliminar(id: string) {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try { await this.supabase.client.from('wellness_activities').delete().eq('id', id); await this.cargar(); } catch {}
  }
}
