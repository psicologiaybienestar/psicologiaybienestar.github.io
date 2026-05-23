import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { BulkImportService } from '../../../core/services/bulk-import.service';

@Component({
  selector: 'app-admin-emociones',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Emociones</h1>
        <div class="flex space-x-2">
          <button (click)="exportF()" class="bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 transition-colors font-semibold text-sm">Exportar</button>
          <button (click)="downloadTemplate()" class="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm">Plantilla</button>
          <label class="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer">
            Importar
            <input type="file" accept=".xlsx,.xls" (change)="onImportFile($event)" class="hidden" />
          </label>
          <button (click)="toggleForm()" class="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-semibold">
            {{ showForm ? 'Cancelar' : 'Nueva emoción' }}
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 mb-6">
        <input [(ngModel)]="searchTerm" (input)="applyFilter()" type="text" placeholder="Buscar por nombre..."
          class="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-sm" />
        <select [(ngModel)]="activeFilterEmo" (change)="applyFilter()" class="px-4 py-2.5 rounded-xl border border-gray-300 text-sm">
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
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
          <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ editando ? 'Editar' : 'Crear' }} emoción</h2>
          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input formControlName="emotion_name" type="text" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Icono (emoji)</label>
                <input formControlName="icon" type="text" maxlength="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea formControlName="description" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color (hex)</label>
              <div class="flex items-center space-x-3">
                <input formControlName="color" type="color" class="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                <input formControlName="color" type="text" class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Recomendaciones (JSON)</label>
              <textarea formControlName="recommendations" rows="4" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-mono text-sm focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" placeholder='[{"title": "Respira", "text": "Inhala profundo..."}]'></textarea>
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

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (item of filteredItems; track item.id) {
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" [style.background]="item.color || '#F9FAFB'">
                  {{ item.icon || '😊' }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">{{ item.emotion_name }}</h3>
                  <p class="text-xs text-gray-500 truncate max-w-[180px]">{{ item.description }}</p>
                </div>
              </div>
              <span class="text-xs font-semibold px-2 py-1 rounded-full" [class]="item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                {{ item.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            @if (item.recommendations && item.recommendations.length > 0) {
              <div class="text-xs text-gray-500 mb-3">{{ item.recommendations.length }} recomendación(es)</div>
            }
            <div class="flex space-x-2">
              <button (click)="editar(item)" class="text-primary hover:text-accent text-sm font-semibold">Editar</button>
              <button (click)="eliminar(item.id)" class="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
            </div>
          </div>
        }
      </div>
      @if (filteredItems.length === 0 && !loading) { <p class="text-center text-gray-500 py-10">No hay emociones.</p> }
    </div>
  `,
})
export class AdminEmocionesComponent implements OnInit {
  items: any[] = [];
  form: FormGroup;
  showForm = false;
  editando = false;
  editandoId: string | null = null;
  loading = true;
  guardando = false;
  formError = '';
  importResult: { success: number; errors: { row: number; message: string }[] } | null = null;

  searchTerm = '';
  activeFilterEmo: 'all' | 'active' | 'inactive' = 'all';

  get filteredItems() {
    let result = [...this.items];
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      result = result.filter(i => (i.emotion_name || '').toLowerCase().includes(s));
    }
    if (this.activeFilterEmo === 'active') {
      result = result.filter(i => i.is_active);
    } else if (this.activeFilterEmo === 'inactive') {
      result = result.filter(i => !i.is_active);
    }
    return result;
  }

  applyFilter() {}

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private bulkImport: BulkImportService,
  ) {
    this.form = this.fb.group({
      emotion_name: ['', Validators.required],
      description: [''],
      color: ['#F9FAFB'],
      icon: ['😊'],
      recommendations: [[]],
      is_active: [true],
    });
  }

  ngOnInit() { this.cargar(); }

  private async cargar() {
    try {
      const { data, error } = await this.supabase.client.from('emotions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      this.items = (data || []).map((e: any) => ({
        ...e,
        recommendations: typeof e.recommendations === 'string' ? JSON.parse(e.recommendations) : (e.recommendations || []),
      }));
    } catch (e: any) { console.error(e); } finally { this.loading = false; }
  }

  toggleForm() { this.showForm = !this.showForm; if (this.showForm) this.resetForm(); }

  resetForm() {
    this.form.reset({ color: '#F9FAFB', icon: '😊', recommendations: [], is_active: true });
    this.editando = false;
    this.editandoId = null;
    this.formError = '';
  }

  editar(item: any) {
    this.editando = true;
    this.editandoId = item.id;
    this.showForm = true;
    this.form.patchValue({
      ...item,
      recommendations: JSON.stringify(item.recommendations, null, 2),
    });
  }

  async guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    this.formError = '';
    try {
      let data = { ...this.form.value };
      if (typeof data.recommendations === 'string') {
        try { data.recommendations = JSON.parse(data.recommendations); } catch { data.recommendations = []; }
      }
      if (this.editandoId) {
        const { error } = await this.supabase.client.from('emotions').update(data).eq('id', this.editandoId);
        if (error) throw error;
      } else {
        const { error } = await this.supabase.client.from('emotions').insert(data);
        if (error) throw error;
      }
      this.showForm = false;
      await this.cargar();
    } catch (e: any) { this.formError = e.message || 'Error al guardar'; } finally { this.guardando = false; }
  }

  async exportF() {
    await this.bulkImport.exportToFile('emotions', this.filteredItems);
  }

  downloadTemplate() { this.bulkImport.downloadTemplate('emotions'); }

  async onImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importResult = await this.bulkImport.importFromFile(file, 'emotions');
    input.value = '';
    if (this.importResult.success > 0) await this.cargar();
  }

  async eliminar(id: string) {
    if (!confirm('¿Eliminar esta emoción?')) return;
    try { await this.supabase.client.from('emotions').delete().eq('id', id); await this.cargar(); } catch {}
  }
}
