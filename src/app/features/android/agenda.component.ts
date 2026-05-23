import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgendaService } from '../../core/services/agenda.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
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
            <div class="week-day" [class.week-day-active]="i === 0">
              <span class="week-day-label">{{ day.label }}</span>
              <span class="week-day-num">{{ day.date.getDate() }}</span>
            </div>
          }
        </div>
      </section>

      <div class="coming-soon-card">
        <div class="soon-badge">
          <span class="soon-badge-dot"></span>
          Próximamente
        </div>

        <div class="soon-icon">🚀</div>
        <h2 class="soon-title">Estamos trabajando en esto</h2>
        <p class="soon-text">
          Pronto podrás solicitar citas, agendar acompañamiento y recibir recordatorios personalizados
          directamente desde esta sección.
        </p>

        <div class="features-preview">
          <div class="feature-item">
            <span class="feature-icon">📋</span>
            <div>
              <h3 class="feature-title">Solicitud de citas</h3>
              <p class="feature-desc">Agenda tu espacio de atención psicológica</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💬</span>
            <div>
              <h3 class="feature-title">Acompañamiento</h3>
              <p class="feature-desc">Mensajes y seguimiento emocional</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔔</span>
            <div>
              <h3 class="feature-title">Recordatorios</h3>
              <p class="feature-desc">Notificaciones de tus actividades y citas</p>
            </div>
          </div>
        </div>

        <!-- Placeholder de formulario deshabilitado -->
        <div class="disabled-form">
          <div class="disabled-form-header">
            <span class="disabled-form-icon">📝</span>
            <span>Solicitar cita</span>
          </div>
          <div class="disabled-form-body">
            <p>Selecciona un día y horario para tu acompañamiento</p>
            <div class="disabled-input">Seleccionar fecha</div>
            <div class="disabled-input">Seleccionar hora</div>
            <div class="disabled-badge">En desarrollo</div>
          </div>
        </div>

        <div class="soon-footer">
          <p>Mientras tanto, puedes contactarnos por WhatsApp o a través del formulario de contacto.</p>
          <div class="soon-actions">
            <a href="https://wa.me/573164603881?text=Hola%2C%20quiero%20agendar%20una%20cita" target="_blank" rel="noopener noreferrer" class="action-btn whatsapp">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a routerLink="/contacto" class="action-btn contact">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Contacto
            </a>
          </div>
        </div>
      </div>

      <div class="bottom-spacer"></div>
    </div>
  `,
  styles: [`
    .agenda-page {
      background: #ffffff;
      min-height: 100vh;
    }

    .hero-section {
      position: relative;
      padding: 32px 20px 16px;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #627eff 0%, #53c6e4 50%, #66a6da 100%);
      opacity: 0.06;
    }
    .hero-content {
      position: relative;
      text-align: center;
    }
    .hero-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }
    .hero-title {
      font-size: 26px;
      font-weight: 800;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .hero-subtitle {
      font-size: 14px;
      color: #6b7280;
      max-width: 280px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .coming-soon-card {
      margin: 8px 20px 20px;
      background: #ffffff;
      border: 1px solid #F3F4F6;
      border-radius: 24px;
      padding: 28px 20px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
    }

    .soon-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #EEF2FF;
      color: #627eff;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 20px;
    }
    .soon-badge-dot {
      width: 6px;
      height: 6px;
      background: #627eff;
      border-radius: 50%;
      animation: pulse-dot 1.5s infinite;
    }

    .soon-icon {
      font-size: 64px;
      margin-bottom: 12px;
    }
    .soon-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .soon-text {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .features-preview {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
      text-align: left;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      background: #F9FAFB;
      border-radius: 14px;
    }
    .feature-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    .feature-title {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .feature-desc {
      font-size: 12px;
      color: #9ca3af;
    }

    .soon-footer {
      border-top: 1px solid #F3F4F6;
      padding-top: 20px;
    }
    .soon-footer p {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 16px;
    }
    .soon-actions {
      display: flex;
      gap: 10px;
    }
    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 16px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .action-btn:active {
      transform: scale(0.96);
    }
    .whatsapp {
      background: #25D366;
      color: #ffffff;
    }
    .contact {
      background: #EEF2FF;
      color: #627eff;
    }

    .bottom-spacer {
      height: 80px;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .section {
      padding: 8px 20px 12px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 10px;
    }

    /* Week selector */
    .week-days {
      display: flex;
      gap: 6px;
    }
    .week-day {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 4px;
      border-radius: 14px;
      background: #F9FAFB;
      cursor: default;
    }
    .week-day-active {
      background: #EEF2FF;
      border: 1px solid #C7D2FE;
    }
    .week-day-label {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
    }
    .week-day-num {
      font-size: 16px;
      font-weight: 800;
      color: #1f2937;
    }
    .week-day-active .week-day-num {
      color: #627eff;
    }

    /* Disabled form */
    .disabled-form {
      margin-bottom: 20px;
      background: #F9FAFB;
      border: 1px dashed #D1D5DB;
      border-radius: 16px;
      overflow: hidden;
      text-align: left;
    }
    .disabled-form-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #F3F4F6;
      font-size: 14px;
      font-weight: 700;
      color: #9ca3af;
    }
    .disabled-form-icon {
      font-size: 18px;
    }
    .disabled-form-body {
      padding: 16px;
    }
    .disabled-form-body p {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 12px;
    }
    .disabled-input {
      background: #ffffff;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 14px;
      color: #d1d5db;
      margin-bottom: 8px;
    }
    .disabled-badge {
      display: inline-block;
      background: #FEF3C7;
      color: #92400E;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      margin-top: 4px;
    }

      `],
  imports: [RouterLink]
})
export class AgendaComponent implements OnInit {
  weekDays: { label: string; date: Date }[] = [];

  constructor(private agendaService: AgendaService) {}

  ngOnInit() {
    this.weekDays = this.agendaService.getWeekDays();
  }
}
