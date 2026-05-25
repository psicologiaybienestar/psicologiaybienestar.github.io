import { Component, OnInit } from '@angular/core';

import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-galeria',
  standalone: true,
  imports: [],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Galería</h1>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Subir imágenes</h2>
        <div
          class="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-primary transition-colors cursor-pointer"
          (click)="fileInput.click()"
          (dragover)="$event.preventDefault()"
          (drop)="onDrop($event)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-gray-500 mb-2">Arrastra imágenes aquí o haz clic para seleccionar</p>
          <p class="text-gray-400 text-sm">JPG, PNG, WebP hasta 10MB</p>
          <input #fileInput type="file" multiple accept="image/*" (change)="onFilesSelected($event)" class="hidden" />
        </div>

        @if (subiendo) {
          <div class="mt-4">
            <div class="flex items-center space-x-3 text-gray-600">
              <svg class="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              <span>Subiendo {{ subiendo }} imágenes...</span>
            </div>
          </div>
        }

        @if (mensaje) {
          <div class="mt-4 p-3 rounded-xl" [class]="mensajeTipo === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
            {{ mensaje }}
          </div>
        }
      </div>

      @if (loading) { <p class="text-gray-500 text-center py-10">Cargando...</p> }

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (img of imagenes; track img.id) {
          <div class="relative group rounded-xl overflow-hidden border border-gray-200">
            <img [src]="img.url" class="w-full aspect-square object-cover" loading="lazy" />
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="eliminar(img)" class="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        }
      </div>
      @if (imagenes.length === 0 && !loading) {
        <p class="text-center text-gray-500 py-10">No hay imágenes en la galería.</p>
      }
    </div>
  `,
})
export class AdminGaleriaComponent implements OnInit {
  imagenes: any[] = [];
  loading = true;
  subiendo = 0;
  mensaje = '';
  mensajeTipo: 'ok' | 'error' = 'ok';

  constructor(private supabase: SupabaseService) {}

  ngOnInit() { this.cargarGaleria(); }

  private async cargarGaleria() {
    try {
      const { data, error } = await this.supabase.client.from('galeria').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      this.imagenes = data || [];
    } catch (e: any) { console.error(e); } finally { this.loading = false; }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) this.subirArchivos(Array.from(files));
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.subirArchivos(Array.from(input.files));
    input.value = '';
  }

  private async subirArchivos(files: File[]) {
    this.subiendo = files.length;
    this.mensaje = '';
    let ok = 0;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        this.mensaje = `Archivo ${file.name} excede 10MB`;
        this.mensajeTipo = 'error';
        this.subiendo--;
        continue;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `galeria/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;

      try {
        await this.supabase.uploadImage('galeria', path, file);
        const url = this.supabase.getPublicUrl('galeria', path);
        await this.supabase.client.from('galeria').insert({ url, titulo: file.name });
        ok++;
      } catch (e: any) {
        this.mensaje = `Error subiendo ${file.name}: ${e.message}`;
        this.mensajeTipo = 'error';
      }
      this.subiendo--;
    }

    if (ok > 0) {
      this.mensaje = `${ok} imagen(es) subida(s) correctamente`;
      this.mensajeTipo = 'ok';
      await this.cargarGaleria();
      setTimeout(() => this.mensaje = '', 3000);
    }
  }

  async eliminar(img: any) {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      const path = img.url.split('/').pop();
      if (path) await this.supabase.deleteImage('galeria', `galeria/${path}`);
      await this.supabase.client.from('galeria').delete().eq('id', img.id);
      await this.cargarGaleria();
    } catch (e: any) { console.error(e); }
  }
}
