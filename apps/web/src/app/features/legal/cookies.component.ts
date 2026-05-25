import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-4xl">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Política de Cookies</h1>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mb-8 rounded-full"></div>

        <div class="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">1. ¿Qué son las Cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y proporcionar información a los propietarios del sitio.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">2. Tipos de Cookies que Utilizamos</h2>
            <ul class="list-disc pl-6 mt-2">
              <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio web.</li>
              <li><strong>Cookies de rendimiento:</strong> Nos ayudan a entender cómo los usuarios interactúan con el sitio.</li>
              <li><strong>Cookies de funcionalidad:</strong> Permiten recordar sus preferencias y elecciones.</li>
              <li><strong>Cookies de terceros:</strong> Pueden ser colocadas por servicios externos como Google Analytics o redes sociales.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">3. Cómo Utilizamos las Cookies</h2>
            <p>Utilizamos cookies para:</p>
            <ul class="list-disc pl-6 mt-2">
              <li>Mejorar la experiencia de navegación</li>
              <li>Analizar el tráfico del sitio web</li>
              <li>Recordar sus preferencias</li>
              <li>Proporcionar contenido relevante</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">4. Control de Cookies</h2>
            <p>Puede controlar y/o eliminar cookies según desee. Puede eliminar todas las cookies almacenadas en su dispositivo y configurar la mayoría de los navegadores para que no las acepten. Sin embargo, si lo hace, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite el sitio.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">5. Cookies de Terceros</h2>
            <p>Este sitio web puede utilizar servicios de terceros que también pueden establecer cookies. No tenemos control sobre estas cookies. Los servicios de terceros que utilizamos incluyen:</p>
            <ul class="list-disc pl-6 mt-2">
              <li>Google Analytics (análisis de tráfico)</li>
              <li>Formspree (formulario de contacto)</li>
              <li>Supabase (almacenamiento de datos)</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">6. Actualizaciones</h2>
            <p>Podemos actualizar esta política de cookies periódicamente. Le recomendamos revisar esta página regularmente para estar informado sobre cualquier cambio.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">7. Contacto</h2>
            <p>Para más información sobre nuestras políticas de cookies, contáctenos:</p>
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
export class CookiesComponent {}
