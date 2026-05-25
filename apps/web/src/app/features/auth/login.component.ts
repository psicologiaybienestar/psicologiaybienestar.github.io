import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full">
        <div class="text-center mb-8">
          <img src="assets/img/logo.png" alt="Logo" class="h-16 w-auto mx-auto mb-4" />
          <h1 class="text-2xl font-bold text-gray-800">Administración</h1>
          <p class="text-gray-500">Panel de Gestión</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <input formControlName="email" type="email" placeholder="Correo electrónico"
              class="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
          </div>
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <input formControlName="password" type="password" placeholder="Contraseña"
              class="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none" />
          </div>

          @if (error) {
            <p class="text-red-500 text-sm text-center">{{ error }}</p>
          }

          <button type="submit" [disabled]="loginForm.invalid || loading"
            class="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3.5 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50">
            @if (loading) {
              <span class="flex items-center justify-center space-x-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <span>Ingresando...</span>
              </span>
            } @else {
              <span>Entrar</span>
            }
          </button>
        </form>

        <div class="mt-6 text-center">
          <a routerLink="/inicio" class="text-gray-500 hover:text-primary transition-colors text-sm">Volver al inicio</a>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      await this.auth.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      this.router.navigate(['/admin/dashboard']);
    } catch {
      this.error = 'Credenciales incorrectas';
    } finally {
      this.loading = false;
    }
  }
}
