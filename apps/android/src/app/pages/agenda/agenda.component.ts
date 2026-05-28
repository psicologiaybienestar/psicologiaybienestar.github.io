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

          <div class="card card-form glass-card">
            <button class="btn-primary btn-full btn-large" (click)="mostrarFormulario = !mostrarFormulario">
              <ion-icon [name]="mostrarFormulario ? 'close-outline' : 'add-outline'"></ion-icon> 
              {{ mostrarFormulario ? 'Cancelar' : 'Solicitar nueva cita' }}
            </button>
            
            @if (mostrarFormulario) {
              <div class="form-container">
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
                    <input type="tel" [(ngModel)]="formData.phone" placeholder="Teléfono / WhatsApp" />
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
                  <label>¿Cómo te sientes hoy?</label>
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
                  <textarea [(ngModel)]="formData.message" placeholder="¿Quieres decirnos algo más?" rows="3"></textarea>
                </div>

                <button class="btn-primary btn-full" (click)="solicitar()" [disabled]="enviando">
                  @if (enviando) { <ion-spinner name="crescent"></ion-spinner> }
                  @else { Enviar solicitud }
                </button>
              </div>
            }
          </div>
        </section>

        <section class="section">
          <div class="lookup-row">
            <input type="email" [(ngModel)]="formData.email" placeholder="Correo para consultar citas..." (keyup.enter)="cargarCitas()" />
            <button type="button" (click)="cargarCitas()" [disabled]="cargandoCitas" class="lookup-btn">
              @if (cargandoCitas) { <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner> }
              @else { <ion-icon name="search-outline"></ion-icon> }
            </button>
          </div>

          <div class="tabs-container">
            <div class="tabs-scroll">
              <button class="tab-btn" [class.active]="currentTab === 'todas'" (click)="currentTab = 'todas'">Todas</button>
              <button class="tab-btn" [class.active]="currentTab === 'proximas'" (click)="currentTab = 'proximas'">Próximas</button>
              <button class="tab-btn" [class.active]="currentTab === 'pasadas'" (click)="currentTab = 'pasadas'">Pasadas</button>
              <button class="tab-btn" [class.active]="currentTab === 'canceladas'" (click)="currentTab = 'canceladas'">Canceladas</button>
              <button class="tab-btn" [class.active]="currentTab === 'pospuestas'" (click)="currentTab = 'pospuestas'">Pospuestas</button>
            </div>
          </div>

          @if (cargandoCitas) {
            <div class="loading-state">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Buscando tus citas...</p>
            </div>
          } @else if (errorCitas && filteredCitas.length === 0 && misCitas.length === 0) {
            <div class="empty-state">
              <ion-icon name="calendar-outline"></ion-icon>
              <p>{{ errorCitas }}</p>
              <span class="empty-hint">Ingresa tu correo para ver tus citas.</span>
            </div>
          } @else if (filteredCitas.length === 0) {
            <div class="empty-state">
              <div class="empty-icon-circle"><ion-icon name="calendar-clear-outline"></ion-icon></div>
              <p>No tienes citas {{ currentTab === 'todas' ? 'registradas' : currentTab }}</p>
            </div>
          }

          <div class="appointments-list">
            @for (cita of filteredCitas; track cita.id) {
              <div class="card card-cita" [style.--status-color]="badgeColor(cita.status)">
                <div class="cita-header">
                  <div class="cita-icon" [style.background]="badgeBg(cita.status)" [style.color]="badgeColor(cita.status)">
                    <ion-icon [name]="statusIcon(cita.status)"></ion-icon>
                  </div>
                  <div class="cita-info">
                    <h3>{{ cita.user_name }}</h3>
                    <p>{{ statusLabel(cita.status) }}</p>
                  </div>
                  <span class="status-badge" [style.background]="badgeBg(cita.status)" [style.color]="badgeColor(cita.status)">
                    {{ cita.status }}
                  </span>
                </div>
                
                <div class="cita-body">
                  <div class="cita-detail">
                    <ion-icon name="calendar-outline"></ion-icon> 
                    <span>{{ cita.requested_date | date:'dd MMM yyyy' }}</span>
                  </div>
                  <div class="cita-detail">
                    <ion-icon name="time-outline"></ion-icon> 
                    <span>{{ cita.requested_time || 'Hora por confirmar' }}</span>
                  </div>
                  @if (cita.message) {
                    <div class="cita-note">
                      <ion-icon name="document-text-outline"></ion-icon>
                      <span>{{ cita.message }}</span>
                    </div>
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
    .page { background: #fafafa; min-height: 100%; font-family: var(--pg-font-body); }
    .hero-section { padding: 40px 24px 20px; }
    .hero-title { font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 8px; }
    .hero-subtitle { font-size: 15px; color: #6b7280; max-width: 280px; margin: 0; line-height: 1.5; }
    
    .section { padding: 0 24px 24px; }
    
    .card { background: #ffffff; border-radius: 20px; padding: 16px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); border: 1px solid #f3f4f6; }
    .card-form { padding: 20px; }
    
    .alert { display: flex; align-items: center; gap: 10px; background: #ecfdf5; border: 1px solid rgba(16,185,129,0.2); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
    .alert ion-icon { font-size: 24px; color: #10b981; flex-shrink: 0; }
    .alert p { font-size: 14px; color: #065f46; font-weight: 600; margin: 0; }
    
    .form-container { margin-top: 24px; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.05em; }
    
    .input-row { display: flex; align-items: center; gap: 8px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 0 16px; margin-bottom: 12px; transition: border-color 0.2s ease, background 0.2s ease; }
    .input-row:focus-within { border-color: #627eff; background: white; box-shadow: 0 0 0 3px rgba(98,126,255,0.1); }
    .input-row ion-icon { color: #9ca3af; font-size: 18px; }
    .input-row input { background: none; border: none; padding: 14px 0; width: 100%; font-size: 15px; color: #1f2937; outline: none; }
    
    .datetime-row { display: flex; gap: 12px; }
    .dt-box { flex: 1; display: flex; align-items: center; gap: 8px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 0 16px; transition: border-color 0.2s ease, background 0.2s ease; }
    .dt-box:focus-within { border-color: #627eff; background: white; box-shadow: 0 0 0 3px rgba(98,126,255,0.1); }
    .dt-box ion-icon { color: #9ca3af; font-size: 18px; }
    .native-dt { background: none; border: none; font-size: 15px; color: #1f2937; width: 100%; outline: none; padding: 14px 0; }
    
    .form-group textarea { width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; font-size: 15px; color: #1f2937; outline: none; transition: border-color 0.2s ease, background 0.2s ease; resize: vertical; }
    .form-group textarea:focus { border-color: #627eff; background: white; box-shadow: 0 0 0 3px rgba(98,126,255,0.1); }
    
    .emotion-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .emotion-option { min-height: 84px; border: 2px solid transparent; border-radius: 16px; background: #f9fafb; color: #6b7280; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-size: 12px; font-weight: 700; transition: all 0.2s ease; }
    .emotion-emoji { font-size: 28px; line-height: 1; }
    .emotion-option.active { border-color: var(--emotion-color); background: color-mix(in srgb, var(--emotion-color) 8%, white); color: #1f2937; box-shadow: 0 8px 20px color-mix(in srgb, var(--emotion-color) 15%, transparent); transform: scale(1.02); }
    .emotion-option:active { transform: scale(0.96); }
    
    .btn-primary { background: linear-gradient(135deg, #627eff 0%, #a78bfa 100%); color: white; border: none; padding: 16px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 20px rgba(98, 126, 255, 0.25); transition: transform 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-primary:active { transform: scale(0.98); }
    .btn-primary:disabled { opacity: 0.7; transform: none; }
    .btn-full { width: 100%; }
    
    .lookup-row { display: flex; align-items: center; gap: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 6px 6px 6px 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .lookup-row:focus-within { border-color: #627eff; box-shadow: 0 4px 16px rgba(98,126,255,0.1); }
    .lookup-row input { flex: 1; border: none; outline: none; background: transparent; font-size: 15px; color: #1f2937; padding: 8px 0; }
    .lookup-btn { border: none; border-radius: 12px; background: #eff6ff; color: #3b82f6; font-size: 18px; padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .lookup-btn:active { background: #dbeafe; }
    .lookup-btn:disabled { opacity: 0.6; }
    
    .tabs-container { margin-bottom: 24px; margin-left: -24px; margin-right: -24px; }
    .tabs-scroll { display: flex; gap: 8px; padding: 0 24px; overflow-x: auto; scrollbar-width: none; }
    .tabs-scroll::-webkit-scrollbar { display: none; }
    .tab-btn { background: white; border: 1px solid #e5e7eb; border-radius: 999px; padding: 10px 20px; font-size: 13px; font-weight: 700; color: #6b7280; white-space: nowrap; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
    .tab-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
    
    .empty-state { text-align: center; padding: 40px 24px; }
    .empty-icon-circle { width: 80px; height: 80px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #9ca3af; margin: 0 auto 16px; }
    .empty-state p { font-size: 16px; font-weight: 700; color: #374151; margin: 0 0 8px; }
    .empty-hint { font-size: 13px; color: #9ca3af; }
    
    .loading-state { text-align: center; padding: 40px 24px; }
    .loading-state ion-spinner { color: #627eff; margin-bottom: 12px; }
    .loading-state p { font-size: 14px; color: #6b7280; margin: 0; }
    
    .appointments-list { display: flex; flex-direction: column; gap: 12px; }
    .card-cita { padding: 20px; display: flex; flex-direction: column; gap: 16px; position: relative; overflow: hidden; }
    .card-cita::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--status-color); }
    .cita-header { display: flex; align-items: center; gap: 12px; }
    .cita-icon { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .cita-info { flex: 1; }
    .cita-info h3 { font-size: 16px; font-weight: 800; color: #1f2937; margin: 0 0 2px; }
    .cita-info p { font-size: 12px; font-weight: 600; color: #6b7280; margin: 0; }
    .status-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.05em; }
    
    .cita-body { display: flex; flex-direction: column; gap: 10px; padding-left: 60px; }
    .cita-detail { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #4b5563; }
    .cita-detail ion-icon { font-size: 18px; color: #9ca3af; }
    .cita-note { background: #f9fafb; padding: 12px; border-radius: 12px; font-size: 13px; color: #6b7280; display: flex; align-items: flex-start; gap: 8px; line-height: 1.4; margin-top: 4px; }
    .cita-note ion-icon { color: #9ca3af; font-size: 16px; margin-top: 2px; flex-shrink: 0; }
    
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
  mostrarFormulario = false;
  
  currentTab = 'todas';

  emotionalStates = [
    { value: 'feliz', label: 'Feliz', emoji: '😊', color: '#10b981' },
    { value: 'tranquilo', label: 'Tranquilo/a', emoji: '😌', color: '#3b82f6' },
    { value: 'ansioso', label: 'Ansioso/a', emoji: '😰', color: '#f59e0b' },
    { value: 'triste', label: 'Triste', emoji: '😢', color: '#8b5cf6' },
    { value: 'estresado', label: 'Estrés', emoji: '😩', color: '#ef4444' },
    { value: 'motivado', label: 'Motivado/a', emoji: '💪', color: '#14b8a6' },
  ];

  get filteredCitas() {
    return this.misCitas.filter(c => {
      const s = (c.status || '').toLowerCase();
      if (this.currentTab === 'todas') return true;
      if (this.currentTab === 'proximas') return s === 'pendiente' || s === 'confirmada';
      if (this.currentTab === 'pasadas') return s === 'completada';
      if (this.currentTab === 'canceladas') return s === 'cancelada';
      if (this.currentTab === 'pospuestas') return s === 'reagendada';
      return false;
    }).sort((a, b) => {
      const da = new Date(a.requested_date || a.created_at).getTime();
      const db = new Date(b.requested_date || b.created_at).getTime();
      return db - da;
    });
  }

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
        this.mensajeExito = 'Cita solicitada con éxito. Te contactaremos pronto.';
        this.formData = { user_name: '', email: this.formData.email, phone: '', requested_date: new Date().toISOString().slice(0, 10), requested_time: '', emotional_state: '', message: '' };
        this.mostrarFormulario = false;
        this.currentTab = 'todas';
        this.cargarCitas();
        setTimeout(() => this.mensajeExito = '', 5000);
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
    switch (status?.toLowerCase()) {
      case 'pendiente': return '#f59e0b';
      case 'confirmada': return '#10b981';
      case 'reagendada': return '#8b5cf6';
      case 'completada': return '#3b82f6';
      case 'cancelada': return '#ef4444';
      default: return '#9ca3af';
    }
  }

  badgeBg(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendiente': return '#fffbeb';
      case 'confirmada': return '#ecfdf5';
      case 'reagendada': return '#f3e8ff';
      case 'completada': return '#eff6ff';
      case 'cancelada': return '#fef2f2';
      default: return '#f3f4f6';
    }
  }

  statusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendiente': return 'time-outline';
      case 'confirmada': return 'checkmark-circle';
      case 'reagendada': return 'calendar-outline';
      case 'completada': return 'trophy-outline';
      case 'cancelada': return 'close-circle';
      default: return 'help-outline';
    }
  }

  statusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'reagendada': return 'Reagendada';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return status || 'Pendiente';
    }
  }
}
