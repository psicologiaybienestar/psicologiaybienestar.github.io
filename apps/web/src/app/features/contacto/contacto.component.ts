import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="pt-24 pb-20 px-4 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div class="container mx-auto max-w-2xl relative z-10">
        <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Contáctanos</h2>
        <div class="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-10 rounded-full"></div>
        <div class="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-8 md:p-10">
          <p class="text-gray-600 text-center mb-8 text-lg">Déjanos tus datos y te contactaremos a la brevedad.</p>
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <input formControlName="nombre" type="text" placeholder="Nombre completo" required
              class="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-gray-700" />
            <input formControlName="email" type="email" placeholder="Correo electrónico" required
              class="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-gray-700" />
            <input formControlName="telefono" type="tel" placeholder="Teléfono (opcional)"
              class="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-gray-700" />
            <textarea formControlName="mensaje" rows="5" placeholder="Escribe tu mensaje..." required
              class="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-gray-700 resize-none"></textarea>
            <button type="submit" [disabled]="contactForm.invalid || submitting"
              class="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 rounded-xl hover:scale-[1.02] hover:shadow-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
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
            <div class="mt-6 p-4 bg-green-100 text-green-800 rounded-xl text-center font-semibold">{{ successMessage }}</div>
          }
          @if (errorMessage) {
            <div class="mt-6 p-4 bg-red-100 text-red-800 rounded-xl text-center font-semibold">{{ errorMessage }}</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ContactoComponent {
  contactForm: FormGroup;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      mensaje: ['', Validators.required],
    });
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
}
