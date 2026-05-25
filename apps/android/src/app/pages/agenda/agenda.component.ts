import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '@shared/services/supabase.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [IonicModule, DatePipe, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Agenda</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="section-header">
        <h2>Solicitar cita</h2>
      </div>

      <ion-list>
        <ion-item>
          <ion-label position="stacked">Nombre</ion-label>
          <ion-input [(ngModel)]="formData.nombre" placeholder="Tu nombre" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input type="email" [(ngModel)]="formData.email" placeholder="tu@email.com" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Teléfono</ion-label>
          <ion-input type="tel" [(ngModel)]="formData.telefono" placeholder="+57 300 000 0000" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Fecha deseada</ion-label>
          <ion-datetime presentation="date" [(ngModel)]="formData.fecha" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Mensaje</ion-label>
          <ion-textarea [(ngModel)]="formData.mensaje" rows={3} placeholder="Breve descripción..." />
        </ion-item>
      </ion-list>

      <ion-button expand="block" (click)="solicitarCita()" [disabled]="enviando">
        {{ enviando ? 'Enviando...' : 'Solicitar cita' }}
      </ion-button>

      @if (mensajeExito) {
        <ion-note color="success" class="ion-padding-top">
          <p>{{ mensajeExito }}</p>
        </ion-note>
      }

      <ion-list-header class="ion-padding-top">
        <ion-label>Mis citas</ion-label>
      </ion-list-header>

      @if (misCitas.length === 0) {
        <ion-item>
          <ion-label class="ion-text-center">No tienes citas agendadas</ion-label>
        </ion-item>
      }
      @for (cita of misCitas; track cita.id) {
        <ion-item>
          <ion-label>
            <h2>{{ cita.nombre }}</h2>
            <p>{{ cita.fecha_solicitada | date:'dd/MM/yyyy' }} — {{ cita.estado }}</p>
          </ion-label>
          <ion-badge [color]="cita.estado === 'confirmada' ? 'success' : cita.estado === 'pendiente' ? 'warning' : 'medium'">
            {{ cita.estado }}
          </ion-badge>
        </ion-item>
      }
    </ion-content>
  `,
  styles: `
    .section-header h2 { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
  `,
})
export class AgendaComponent implements OnInit {
  private supabase = inject(SupabaseService);

  formData = { nombre: '', email: '', telefono: '', fecha: '', mensaje: '' };
  enviando = false;
  mensajeExito = '';
  misCitas: any[] = [];

  ngOnInit() {
    this.cargarCitas();
  }

  async solicitarCita() {
    if (!this.formData.nombre || !this.formData.email) return;
    this.enviando = true;
    try {
      await this.supabase.client.from('appointments').insert({
        nombre: this.formData.nombre,
        email: this.formData.email,
        telefono: this.formData.telefono,
        fecha_solicitada: this.formData.fecha || new Date().toISOString(),
        mensaje: this.formData.mensaje,
        estado: 'pendiente',
      });
      this.mensajeExito = 'Cita solicitada con éxito. Te contactaremos pronto.';
      this.formData = { nombre: '', email: '', telefono: '', fecha: '', mensaje: '' };
      this.cargarCitas();
    } catch { /* ignore */ }
    this.enviando = false;
  }

  private async cargarCitas() {
    try {
      const { data } = await this.supabase.client
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      this.misCitas = data || [];
    } catch { /* ignore */ }
  }
}
