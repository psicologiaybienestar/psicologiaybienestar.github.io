import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { NgClass, NgStyle, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Subscription } from 'rxjs';
import { TestimoniosService } from '../../core/services/testimonios.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgClass, NgStyle, RouterLink, ReactiveFormsModule, DatePipe],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Hero Section -->
    <section id="inicio" class="relative h-screen flex items-center justify-center overflow-hidden" style="background: url('assets/img/inicio-bg.png') center center/cover no-repeat;">
      <div class="absolute inset-0 bg-black/30"></div>
      <div class="relative z-10 text-center px-4">
        <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-6 animate-fade-in">Bienvenidos</h1>
        <p class="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">Tu espacio de bienestar emocional y crecimiento personal</p>
        <a routerLink="/contacto" class="inline-block bg-secondary hover:bg-accent text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg">
          Contáctanos
        </a>
      </div>
    </section>

    <!-- Nosotros Section -->
    <section id="nosotros" class="py-20 px-4">
      <div class="container mx-auto max-w-4xl text-center animate-fade-in">
        <h2 class="text-4xl font-bold text-gray-800 mb-8">Sobre Nosotros</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8 rounded-full"></div>
        <p class="text-lg text-gray-600 leading-relaxed">
          En Psicología & Bienestar, nos dedicamos a promover la salud mental y el bienestar emocional de nuestra comunidad. Contamos con un equipo de profesionales comprometidos con brindar atención psicológica de calidad, orientación vocacional y programas de desarrollo personal. Creemos en un enfoque integral que combina la ciencia psicológica con la calidez humana.
        </p>
      </div>
    </section>

    <!-- Servicios Section -->
    <section id="servicios" class="py-20 px-4 bg-gray-50">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4 animate-fade-in">Nuestros Servicios</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (service of services; track service.title; let i = $index) {
            <div class="service-card group cursor-pointer" [ngClass]="'animate-fade-in delay-' + (i + 1)" (click)="toggleService(i)">
              <div class="overflow-hidden rounded-xl mb-4">
                <img [src]="service.image" [alt]="service.title" class="aspect-video object-cover w-full group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ service.title }}</h3>
              <p class="text-gray-600 mb-4">{{ service.description }}</p>
              <button class="toggle-btn bg-secondary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-accent transition-all duration-300 flex items-center space-x-2 mx-auto group-hover:shadow-lg">
                <span>Ver más</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-all duration-500" [ngClass]="{'rotate-180': service.open}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div class="details transition-all duration-500 ease-out overflow-hidden" [ngClass]="service.open ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'">
                <ul class="space-y-2 text-left">
                  @for (item of service.items; track item) {
                    <li class="flex items-start space-x-2 text-gray-700 animate-slide-down">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ item }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>
          }
        </div>
        <div class="text-center mt-12 animate-fade-in delay-4">
          <a routerLink="/servicio-empresarial" class="inline-block bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-4 rounded-full hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-xl">
            Conoce nuestro servicio empresarial
          </a>
        </div>
      </div>
    </section>

    <!-- Equipo Section -->
    <section id="equipo" class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4 animate-fade-in">Nuestro Equipo</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          @for (member of team; track member.name; let i = $index) {
            <div class="text-center" [ngClass]="'animate-fade-in-up delay-' + (i + 1)">
              <div class="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-500">
                <img [src]="member.image" [alt]="member.name" class="w-full h-full object-cover" />
              </div>
              <h3 class="text-lg font-bold text-gray-800">{{ member.name }}</h3>
              <p class="text-gray-500 text-sm">{{ member.role }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Testimonios Section -->
    <section id="testimonios" class="py-20 px-4 bg-[#f0f8ff]">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Testimonios</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4 rounded-full"></div>
        <div class="text-center mb-8">
          <a routerLink="/galeria" class="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
            Ver Galería
          </a>
        </div>

        <div class="swiper testimonios-swiper relative">
          <div class="swiper-wrapper">
            @for (testimonio of testimonios; track testimonio.nombre) {
              <div class="swiper-slide">
                <div class="comentario-tarjeta flex flex-col justify-between">
                  <div>
                    <div class="flex items-center space-x-1 mb-3">
                      @for (star of getStars(testimonio.calificacion); track $index) {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      }
                    </div>
                    @if (testimonio.mostrarCompleto || !testimonio.textoTruncado) {
                      <p class="text-gray-700">{{ testimonio.textoCompleto }}</p>
                    } @else {
                      <p class="text-gray-700">{{ testimonio.textoTruncado }}</p>
                    }
                    @if (testimonio.tieneMas) {
                      <button (click)="toggleTestimonioTexto(testimonio)" class="text-primary text-sm mt-2 hover:underline">
                        {{ testimonio.mostrarCompleto ? 'Ver menos' : 'Ver más' }}
                      </button>
                    }
                  </div>
                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <p class="font-semibold text-gray-800">{{ testimonio.nombre }}</p>
                    <p class="text-gray-500 text-sm">{{ testimonio.fecha }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        </div>
        <div class="text-center mt-8">
          <a routerLink="/testimonios" class="text-primary font-semibold hover:text-accent transition-colors">
            Ver todos los testimonios &rarr;
          </a>
        </div>
      </div>
    </section>

    <!-- Noticias y Eventos Section -->
    <section id="noticias-eventos" class="py-20 px-4 bg-white">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4 animate-fade-in">Últimas Noticias & Eventos</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-12 rounded-full"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Noticias
            </h3>
            @if (latestNoticias.length > 0) {
              <div class="space-y-4">
                @for (noticia of latestNoticias; track noticia.id; let i = $index) {
                  <div class="bg-gray-50 rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 animate-fade-in-up" [ngClass]="'delay-' + (i + 1)">
                    <h4 class="font-bold text-gray-800 mb-1">{{ noticia.titulo }}</h4>
                    <p class="text-sm text-gray-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ noticia.fecha_publicacion | date }}
                    </p>
                    <p class="text-gray-600 text-sm line-clamp-2">{{ noticia.resumen || noticia.contenido?.substring(0, 120) }}</p>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-400 text-sm">No hay noticias publicadas aún.</p>
            }
            <div class="mt-6">
              <a routerLink="/noticias" class="text-primary font-semibold hover:text-accent transition-colors">
                Ver todas las noticias &rarr;
              </a>
            </div>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Próximos Eventos
            </h3>
            @if (proximosEventos.length > 0) {
              <div class="space-y-4">
                @for (evento of proximosEventos; track evento.id; let i = $index) {
                  <div class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-blue-100 animate-fade-in-up" [ngClass]="'delay-' + (i + 1)">
                    <div class="flex items-start gap-4">
                      <div class="bg-white rounded-lg p-3 text-center min-w-[60px] shadow-sm">
                        <div class="text-xl font-bold text-primary">{{ evento.fecha_inicio | date:'dd' }}</div>
                        <div class="text-xs text-gray-500 uppercase">{{ evento.fecha_inicio | date:'MMM' }}</div>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-bold text-gray-800 mb-1">{{ evento.titulo }}</h4>
                        <p class="text-sm text-gray-600 line-clamp-2">{{ evento.descripcion }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-400 text-sm">No hay eventos próximos.</p>
            }
            <div class="mt-6">
              <a routerLink="/eventos" class="text-primary font-semibold hover:text-accent transition-colors">
                Ver todos los eventos &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contacto Section -->
    <section id="contacto" class="py-20 px-4 relative overflow-hidden">
      <div id="svgRain" class="absolute inset-0 pointer-events-none">
        @for (icon of rainIcons; track icon.id) {
          <div
            class="absolute text-primary/10 animate-floaty"
            [ngStyle]="{
              left: icon.x + '%',
              top: icon.y + '%',
              animationDuration: icon.duration + 's',
              transform: 'scale(' + icon.scale + ')'
            }"
          >
            @switch (icon.type) {
              @case (0) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              }
              @case (1) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              }
              @case (2) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16"/></svg>
              }
            }
          </div>
        }
      </div>
      <div class="relative z-10 container mx-auto max-w-2xl">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Contáctanos</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-10 rounded-full"></div>
        <div class="bg-white/50 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8">
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <input
                formControlName="nombre"
                type="text"
                placeholder="Nombre"
                class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-3 focus:ring-primary/30 transition-all outline-none"
              />
            </div>
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <input
                formControlName="email"
                type="email"
                placeholder="Correo electrónico"
                class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-3 focus:ring-primary/30 transition-all outline-none"
              />
            </div>
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              <input
                formControlName="telefono"
                type="tel"
                placeholder="Teléfono"
                class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-3 focus:ring-primary/30 transition-all outline-none"
              />
            </div>
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-4 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
              <textarea
                formControlName="mensaje"
                rows="4"
                placeholder="Mensaje"
                class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-3 focus:ring-primary/30 transition-all outline-none resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              [disabled]="contactForm.invalid || submitting"
              class="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 rounded-xl hover:scale-[1.02] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
            <div class="mt-6 p-4 bg-green-100 text-green-800 rounded-xl text-center font-semibold">
              {{ successMessage }}
            </div>
          }
          @if (errorMessage) {
            <div class="mt-6 p-4 bg-red-100 text-red-800 rounded-xl text-center font-semibold">
              {{ errorMessage }}
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .testimonios-swiper {
      padding-bottom: 60px;
    }
    .testimonios-swiper .swiper-button-next,
    .testimonios-swiper .swiper-button-prev {
      color: #627eff;
      --swiper-navigation-size: 20px;
    }
    .testimonios-swiper .swiper-pagination-bullet {
      background-color: #627eff;
      opacity: 0.5;
    }
    .testimonios-swiper .swiper-pagination-bullet-active {
      opacity: 1;
    }
    .testimonios-swiper .swiper-slide {
      display: flex;
      justify-content: center;
      align-items: stretch;
      height: auto;
    }
    @media (max-width: 768px) {
      .testimonios-swiper .swiper-button-next,
      .testimonios-swiper .swiper-button-prev {
        display: none;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  testimonios: any[] = [];
  latestNoticias: any[] = [];
  proximosEventos: any[] = [];
  noticiasEventosLoaded = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';
  contactForm!: FormGroup;

  services = [
    {
      title: 'Terapia',
      description: 'Atención psicológica profesional para individuos, parejas y familias.',
      image: 'assets/img/terapia.jfif',
      open: false,
      items: ['Terapia Individual', 'Terapia de Pareja', 'Terapia Familiar'],
    },
    {
      title: 'Orientación Vocacional',
      description: 'Te ayudamos a descubrir tu verdadera vocación profesional.',
      image: 'assets/img/orientacion.jpeg',
      open: false,
      items: [
        'Evaluación de Habilidades',
        'Análisis de Intereses',
        'Fortalecimiento de habilidades blandas',
        'Mayor claridad profesional',
        'Toma de decisiones informada',
      ],
    },
    {
      title: 'Talleres y Charlas',
      description: 'Espacios de aprendizaje y crecimiento personal y grupal.',
      image: 'assets/img/talleres-charlas.jpeg',
      open: false,
      items: ['Talleres Lúdicos Preventivos', 'Talleres Pedagógicos', 'Taller de Padres'],
    },
  ];

  team = [
    { name: 'Sindy Margarita Garrido', role: 'Psicóloga', image: 'assets/team/sindy_team.png' },
    { name: 'Manuel Felipe Ascencio Tellez', role: 'Psicólogo', image: 'assets/team/felipe_team.png' },
    { name: 'Viviana Quiroga Corredo', role: 'Psicóloga', image: 'assets/team/viviana_team.png' },
  ];

  rainIcons: any[] = [];

  constructor(
    private testimoniosService: TestimoniosService,
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) {
    this.contactForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      mensaje: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadTestimonios();
    this.loadNoticiasEventos();
    this.generateRainIcons();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initSwiper(), 500);
  }

  private loadTestimonios() {
    const sub = this.testimoniosService.getTestimonios().subscribe({
      next: (data: any[]) => {
        this.testimonios = data.map((t: any) => ({
          ...t,
          textoTruncado: t.comentario?.length > 350 ? t.comentario.substring(0, 350) + '...' : null,
          textoCompleto: t.comentario || '',
          tieneMas: t.comentario?.length > 350,
          mostrarCompleto: false,
        }));
        setTimeout(() => this.initSwiper(), 200);
      },
    });
    this.subscriptions.push(sub);
  }

  private async loadNoticiasEventos() {
    try {
      const [noticias, eventos] = await Promise.all([
        this.supabaseService.getLatestNoticias(3),
        this.supabaseService.getProximosEventos(3),
      ]);
      this.latestNoticias = noticias;
      this.proximosEventos = eventos;
    } catch {
      // Silently handle - section shows empty state
    }
    this.noticiasEventosLoaded = true;
  }

  private generateRainIcons() {
    const iconTypes = [0, 1, 2];
    this.rainIcons = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 8 + Math.random() * 6,
      scale: 0.8 + Math.random() * 0.6,
    }));
  }

  private initSwiper() {
    const el = document.querySelector('.testimonios-swiper');
    if (!el || (el as any).__swiper) return;
    const slides = el.querySelectorAll('.swiper-slide').length;
    new Swiper('.testimonios-swiper', {
      modules: [Navigation, Pagination],
      loop: slides >= 3,
      spaceBetween: 30,
      slidesPerView: 1,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 15 },
        1024: { slidesPerView: 2, spaceBetween: 15 },
      },
    });
    (el as any).__swiper = true;
  }

  toggleService(index: number) {
    this.services = this.services.map((s, i) => ({
      ...s,
      open: i === index ? !s.open : false,
    }));
  }

  toggleTestimonioTexto(t: any) {
    t.mostrarCompleto = !t.mostrarCompleto;
  }

  getStars(calificacion: string): number[] {
    const num = parseInt(calificacion, 10) || 5;
    return Array(num).fill(0);
  }

  async onSubmit() {
    if (this.contactForm.invalid) return;
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const fd = new FormData();
      fd.append('nombre', this.contactForm.value.nombre);
      fd.append('email', this.contactForm.value.email);
      fd.append('telefono', this.contactForm.value.telefono);
      fd.append('mensaje', this.contactForm.value.mensaje);

      const res = await fetch('https://formspree.io/f/mblgpnvb', {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        this.successMessage = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
        this.contactForm.reset();
        setTimeout(() => (this.successMessage = ''), 5000);
      } else {
        this.errorMessage = 'Error al enviar el mensaje. Intenta de nuevo.';
      }
    } catch {
      this.errorMessage = 'Error de conexión. Intenta de nuevo.';
    } finally {
      this.submitting = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
