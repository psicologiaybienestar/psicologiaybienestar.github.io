import { Component, OnInit, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '@shared/services/agenda.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [IonicModule, DatePipe, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="gradient-primary">
        <ion-title>Agenda</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="section">
        <h2 class="section-title">Solicitar cita</h2>
        <p class="page-intro">Déjanos tus datos y te contactaremos para confirmar</p>

        @if (mensajeExito) {
          <div class="glass-card success-message">
            <ion-icon name="checkmark-circle" color="success" />
            <p>{{ mensajeExito }}</p>
          </div>
        }

        <div class="glass-card-strong form-card">
          <ion-list>
            <ion-item>
              <ion-input [(ngModel)]="formData.user_name" label="Nombre" labelPlacement="stacked"
                         placeholder="Tu nombre completo" fill="outline" />
            </ion-item>
            <ion-item>
              <ion-input type="email" [(ngModel)]="formData.email" label="Email" labelPlacement="stacked"
                         placeholder="tu@email.com" fill="outline" />
            </ion-item>
            <ion-item>
              <ion-input type="tel" [(ngModel)]="formData.phone" label="Teléfono" labelPlacement="stacked"
                         placeholder="+57 300 000 0000" fill="outline" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Fecha deseada</ion-label>
              <ion-datetime presentation="date" [(ngModel)]="formData.requested_date" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Hora preferida</ion-label>
              <ion-datetime presentation="time" [(ngModel)]="formData.requested_time" hourCycle="h24" />
            </ion-item>
            <ion-item>
              <ion-textarea [(ngModel)]="formData.message" label="Mensaje" labelPlacement="stacked"
                            placeholder="Breve descripción del motivo..." rows="3" fill="outline" />
            </ion-item>
          </ion-list>

          <ion-button expand="block" (click)="solicitar()" [disabled]="enviando" class="ion-margin-top">
            @if (enviando) {
              <ion-spinner slot="start" />
              Enviando...
            } @else {
              Solicitar cita
            }
          </ion-button>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Mis citas</h2>

        @if (misCitas.length === 0) {
          <div class="glass-card empty">
            <p>No tienes citas agendadas</p>
          </div>
        }

        @for (cita of misCitas; track cita.id) {
          <div class="glass-card cita-card">
            <div class="cita-top">
              <div class="cita-icon">
                <ion-icon name="calendar" />
              </div>
              <div class="cita-info">
                <h3>{{ cita.user_name }}</h3>
                <p class="cita-date">{{ cita.requested_date | date:'dd/MM/yyyy' }}{{ cita.requested_time ? ' - ' + cita.requested_time : '' }}</p>
              </div>
              <ion-badge [color]="badgeColor(cita.status)" class="cita-badge">{{ cita.status }}</ion-badge>
            </div>
            @if (cita.message) {
              <p class="cita-msg">{{ cita.message }}</p>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .section { margin-bottom: var(--pg-space-xl); }

    .success-message { display: flex; align-items: flex-start; gap: var(--pg-space-sm); padding: var(--pg-space-md); margin-bottom: var(--pg-space-lg); }
    .success-message ion-icon { font-size: 22px; flex-shrink: 0; margin-top: 1px; }
    .success-message p { font-size: 14px; color: var(--ion-color-success); margin: 0; }

    .form-card { padding: var(--pg-space-sm); }
    .form-card ion-item { --padding-start: var(--pg-space-sm); --padding-end: var(--pg-space-sm); --inner-padding-end: 0; --background: transparent; }

    .empty { text-align: center; padding: var(--pg-space-xl); color: var(--ion-color-medium); font-size: 14px; }

    .cita-card { padding: var(--pg-space-md); margin-bottom: var(--pg-space-sm); }
    .cita-top { display: flex; align-items: center; gap: var(--pg-space-md); }
    .cita-icon { width: 40px; height: 40px; border-radius: var(--pg-radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: color-mix(in srgb, var(--ion-color-primary) 10%, white); }
    .cita-icon ion-icon { font-size: 20px; color: var(--ion-color-primary); }
    .cita-info { flex: 1; min-width: 0; }
    .cita-info h3 { font-size: 15px; font-weight: 600; margin: 0 0 2px; color: var(--ion-text-color); }
    .cita-date { font-size: 12px; color: var(--ion-color-medium); margin: 0; }
    .cita-badge { font-size: 11px; font-weight: 600; text-transform: capitalize; flex-shrink: 0; }
    .cita-msg { font-size: 13px; color: var(--ion-color-medium); margin: var(--pg-space-sm) 0 0; line-height: 1.4; }

    ion-toolbar.gradient-primary { --background: transparent; }
  `,
})
export class AgendaComponent implements OnInit {
  private agendaService = inject(AgendaService);

  formData: any = {
    user_name: '',
    email: '',
    phone: '',
    requested_date: new Date().toISOString(),
    requested_time: '',
    message: '',
  };
  enviando = false;
  mensajeExito = '';
  misCitas: any[] = [];

  ngOnInit() {
    this.cargarCitas();
  }

  async solicitar() {
    if (!this.formData.user_name || !this.formData.email) return;
    this.enviando = true;
    try {
      const result = await this.agendaService.requestAppointment({
        user_name: this.formData.user_name!,
        email: this.formData.email!,
        phone: this.formData.phone || undefined,
        requested_date: this.formData.requested_date || new Date().toISOString(),
        requested_time: this.formData.requested_time || '',
        message: this.formData.message || undefined,
        consent: true,
      });
      if (result.success) {
        this.mensajeExito = 'Cita solicitada con éxito. Te contactaremos pronto.';
        this.formData = { user_name: '', email: '', phone: '', requested_date: new Date().toISOString(), requested_time: '', message: '' };
        this.cargarCitas();
      }
    } catch { /* ignore */ }
    this.enviando = false;
  }

  private async cargarCitas() {
    try {
      this.misCitas = await this.agendaService.getMyAppointments(this.formData.email || '');
    } catch { /* ignore */ }
  }

  badgeColor(status: string): string {
    switch (status) {
      case 'pendiente': return 'warning';
      case 'confirmada': return 'success';
      case 'completada': return 'tertiary';
      case 'cancelada': return 'danger';
      default: return 'medium';
    }
  }
}
