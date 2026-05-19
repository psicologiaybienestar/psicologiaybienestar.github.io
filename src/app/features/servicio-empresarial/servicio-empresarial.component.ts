import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-servicio-empresarial',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="empresarial-page min-h-screen">
      <section class="py-24 px-4 md:px-8 relative">
        <div class="relative z-10 container mx-auto max-w-6xl">
          <h2 class="text-3xl md:text-4xl font-bold text-center text-primary mb-6">Servicios Empresariales</h2>

          <div class="max-w-3xl mx-auto text-center text-lg text-gray-700 mb-16 bg-white/80 bg-white backdrop-blur p-8 rounded-2xl shadow-lg">
            Brindamos
            <span class="text-primary font-semibold">talleres preventivos, pedagógicos y complementarios</span>
            diseñados según las necesidades de cada compañía. Nuestro enfoque integral busca promover el bienestar físico, emocional y mental en el entorno laboral.
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div class="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 transform transition duration-500 hover:scale-105 hover:shadow-2xl">
              <h3 class="text-xl font-semibold text-primary mb-2">1. Jornadas Complementarias de Bienestar</h3>
              <p class="text-gray-700">Nuestras innovadoras alternativas lúdico-pedagógicas están diseñadas especialmente para ofrecer jornadas de bienestar empresarial. Combinamos actividades físicas emocionantes, como escalada y boxeo, con sesiones de relajación que garantizan una efectiva descarga de estrés. Nuestro enfoque integral no solo promueve la salud física, sino que también revitaliza el ambiente laboral, ayudando a tu equipo a recuperar su bienestar y energía, previniendo el síndrome de Burnout.</p>
            </div>
            <div class="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 transform transition duration-500 hover:scale-105 hover:shadow-2xl">
              <h3 class="text-xl font-semibold text-primary mb-2">2. Terapias</h3>
              <p class="text-gray-700">Servicio de terapia psicológica individual, de pareja o familiar para empleados con costos especiales por convenio empresarial.<br /><span class="italic text-sm text-gray-500">*Aplica condiciones</span></p>
            </div>
            <div class="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 transform transition duration-500 hover:scale-105 hover:shadow-2xl">
              <h3 class="text-xl font-semibold text-primary mb-2">3. Jornadas de Descarga Emocional</h3>
              <p class="text-gray-700">Servicio de jornadas de descarga emocional para empleados, adaptadas a las necesidades de la compañía, donde se abordan situaciones del día a día brindando herramientas de afrontamiento según el caso.<br /><span class="italic text-sm text-gray-500">*Aplica condiciones</span></p>
            </div>
            <div class="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 transform transition duration-500 hover:scale-105 hover:shadow-2xl">
              <h3 class="text-xl font-semibold text-primary mb-2">4. Orientación Vocacional</h3>
              <p class="text-gray-700">Servicio de orientación vocacional dirigido a estudiantes de grado noveno a once.<br /><span class="italic text-sm text-gray-500">*Aplica para hijos de empleados de las empresas aliadas</span></p>
            </div>
          </div>

          <div class="swiper empresarial-swiper mb-16 px-4">
            <div class="swiper-wrapper">
              @for (img of imagenes; track img) {
                <div class="swiper-slide">
                  <img [src]="img" alt="Empresarial" class="w-full h-56 md:h-72 object-cover rounded-2xl shadow-lg" loading="lazy" />
                </div>
              }
            </div>
            <div class="swiper-pagination"></div>
          </div>

          <div class="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <a routerLink="/inicio" class="inline-block bg-primary text-white py-3 px-8 rounded-full font-semibold hover:bg-secondary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              &larr; Volver a Inicio
            </a>
            <a routerLink="/galeria" class="inline-block bg-primary text-white py-3 px-8 rounded-full font-semibold hover:bg-secondary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Ver la galería de nuestros servicios
            </a>
          </div>
        </div>
      </section>

      <section class="py-20 px-4 relative">
        <div class="container mx-auto max-w-2xl relative z-10">
          <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Contáctanos</h2>
          <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-10 rounded-full"></div>
          <div class="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-8">
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-5">
              <input formControlName="nombre" type="text" placeholder="Nombre completo" required
                class="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-gray-700" />
              <input formControlName="email" type="email" placeholder="Correo electrónico" required
                class="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-gray-700" />
              <input formControlName="telefono" type="tel" placeholder="Teléfono" required
                class="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-gray-700" />
              <textarea formControlName="mensaje" rows="4" placeholder="Escribe tu mensaje..." required
                class="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-gray-700 resize-none"></textarea>
              <button type="submit" [disabled]="contactForm.invalid || submitting"
                class="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 rounded-xl hover:scale-[1.02] hover:shadow-xl transition-all duration-300 shadow-lg disabled:opacity-50">
                @if (submitting) {
                  <span class="flex items-center justify-center space-x-2">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <span>Enviando...</span>
                  </span>
                } @else {
                  <span>Enviar mensaje</span>
                }
              </button>
            </form>
            @if (successMessage) {
              <div class="mt-4 p-4 bg-green-100 text-green-800 rounded-xl text-center font-semibold">{{ successMessage }}</div>
            }
            @if (errorMessage) {
              <div class="mt-4 p-4 bg-red-100 text-red-800 rounded-xl text-center font-semibold">{{ errorMessage }}</div>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .empresarial-page {
      min-height: 100vh;
      background-image: url('/assets/img/background-empresarial.jpeg');
      background-size: cover;
      background-repeat: no-repeat;
      background-attachment: fixed;
      background-position: center center;
    }
    .empresarial-swiper {
      padding-bottom: 50px;
    }
    .empresarial-swiper .swiper-pagination-bullet {
      background-color: #627eff;
      opacity: 0.5;
    }
    .empresarial-swiper .swiper-pagination-bullet-active {
      opacity: 1;
    }
    .empresarial-swiper .swiper-slide {
      display: flex;
      justify-content: center;
    }
  `]
})
export class ServicioEmpresarialComponent implements AfterViewInit {
  imagenes: string[] = [];

  contactForm: FormGroup;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      mensaje: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.cargarImagenes();
  }

  private cargarImagenes() {
    const base = 'assets/img_em/';
    const files = [
      'empresarial_1.jpeg', 'empresarial_7.jpeg', 'empresarial_3.jpeg',
      'empresarial_10.jpeg', 'empresarial_4.jpeg', 'empresarial_6.jpeg',
      'empresarial_2.jpeg', 'empresarial_8.jpeg', 'empresarial_9.jpeg',
      'empresarial_5.jpeg',
    ];
    const galeria = [
      'galeria_em1.jpeg', 'galeria_em2.jpeg', 'galeria_em3.jpeg',
      'galeria_em4.jpeg', 'galeria_em5.jpeg',
    ];
    this.imagenes = [...files, ...galeria].map(f => base + f);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const el = document.querySelector('.empresarial-swiper');
      if (el && !(el as any).__swiper) {
        const slides = el.querySelectorAll('.swiper-slide').length;
        new Swiper('.empresarial-swiper', {
          modules: [Autoplay, Pagination],
          loop: slides >= 5,
          autoplay: { delay: 3000, disableOnInteraction: false },
          pagination: { el: '.swiper-pagination', clickable: true },
          spaceBetween: 20,
          slidesPerView: 1,
          breakpoints: {
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          },
        });
        (el as any).__swiper = true;
      }
    }, 300);
  }

  async onSubmit() {
    if (this.contactForm.invalid) return;
    this.submitting = true;
    try {
      const fd = new FormData();
      fd.append('nombre', this.contactForm.value.nombre);
      fd.append('email', this.contactForm.value.email);
      fd.append('telefono', this.contactForm.value.telefono);
      fd.append('mensaje', this.contactForm.value.mensaje);
      const res = await fetch('https://formspree.io/f/mblgpnvb', {
        method: 'POST', body: fd,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        this.successMessage = '¡Mensaje enviado con éxito!';
        this.contactForm.reset();
        setTimeout(() => this.successMessage = '', 5000);
      } else {
        this.errorMessage = 'Error al enviar. Intenta de nuevo.';
      }
    } catch {
      this.errorMessage = 'Error de conexión.';
    } finally {
      this.submitting = false;
    }
  }
}
