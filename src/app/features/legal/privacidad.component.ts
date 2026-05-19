import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pt-24 pb-20 px-4">
      <div class="container mx-auto max-w-4xl">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Política de Privacidad</h1>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mb-8 rounded-full"></div>

        <div class="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">1. Información que Recopilamos</h2>
            <p>Recopilamos información personal que usted nos proporciona voluntariamente a través de nuestros formularios de contacto, incluyendo: nombre, correo electrónico, número de teléfono y mensajes. También podemos recopilar información de uso del sitio web mediante cookies y tecnologías similares.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">2. Uso de la Información</h2>
            <p>La información recopilada se utiliza para:</p>
            <ul class="list-disc pl-6 mt-2">
              <li>Responder a sus consultas y solicitudes</li>
              <li>Proporcionar los servicios solicitados</li>
              <li>Mejorar nuestro sitio web y servicios</li>
              <li>Enviar comunicaciones relacionadas con nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">3. Protección de Datos</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, pérdida o alteración. Los datos se almacenan de forma segura y solo son accesibles por personal autorizado.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">4. Compartición de Datos</h2>
            <p>No compartimos información personal con terceros, excepto cuando sea necesario para proporcionar nuestros servicios o cuando la ley lo requiera. Sus datos no serán vendidos, intercambiados ni transferidos sin su consentimiento.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">5. Sus Derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul class="list-disc pl-6 mt-2">
              <li>Acceder a sus datos personales</li>
              <li>Solicitar la rectificación de datos inexactos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Oponerse al procesamiento de sus datos</li>
              <li>Solicitar la portabilidad de sus datos</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">6. Retención de Datos</h2>
            <p>Conservamos sus datos personales solo durante el tiempo necesario para cumplir con los fines para los que fueron recopilados, o según lo requieran las leyes aplicables.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-800 mb-3">7. Contacto</h2>
            <p>Para ejercer sus derechos o realizar consultas sobre esta política, contáctenos:</p>
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
export class PrivacidadComponent {}
