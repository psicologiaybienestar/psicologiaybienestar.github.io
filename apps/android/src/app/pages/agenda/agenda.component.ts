import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '@shared/services/agenda.service';

const EMOTION_EMOJI_MAP: Record<string, string> = {
  feliz: '😊',
  tranquilo: '😌',
  ansioso: '😰',
  triste: '😢',
  estresado: '😩',
  motivado: '💪',
};

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page">
        <section class="hero-section">
          <div class="hero-bg"></div>
          <div class="hero-content">
            <ion-icon name="calendar" class="hero-icon"></ion-icon>
            <h1 class="hero-title">Tu Agenda</h1>
            <p class="hero-subtitle">Solicita una cita y te contactaremos para confirmar tu espacio.</p>
          </div>
        </section>

        <section class="section">
          @if (mensajeExito) {
            <div class="alert alert-success">
              <ion-icon name="checkmark-done-circle"></ion-icon>
              <p>{{ mensajeExito }}</p>
            </div>
          }

          <h2 class="section-title">Solicitar nueva cita</h2>

          <div class="card card-form">
            <div class="form-group">
              <label>Tus datos</label>
              <div class="input-row">
                <ion-icon name="person-outline"></ion-icon>
                <input [(ngModel)]="formData.user_name" placeholder="Nombre completo" />
              </div>
              <div class="input-row">
                <ion-icon name="mail-outline"></ion-icon>
                <input type="email" [(ngModel)]="formData.email" (change)="cargarCitas()" placeholder="Email" />
              </div>
              <div class="input-row">
                <ion-icon name="phone-portrait-outline"></ion-icon>
                <input type="tel" [(ngModel)]="formData.phone" placeholder="Telefono/WhatsApp" />
              </div>
            </div>

            <div class="form-group">
              <label>Fecha y hora deseada</label>
              <div class="datetime-row">
                <div class="dt-box">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <input type="date" class="native-dt" [(ngModel)]="formData.requested_date" />
                </div>
                <div class="dt-box">
                  <ion-icon name="time-outline"></ion-icon>
                  <input type="time" class="native-dt" [(ngModel)]="formData.requested_time" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Como te sientes hoy?</label>
              <div class="emotion-selector">
                @for (emotion of emotionalStates; track emotion.value) {
                  <button type="button" class="emotion-option"
                          [class.active]="formData.emotional_state === emotion.value"
                          [style.--emotion-color]="emotion.color"
                          (click)="formData.emotional_state = emotion.value">
                    <span class="emotion-emoji">{{ emotion.emoji }}</span>
                    <span>{{ emotion.label }}</span>
                  </button>
                }
              </div>
            </div>

            <div class="form-group">
              <label>Mensaje adicional</label>
              <textarea [(ngModel)]="formData.message" placeholder="Quieres decirnos algo mas?" rows="3"></textarea>
            </div>

            <button class="btn-primary btn-full" (click)="solicitar()" [disabled]="enviando">
              @if (enviando) { <ion-spinner name="crescent"></ion-spinner> }
              @else { Enviar solicitud }
            </button>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Mis citas</h2>
            @if (misCitas.length > 0) {
              <span class="count">{{ misCitas.length }}</span>
            }
          </div>

          <div class="lookup-row">
            <ion-icon name="search-outline"></ion-icon>
            <input type="email" [(ngModel)]="formData.email" placeholder="Correo para consultar tus citas" (keyup.enter)="cargarCitas()" />
            <button type="button" (click)="cargarCitas()" [disabled]="cargandoCitas">
              @if (cargandoCitas) { <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner> }
              @else { Ver }
            </button>
          </div>

          @if (cargandoCitas) {
            <div class="loading-state">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Buscando tus citas...</p>
            </div>
          } @else if (errorCitas && misCitas.length === 0) {
            <div class="empty-state">
              <ion-icon name="calendar-outline"></ion-icon>
              <p>{{ errorCitas }}</p>
              <span class="empty-hint">Ingresa el correo que usaste al solicitar tu cita y presiona Ver.</span>
            </div>
          } @else if (misCitas.length === 0) {
            <div class="empty-state">
              <ion-icon name="calendar-outline"></ion-icon>
              <p>Ingresa tu correo para ver tus citas</p>
              <span class="empty-hint">Usa el mismo correo con el que solicitaste tu cita.</span>
            </div>
          }

          <div class="appointments-timeline">
            @for (cita of misCitas; track cita.id) {
              <div class="timeline-entry" [style.--status-color]="badgeColor(cita.status)">
                <div class="timeline-rail">
                  <span class="timeline-dot" [style.background]="badgeColor(cita.status)"></span>
                </div>
                <div class="card card-cita">
                  <div class="cita-header">
                  <div class="cita-date-pill">
                    <span class="day">{{ cita.requested_date | date:'dd' }}</span>
                    <span class="month">{{ cita.requested_date | date:'MMM' }}</span>
                  </div>
                  <div class="cita-info">
                    <h3>{{ cita.user_name }}</h3>
                    <span class="status-badge" [style.background]="badgeBg(cita.status)" [style.color]="badgeColor(cita.status)">
                      <ion-icon [name]="statusIcon(cita.status)"></ion-icon>
                      {{ statusLabel(cita.status) }}
                    </span>
                  </div>
                </div>
                <div class="cita-meta-grid">
                  <span><ion-icon name="time-outline"></ion-icon> {{ cita.requested_time || 'Por confirmar' }}</span>
                  @if (cita.emotional_state) {
                    <span><span class="inline-emoji">{{ emotionEmoji(cita.emotional_state) }}</span> {{ emotionLabel(cita.emotional_state) }}</span>
                  }
                  @if (cita.created_at) {
                    <span><ion-icon name="document-text-outline"></ion-icon> Solicitada {{ cita.created_at | date:'dd MMM' }}</span>
                  }
                </div>
                <div class="status-helper">{{ statusDescription(cita.status) }}</div>
                @if (cita.message) {
                  <div class="cita-note">{{ cita.message }}</div>
                }
                  </div>
              </div>
            }
          </div>
        </section>

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page { background: #ffffff; min-height: 100%; }
    .hero-section { position: relative; padding: 28px 20px 8px; overflow: hidden; text-align: center; }
    .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%); opacity: 0.06; pointer-events: none; }
    .hero-content { position: relative; }
    .hero-icon { font-size: 48px; color: var(--ion-color-primary); display: block; margin: 0 auto 8px; }
    .hero-title { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0 0 4px; }
    .hero-subtitle { font-size: 14px; color: #6b7280; max-width: 280px; margin: 0 auto; line-height: 1.5; }
    .section { padding: 4px 20px 22px; }
    .section-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 12px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .section-header .section-title { margin: 0; }
    .count { background: #f3f4f6; color: #6b7280; padding: 2px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; }
    .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .alert { display: flex; align-items: center; gap: 10px; background: #ecfdf5; border: 1px solid rgba(16,185,129,0.2); border-radius: 14px; padding: 14px; margin-bottom: 16px; }
    .alert ion-icon { font-size: 22px; color: #10b981; flex-shrink: 0; }
    .alert p { font-size: 13px; color: #065f46; font-weight: 600; margin: 0; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.03em; }
    .input-row { display: flex; align-items: center; background: white; border: 1px solid #e8e8ee; border-radius: 12px; padding: 0 14px; margin-bottom: 8px; transition: border-color 0.15s ease; }
    .input-row:focus-within { border-color: var(--ion-color-primary); }
    .input-row ion-icon { color: #9ca3af; font-size: 18px; }
    .input-row input { background: none; border: none; padding: 13px 10px; width: 100%; font-size: 14px; color: #1f2937; outline: none; }
    .datetime-row { display: flex; gap: 10px; }
    .dt-box { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; background: white; border: 1px solid #e8e8ee; border-radius: 12px; padding: 12px 10px; transition: border-color 0.15s ease; }
    .dt-box:focus-within { border-color: var(--ion-color-primary); }
    .dt-box ion-icon { font-size: 18px; color: var(--ion-color-primary); }
    .native-dt { background: none; border: none; font-size: 14px; color: #1f2937; text-align: center; width: 100%; outline: none; padding: 4px 0; }
    .form-group textarea { width: 100%; background: white; border: 1px solid #e8e8ee; border-radius: 12px; padding: 12px; font-size: 14px; color: #1f2937; outline: none; transition: border-color 0.15s ease; }
    .form-group textarea:focus { border-color: var(--ion-color-primary); }
    .emotion-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .emotion-option { min-height: 76px; border: 1px solid #e8e8ee; border-radius: 14px; background: white; color: #6b7280; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 11px; font-weight: 700; transition: all 0.15s ease; }
    .emotion-emoji { font-size: 23px; line-height: 1; }
    .emotion-option.active { border-color: var(--emotion-color); background: color-mix(in srgb, var(--emotion-color) 10%, white); color: #1f2937; box-shadow: 0 8px 18px color-mix(in srgb, var(--emotion-color) 14%, transparent); }
    .emotion-option:active { transform: scale(0.96); }
    .btn-primary { background: var(--ion-color-primary); color: white; border: none; padding: 15px; border-radius: 12px; font-weight: 700; font-size: 15px; }
    .btn-full { width: 100%; }
    .lookup-row { display: flex; align-items: center; gap: 8px; background: #f9fafb; border: 1px solid rgba(0,0,0,0.04); border-radius: 14px; padding: 8px 12px; margin-bottom: 14px; }
    .lookup-row ion-icon { color: #9ca3af; font-size: 18px; }
    .lookup-row input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font-size: 14px; color: #1f2937; }
    .lookup-row button { border: none; border-radius: 10px; background: #eef2ff; color: var(--ion-color-primary); font-size: 12px; font-weight: 800; padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; min-width: 54px; min-height: 38px; }
    .lookup-row button:disabled { opacity: 0.6; cursor: default; }
    .empty-state { text-align: center; padding: 32px 24px; }
    .empty-state ion-icon { font-size: 40px; margin-bottom: 10px; color: #d1d5db; }
    .empty-state p { font-size: 14px; color: #9ca3af; margin: 0 0 8px; }
    .empty-hint { font-size: 12px; color: #cbd5e1; display: block; }
    .loading-state { text-align: center; padding: 32px 24px; }
    .loading-state ion-icon, .loading-state ion-spinner { font-size: 28px; color: var(--ion-color-primary); margin-bottom: 8px; }
    .loading-state p { font-size: 13px; color: #9ca3af; margin: 0; }
    .appointments-timeline { display: flex; flex-direction: column; gap: 0; }
    .timeline-entry { position: relative; display: grid; grid-template-columns: 18px 1fr; gap: 10px; }
    .timeline-rail { position: relative; display: flex; justify-content: center; }
    .timeline-rail::before { content: ''; position: absolute; top: 18px; bottom: -12px; width: 2px; border-radius: 99px; background: #edf0f5; }
    .timeline-entry:last-child .timeline-rail::before { display: none; }
    .timeline-dot { width: 12px; height: 12px; margin-top: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-color, #627eff) 16%, transparent); z-index: 1; }
    .card-cita { border-left: 4px solid var(--status-color); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .cita-header { display: flex; align-items: center; gap: 12px; }
    .cita-date-pill { width: 46px; height: 46px; background: white; border: 1px solid rgba(0,0,0,0.04); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
    .cita-date-pill .day { font-size: 16px; font-weight: 800; color: #1f2937; line-height: 1; }
    .cita-date-pill .month { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.02em; }
    .cita-info { flex: 1; }
    .cita-info h3 { font-size: 15px; font-weight: 700; color: #1f2937; margin: 0; }
    .status-badge { width: fit-content; display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.02em; }
    .status-badge ion-icon { font-size: 11px; }
    .cita-meta-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 14px; }
    .cita-meta-grid span { font-size: 12px; color: #6b7280; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .inline-emoji { font-size: 14px; line-height: 1; }
    .cita-meta-grid ion-icon { color: #9ca3af; font-size: 15px; }
    .status-helper { margin-top: 12px; padding: 10px 12px; border-radius: 10px; background: #f9fafb; color: #6b7280; font-size: 12px; line-height: 1.5; }
    .cita-note { margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 10px; font-size: 12px; color: #6b7280; line-height: 1.5; }
    .bottom-spacer { height: 80px; height: calc(80px + env(safe-area-inset-bottom, 0px)); }
  `],
})
export class AgendaComponent implements OnInit {
  private agendaService = inject(AgendaService);

  formData: any = {
    user_name: '',
    email: '',
    phone: '',
    requested_date: new Date().toISOString().slice(0, 10),
    requested_time: '',
    emotional_state: '',
    message: '',
  };
  enviando = false;
  cargandoCitas = false;
  errorCitas = '';
  mensajeExito = '';
  misCitas: any[] = [];
  emotionalStates = [
    { value: 'feliz', label: 'Feliz', emoji: '😊', color: '#10b981' },
    { value: 'tranquilo', label: 'Tranquilo/a', emoji: '😌', color: '#22c55e' },
    { value: 'ansioso', label: 'Ansioso/a', emoji: '😰', color: '#f59e0b' },
    { value: 'triste', label: 'Triste', emoji: '😢', color: '#60a5fa' },
    { value: 'estresado', label: 'Estrés', emoji: '😩', color: '#ef4444' },
    { value: 'motivado', label: 'Motivado/a', emoji: '💪', color: '#627eff' },
  ];

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
        emotional_state: this.formData.emotional_state || undefined,
        message: this.formData.message || undefined,
        consent: true,
      });
      if (result.success) {
        this.mensajeExito = 'Cita solicitada con exito. Te contactaremos pronto.';
        this.formData = { user_name: '', email: '', phone: '', requested_date: new Date().toISOString().slice(0, 10), requested_time: '', emotional_state: '', message: '' };
        this.cargarCitas();
      }
    } catch { }
    this.enviando = false;
  }

  async cargarCitas() {
    this.cargandoCitas = true;
    this.errorCitas = '';
    try {
      const email = this.formData?.email?.trim();
      if (!email) {
        this.misCitas = [];
        this.cargandoCitas = false;
        return;
      }
      this.misCitas = await this.agendaService.getMyAppointments(email);
      if (this.misCitas.length === 0) {
        this.errorCitas = 'No encontramos citas para este correo.';
      }
    } catch {
      this.errorCitas = 'Error al consultar tus citas. Intenta de nuevo.';
    } finally {
      this.cargandoCitas = false;
    }
  }

  badgeColor(status: string): string {
    switch (status) {
      case 'pendiente': return '#f59e0b';
      case 'confirmada': return '#10b981';
      case 'reagendada': return '#8b5cf6';
      case 'completada': return '#60a5fa';
      case 'cancelada': return '#ef4444';
      default: return '#9ca3af';
    }
  }

  badgeBg(status: string): string {
    switch (status) {
      case 'pendiente': return '#fef3c7';
      case 'confirmada': return '#ecfdf5';
      case 'reagendada': return '#f3e8ff';
      case 'completada': return '#eff6ff';
      case 'cancelada': return '#fef2f2';
      default: return '#f3f4f6';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'pendiente': return 'hourglass-outline';
      case 'confirmada': return 'checkmark-circle-outline';
      case 'reagendada': return 'swap-horizontal-outline';
      case 'completada': return 'ribbon-outline';
      case 'cancelada': return 'close-circle-outline';
      default: return 'ellipse-outline';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'reagendada': return 'Reagendada';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return status || 'Pendiente';
    }
  }

  statusDescription(status: string): string {
    switch (status) {
      case 'pendiente': return 'Recibimos tu solicitud. Pronto confirmaremos disponibilidad.';
      case 'confirmada': return 'Tu cita esta confirmada. Te esperamos en el horario indicado.';
      case 'reagendada': return 'La cita fue ajustada. Revisa la nueva fecha y hora.';
      case 'completada': return 'Esta cita ya fue atendida y queda en tu historial.';
      case 'cancelada': return 'Esta solicitud fue cancelada.';
      default: return 'Estado de seguimiento disponible en tu historial.';
    }
  }

  emotionEmoji(value: string): string {
    return EMOTION_EMOJI_MAP[value] || '🫶';
  }

  emotionLabel(value: string): string {
    return this.emotionalStates.find(e => e.value === value)?.label || value;
  }
}
