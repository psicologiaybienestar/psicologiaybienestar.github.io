import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface AppointmentRequest {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_preferida?: string;
  hora_preferida?: string;
  motivo: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private supabaseService = inject(SupabaseService);

  private get supabase() {
    return this.supabaseService.client;
  }

  async requestAppointment(data: Omit<AppointmentRequest, 'id' | 'estado' | 'created_at'>): Promise<void> {
    // Future: insert into Supabase 'citas' table
    console.log('Appointment requested (stub):', data);
  }

  async getMyAppointments(email: string): Promise<AppointmentRequest[]> {
    // Future: query from Supabase
    return [];
  }

  async cancelAppointment(id: string): Promise<void> {
    // Future: update estado in Supabase
    console.log('Appointment cancelled (stub):', id);
  }

  getWeekDays(): { label: string; date: Date }[] {
    const days: { label: string; date: Date }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      days.push({ label: labels[d.getDay()], date: d });
    }
    return days;
  }
}
