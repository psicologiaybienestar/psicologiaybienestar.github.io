import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-galeria',
  standalone: true,
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Nuestra Galería</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>

        @if (loading) {
          <p class="text-center text-gray-500 py-10">Cargando galería...</p>
        }

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          @for (img of imagenes; track img.id; let i = $index) {
            <div class="relative rounded-xl overflow-hidden border-2 border-primary hover:border-secondary transition-colors cursor-pointer group" (click)="openLightbox(i)">
              <img [src]="img.url" [alt]="img.titulo || 'Galería'" class="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
          }
        </div>

        @if (lightboxOpen && lightboxIndex >= 0) {
          <div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" (click)="closeLightbox()">
            <button class="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10 w-14 h-14 rounded-full bg-primary/90 border-2 border-white flex items-center justify-center" (click)="closeLightbox()">&times;</button>
            <button class="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-secondary z-10 w-14 h-14 rounded-full bg-primary/90 border-2 border-white flex items-center justify-center" (click)="prevImage($event)">&lsaquo;</button>
            <img [src]="imagenes[lightboxIndex].url" class="max-w-[90vw] max-h-[90vh] object-contain" (click)="$event.stopPropagation()" />
            <button class="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-secondary z-10 w-14 h-14 rounded-full bg-primary/90 border-2 border-white flex items-center justify-center" (click)="nextImage($event)">&rsaquo;</button>
          </div>
        }
      </div>
    </div>
  `,
})
export class GaleriaComponent implements OnInit {
  imagenes: any[] = [];
  loading = true;
  lightboxOpen = false;
  lightboxIndex = -1;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadGaleria();
  }

  private async loadGaleria() {
    this.loading = true;
    try {
      const { data, error } = await this.supabase.client
        .from('galeria')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      this.imagenes = data || [];
    } catch {
      this.imagenes = [];
    } finally {
      this.loading = false;
    }
  }

  openLightbox(index: number) {
    this.lightboxIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.lightboxIndex = -1;
  }

  prevImage(event: Event) {
    event.stopPropagation();
    this.lightboxIndex = (this.lightboxIndex - 1 + this.imagenes.length) % this.imagenes.length;
  }

  nextImage(event: Event) {
    event.stopPropagation();
    this.lightboxIndex = (this.lightboxIndex + 1) % this.imagenes.length;
  }
}
