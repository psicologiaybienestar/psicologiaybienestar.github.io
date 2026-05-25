import { Component, OnInit } from '@angular/core';
import { AgendaService } from '../../core/services/agenda.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="agenda-page">
      <div class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="hero-icon">📅</div>
          <h1 class="hero-title">Agenda</h1>
          <p class="hero-subtitle">Tu espacio para solicitar citas y acompañamiento</p>
        </div>
      </div>

      <!-- Selector de semana -->
      <section class="section">
        <h2 class="section-title">Esta semana</h2>
        <div class="week-days">
          @for (day of weekDays; track day.date.toDateString(); let i = $index) {
            <div class="week-day"
              [class.week-day-active]="selectedDate && day.date.toDateString() === selectedDate.toDateString()"
              (click)="selectDay(day.date)">
              <span class="week-day-label">{{ day.label }}</span>
              <span class="week-day-num">{{ day.date.getDate() }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Formulario de solicitud -->
      <section class="section">
        <h2 class="section-title">Solicitar cita</h2>
        <p class="section-subtitle">Completa el formulario y te contactaremos para confirmar</p>

        @if (submitSuccess) {
          <div class="success-card">
            <div class="success-icon">✅</div>
            <h3 class="success-title">Solicitud enviada</h3>
            <p class="success-text">Hemos recibido tu solicitud. Te contactaremos pronto para confirmar la cita.</p>
            <button class="reset-btn" (click)="resetForm()">Nueva solicitud</button>
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()" #appointmentForm="ngForm" class="appointment-form">
            <div class="form-group">
              <label class="form-label">Nombre completo *</label>
              <input
                [(ngModel)]="formData.user_name"
                name="user_name"
                required
                minlength="3"
                #nameField="ngModel"
                type="text"
                class="form-input"
                placeholder="Tu nombre"
              />
              @if (nameField.invalid && nameField.touched) {
                <span class="form-error">Ingresa tu nombre (mín. 3 caracteres)</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Correo electrónico *</label>
              <input
                [(ngModel)]="formData.email"
                name="email"
                required
                email
                #emailField="ngModel"
                type="email"
                class="form-input"
                placeholder="tu@correo.com"
              />
              @if (emailField.invalid && emailField.touched) {
                <span class="form-error">Ingresa un correo válido</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Teléfono (opcional)</label>
              <input
                [(ngModel)]="formData.phone"
                name="phone"
                type="tel"
                class="form-input"
                placeholder="+57 300 123 4567"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Fecha *</label>
                <input
                  [(ngModel)]="formData.requested_date"
                  name="requested_date"
                  required
                  #dateField="ngModel"
                  type="date"
                  class="form-input"
                  [min]="minDate"
                />
                @if (dateField.invalid && dateField.touched) {
                  <span class="form-error">Selecciona una fecha</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Hora *</label>
                <div class="time-grid">
                  @for (slot of timeSlots; track slot) {
                    <button
                      type="button"
                      class="time-chip"
                      [class.time-chip-active]="formData.requested_time === slot"
                      (click)="formData.requested_time = slot"
                    >
                      {{ slot }}
                    </button>
                  }
                </div>
                @if (!formData.requested_time && horaTouched) {
                  <span class="form-error">Selecciona una hora</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">¿Cómo te sientes hoy?</label>
              <div class="emotion-select">
                <select [(ngModel)]="formData.emotional_state" name="emotional_state" class="form-input">
                  @for (emotion of emotionalStates; track emotion.value) {
                    <option [value]="emotion.value">{{ emotion.icon }} {{ emotion.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Mensaje o motivo</label>
              <textarea
                [(ngModel)]="formData.message"
                name="message"
                class="form-input form-textarea"
                rows="3"
                placeholder="Cuéntanos brevemente el motivo de tu consulta..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="consent-label">
                <input
                  [(ngModel)]="formData.consent"
                  name="consent"
                  type="checkbox"
                  #consentField="ngModel"
                  required
                  class="consent-checkbox"
                />
                <span>Acepto compartir mi información para agendar una cita</span>
              </label>
            </div>

            @if (submitError) {
              <div class="form-error-msg">{{ submitError }}</div>
            }

            <button
              type="submit"
              class="submit-btn"
              [disabled]="appointmentForm.invalid || !formData.consent || !formData.requested_time || submitting"
            >
              @if (submitting) {
                <span class="loader"></span> Enviando...
              } @else {
                ✨ Solicitar cita
              }
            </button>
          </form>
        }
      </section>

      <!-- Contacto WhatsApp -->
      <section class="section">
        <div class="whatsapp-card" (click)="openWhatsApp()">
          <div class="whatsapp-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div class="whatsapp-info">
            <h3 class="whatsapp-title">¿Prefieres contactarnos directo?</h3>
            <p class="whatsapp-text">Escríbenos por WhatsApp y te atenderemos personalmente</p>
          </div>
          <span class="whatsapp-arrow">→</span>
        </div>
      </section>

      <!-- Mis solicitudes -->
      @if (myAppointments.length > 0) {
        <section class="section">
          <h2 class="section-title">Mis solicitudes</h2>
          <div class="appointments-list">
            @for (apt of myAppointments; track apt.id) {
              <div class="appointment-card">
                <div class="apt-header">
                  <span class="apt-status" [class]="'status-' + apt.status">{{ apt.status }}</span>
                  <span class="apt-date">{{ apt.requested_date | date:'dd/MM/yyyy' }} — {{ apt.requested_time }}</span>
                </div>
                @if (apt.message) {
                  <p class="apt-message">{{ apt.message }}</p>
                }
                @if (apt.status === 'pendiente') {
                  <button class="apt-cancel" (click)="cancelAppointment(apt.id!)">Cancelar solicitud</button>
                }
              </div>
            }
          </div>
        </section>
      }

      <div class="bottom-spacer"></div>
    </div>
  `,
  styles: [`
    .agenda-page { background: #ffffff; min-height: 100vh; }

    .hero-section {
      position: relative; padding: 32px 20px 16px; overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%);
      opacity: 0.06;
    }
    .hero-content { position: relative; text-align: center; }
    .hero-icon { font-size: 48px; margin-bottom: 8px; }
    .hero-title { font-size: 26px; font-weight: 800; color: #1f2937; margin-bottom: 4px; }
    .hero-subtitle { font-size: 14px; color: #6b7280; max-width: 280px; margin: 0 auto; line-height: 1.5; }

    .section { padding: 8px 20px 20px; }
    .section-title { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 2px; }
    .section-subtitle { font-size: 13px; color: #9ca3af; margin-bottom: 16px; }

    /* Week selector */
    .week-days { display: flex; gap: 6px; }
    .week-day {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 10px 4px; border-radius: 14px; background: #F9FAFB; cursor: pointer;
      transition: all 0.2s ease;
    }
    .week-day:active { transform: scale(0.95); }
    .week-day-active { background: #EEF2FF; border: 1px solid #C7D2FE; }
    .week-day-label { font-size: 11px; font-weight: 600; color: #6b7280; }
    .week-day-num { font-size: 16px; font-weight: 800; color: #1f2937; }
    .week-day-active .week-day-num { color: #627eff; }

    /* Form */
    .appointment-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-label { font-size: 13px; font-weight: 700; color: #374151; }
    .form-input {
      width: 100%; padding: 12px 14px; border: 1px solid #E5E7EB; border-radius: 12px;
      font-size: 14px; font-family: inherit; outline: none; transition: all 0.2s ease;
      background: #ffffff; box-sizing: border-box;
    }
    .form-input:focus { border-color: #627eff; box-shadow: 0 0 0 3px rgba(98,126,255,0.15); }
    .form-textarea { resize: vertical; min-height: 80px; }
    .form-error { font-size: 11px; color: #EF4444; margin-top: 2px; }
    .form-error-msg {
      background: #FEF2F2; color: #DC2626; padding: 10px 14px; border-radius: 10px; font-size: 13px;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-row .form-group { gap: 4px; }

    /* Time grid */
    .time-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .time-chip {
      padding: 8px 14px; border: 1px solid #E5E7EB; border-radius: 10px;
      background: #ffffff; font-size: 13px; font-weight: 600; color: #374151;
      cursor: pointer; transition: all 0.2s ease; font-family: inherit;
    }
    .time-chip:active { transform: scale(0.95); }
    .time-chip-active {
      background: #627eff; color: #ffffff; border-color: #627eff;
    }

    /* Emotion select */
    .emotion-select select { appearance: auto; }

    /* Consent */
    .consent-label {
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; color: #6b7280; cursor: pointer;
    }
    .consent-checkbox {
      width: 18px; height: 18px; border-radius: 4px; border: 2px solid #D1D5DB;
      accent-color: #627eff; flex-shrink: 0;
    }

    /* Submit */
    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 16px; border-radius: 14px; font-size: 16px; font-weight: 700;
      background: #627eff; color: #ffffff; border: none; cursor: pointer;
      transition: all 0.2s ease; font-family: inherit;
    }
    .submit-btn:active:not(:disabled) { transform: scale(0.97); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .loader {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid #ffffff; border-radius: 50%; animation: spin 0.6s linear infinite;
    }

    /* Success */
    .success-card {
      text-align: center; padding: 32px 20px; background: #F0FDF4;
      border: 1px solid #BBF7D0; border-radius: 20px;
    }
    .success-icon { font-size: 48px; margin-bottom: 12px; }
    .success-title { font-size: 20px; font-weight: 700; color: #166534; margin-bottom: 8px; }
    .success-text { font-size: 14px; color: #15803D; margin-bottom: 20px; line-height: 1.5; }
    .reset-btn {
      padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
      background: #166534; color: #ffffff; border: none; cursor: pointer; font-family: inherit;
    }

    /* WhatsApp card */
    .whatsapp-card {
      display: flex; align-items: center; gap: 14px; padding: 16px;
      background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 16px; cursor: pointer;
      transition: all 0.2s ease;
    }
    .whatsapp-card:active { transform: scale(0.98); }
    .whatsapp-icon { color: #25D366; flex-shrink: 0; }
    .whatsapp-info { flex: 1; }
    .whatsapp-title { font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 2px; }
    .whatsapp-text { font-size: 12px; color: #15803D; }
    .whatsapp-arrow { font-size: 18px; color: #25D366; }

    /* My appointments */
    .appointments-list { display: flex; flex-direction: column; gap: 10px; }
    .appointment-card {
      background: #F9FAFB; border: 1px solid #F3F4F6; border-radius: 14px; padding: 14px;
    }
    .apt-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .apt-status {
      font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
      text-transform: capitalize;
    }
    .status-pendiente { background: #FEF3C7; color: #92400E; }
    .status-confirmada { background: #DCFCE7; color: #166534; }
    .status-completada { background: #DBEAFE; color: #1E40AF; }
    .status-cancelada { background: #FEE2E2; color: #991B1B; }
    .status-reagendada { background: #FEF3C7; color: #92400E; }
    .apt-date { font-size: 12px; color: #6b7280; }
    .apt-message { font-size: 13px; color: #374151; margin-bottom: 8px; }
    .apt-cancel {
      font-size: 12px; font-weight: 600; color: #EF4444; background: none; border: none;
      cursor: pointer; padding: 4px 0; font-family: inherit;
    }

    .bottom-spacer { height: 80px; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AgendaComponent implements OnInit {
  weekDays: { label: string; date: Date }[] = [];
  selectedDate: Date | null = null;
  timeSlots: string[] = [];
  emotionalStates: { value: string; label: string; icon: string }[] = [];
  minDate: string = '';

  formData = {
    user_name: '',
    email: '',
    phone: '',
    requested_date: '',
    requested_time: '',
    emotional_state: '',
    message: '',
    consent: false,
  };

  submitting = false;
  submitError = '';
  submitSuccess = false;
  horaTouched = false;
  myAppointments: any[] = [];

  constructor(
    private agendaService: AgendaService,
    private whatsAppService: WhatsAppService,
  ) {}

  ngOnInit() {
    this.weekDays = this.agendaService.getWeekDays();
    this.timeSlots = this.agendaService.getTimeSlots();
    this.emotionalStates = this.agendaService.getEmotionalStates();
    this.minDate = new Date().toISOString().split('T')[0];
    this.formData.requested_date = this.minDate;
    this.loadMyAppointments();
  }

  selectDay(date: Date) {
    this.selectedDate = date;
    this.formData.requested_date = date.toISOString().split('T')[0];
  }

  async onSubmit() {
    if (!this.formData.requested_time) {
      this.horaTouched = true;
      return;
    }

    this.submitting = true;
    this.submitError = '';

    const result = await this.agendaService.requestAppointment(this.formData);
    if (result.success) {
      this.submitSuccess = true;
      this.loadMyAppointments();
    } else {
      this.submitError = result.error || 'Error al enviar la solicitud';
    }
    this.submitting = false;
  }

  resetForm() {
    this.formData = {
      user_name: '',
      email: '',
      phone: '',
      requested_date: this.minDate,
      requested_time: '',
      emotional_state: '',
      message: '',
      consent: false,
    };
    this.submitSuccess = false;
    this.submitError = '';
    this.horaTouched = false;
  }

  async cancelAppointment(id: string) {
    const ok = await this.agendaService.cancelAppointment(id);
    if (ok) this.loadMyAppointments();
  }

  private async loadMyAppointments() {
    const email = this.formData.email || 'loading@placeholder.com';
    if (email.includes('@')) {
      this.myAppointments = await this.agendaService.getMyAppointments(email);
    }
  }

  openWhatsApp() {
    this.whatsAppService.openChat('Hola, quiero agendar una cita');
  }
}
