import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Noticias</h1>
        <button (click)="toggleForm()"
          class="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-semibold">
          {{ showForm ? 'Cancelar' : 'Nueva noticia' }}
        </button>
      </div>

      @if (showForm) {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ editando ? 'Editar' : 'Crear' }} noticia</h2>
          <form [formGroup]="noticiaForm" (ngSubmit)="guardar()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input formControlName="titulo" type="text" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input formControlName="categoria" type="text" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Resumen</label>
              <textarea formControlName="resumen" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
              <textarea formControlName="contenido" rows="8" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none font-mono text-sm"></textarea>
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
            <div class="flex items-center space-x-6">
              <label class="flex items-center space-x-2">
                <input formControlName="destacado" type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" />
                <span class="text-sm text-gray-700">Destacado</span>
              </label>
              <label class="flex items-center space-x-2">
                <select formControlName="estado" class="px-3 py-2 rounded-xl border border-gray-300 text-sm">
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                  <option value="archivado">Archivado</option>
                </select>
              </label>
            </div>
            <div class="flex space-x-3 pt-2">
              <button type="submit" [disabled]="noticiaForm.invalid || guardando"
                class="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                @if (guardando) { Guardando... } @else { Guardar }
              </button>
              <button type="button" (click)="showForm = false"
                class="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
            </div>
            @if (formError) {
              <p class="text-red-500 text-sm">{{ formError }}</p>
            }
          </form>
        </div>
      }

      @if (loading) {
        <p class="text-gray-500 text-center py-10">Cargando...</p>
      }

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (n of noticias; track n.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <p class="font-medium text-gray-800">{{ n.titulo }}</p>
                    <p class="text-xs text-gray-500">{{ n.categoria }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-semibold px-3 py-1 rounded-full"
                      [class]="n.estado === 'publicado' ? 'bg-green-100 text-green-800' : n.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'">
                      {{ n.estado }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ n.fecha_publicacion | date:'dd/MM/yyyy' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex space-x-2">
                      <button (click)="editar(n)" class="text-primary hover:text-accent text-sm font-semibold">Editar</button>
                      <button (click)="eliminar(n.id)" class="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (noticias.length === 0 && !loading) {
          <p class="text-center text-gray-500 py-10">No hay noticias aún.</p>
        }
      </div>
    </div>
  `,
})
export class AdminNoticiasComponent implements OnInit {
  noticias: any[] = [];
  noticiaForm: FormGroup;
  showForm = false;
  editando = false;
  editandoId: string | null = null;
  loading = true;
  guardando = false;
  formError = '';
  imgPreview: string | null = null;
  imgSubiendo = false;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService
  ) {
    this.noticiaForm = this.fb.group({
      titulo: ['', Validators.required],
      slug: [''],
      contenido: [''],
      resumen: [''],
      imagen: [''],
      categoria: ['General'],
      estado: ['borrador'],
      destacado: [false],
      autor: [''],
    });
  }

  ngOnInit() {
    this.cargarNoticias();
  }

  private async cargarNoticias() {
    try {
      const { data, error } = await this.supabase.client
        .from('noticias')
        .select('*')
        .order('fecha_publicacion', { ascending: false });
      if (error) throw error;
      this.noticias = data || [];
    } catch (e: any) {
      console.error('Error cargando noticias:', e);
    } finally {
      this.loading = false;
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) this.resetForm();
  }

  resetForm() {
    this.noticiaForm.reset({ categoria: 'General', estado: 'borrador', destacado: false });
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
      const path = `noticias/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
      await this.supabase.uploadImage('noticias', path, file);
      const url = this.supabase.getPublicUrl('noticias', path);
      this.noticiaForm.patchValue({ imagen: url });
      this.imgPreview = url;
    } catch (e: any) {
      this.formError = 'Error al subir imagen: ' + (e.message || '');
    } finally {
      this.imgSubiendo = false;
    }
  }

  editar(noticia: any) {
    this.editando = true;
    this.editandoId = noticia.id;
    this.showForm = true;
    this.imgPreview = noticia.imagen || null;
    this.noticiaForm.patchValue({
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      resumen: noticia.resumen,
      imagen: noticia.imagen,
      categoria: noticia.categoria,
      estado: noticia.estado,
      destacado: noticia.destacado,
      autor: noticia.autor,
    });
  }

  async guardar() {
    if (this.noticiaForm.invalid) return;
    this.guardando = true;
    this.formError = '';
    try {
      const data = {
        ...this.noticiaForm.value,
        slug: this.noticiaForm.value.titulo.toLowerCase().replace(/[^a-z0-9áéíóúñ\s]/g, '').replace(/\s+/g, '-'),
        updated_at: new Date().toISOString(),
      };

      if (this.editandoId) {
        const { error } = await this.supabase.client
          .from('noticias')
          .update(data)
          .eq('id', this.editandoId);
        if (error) throw error;
      } else {
        data.fecha_publicacion = new Date().toISOString();
        const { error } = await this.supabase.client
          .from('noticias')
          .insert(data);
        if (error) throw error;
      }

      this.showForm = false;
      await this.cargarNoticias();
    } catch (e: any) {
      this.formError = e.message || 'Error al guardar';
    } finally {
      this.guardando = false;
    }
  }

  async eliminar(id: string) {
    if (!confirm('¿Eliminar esta noticia?')) return;
    try {
      await this.supabase.client.from('noticias').delete().eq('id', id);
      await this.cargarNoticias();
    } catch (e: any) {
      console.error('Error eliminando:', e);
    }
  }
}
