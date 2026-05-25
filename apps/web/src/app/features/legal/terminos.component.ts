import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-4xl">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Términos y Condiciones</h1>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mb-8 rounded-full"></div>

        <div class="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar el sitio web de Psicología & Bienestar, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguno de estos términos, le solicitamos que no utilice nuestro sitio.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">2. Servicios</h2>
            <p>Psicología & Bienestar ofrece servicios de terapia psicológica, orientación vocacional, talleres y charlas educativas. Los servicios se prestan de acuerdo con la disponibilidad y las condiciones acordadas con cada cliente.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">3. Privacidad y Confidencialidad</h2>
            <p>Toda la información compartida por los usuarios a través de nuestro sitio web y durante las consultas será tratada con estricta confidencialidad, de acuerdo con nuestra Política de Privacidad y las leyes aplicables de protección de datos.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">4. Uso del Sitio Web</h2>
            <p>El usuario se compromete a utilizar el sitio web de manera responsable y para fines legítimos. Queda prohibido cualquier uso que pueda dañar, sobrecargar o perjudicar el funcionamiento del sitio.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">5. Propiedad Intelectual</h2>
            <p>Todo el contenido presente en este sitio web, incluyendo textos, imágenes, logotipos y materiales, es propiedad de Psicología & Bienestar, a menos que se indique lo contrario. Queda prohibida su reproducción sin autorización.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">6. Limitación de Responsabilidad</h2>
            <p>Psicología & Bienestar no se hace responsable por daños directos o indirectos derivados del uso de la información proporcionada en este sitio. Los servicios profesionales se brindan bajo condiciones específicas acordadas con cada cliente.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">7. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página y entrarán en vigencia inmediatamente después de su publicación.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">8. Contacto</h2>
            <p>Para consultas sobre estos términos, puede contactarnos a través de:</p>
            <ul class="list-disc pl-6 mt-2">
              <li>Correo: serviciospsicobienestar&#64;gmail.com</li>
              <li>Teléfono: +57 317 500 5472</li>
            </ul>
          </section>
        </div>

        <div class="mt-10">
          <a routerLink="/inicio" class="inline-flex items-center text-primary hover:text-accent transition-colors font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  `,
})
export class TerminosComponent {}
