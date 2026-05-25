import { Component, OnInit } from '@angular/core';
import { TestimoniosService } from '../../core/services/testimonios.service';

@Component({
  selector: 'app-testimonios',
  standalone: true,
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Todos los Testimonios</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>

        <div id="grid-testimonios" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (t of testimonios; track t.nombre; let i = $index) {
            <div class="comentario-tarjeta">
              <div class="flex items-center space-x-1 mb-3">
                @for (s of getStars(t.calificacion); track s) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                }
              </div>
              <p class="text-gray-700">{{ t.comentario }}</p>
              <div class="mt-4 pt-4 border-t border-gray-100">
                <p class="font-semibold text-gray-800">{{ t.nombre }}</p>
                <p class="text-gray-500 text-sm">{{ t.fecha }}</p>
              </div>
            </div>
          }
        </div>

        @if (error) {
          <div class="text-center py-10">
            <p class="text-gray-500 mb-4">{{ error }}</p>
            <a href="https://psicologiaybienestar.netlify.app/pages/testimonios.html" target="_blank" class="text-primary hover:underline">Ver testimonios en sitio original</a>
          </div>
        }
      </div>
    </div>
  `,
})
export class TestimoniosComponent implements OnInit {
  testimonios: any[] = [];
  error = '';

  constructor(private testimoniosService: TestimoniosService) {}

  ngOnInit() {
    this.testimoniosService.getTestimonios().subscribe({
      next: (data) => {
        this.testimonios = data;
      },
      error: () => {
        this.error = 'No se pudieron cargar los testimonios.';
      },
    });
  }

  getStars(calificacion: string): number[] {
    return Array(parseInt(calificacion, 10) || 5).fill(0);
  }
}
