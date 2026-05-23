import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface AppointmentRequest {
  id?: string;
  user_name: string;
  email: string;
  phone?: string;
  requested_date?: string;
  requested_time?: string;
  message?: string;
  emotional_state?: string;
  consent?: boolean;
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'reagendada';
  created_at?: string;
  updated_at?: string;
  reagendada_date?: string;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private supabaseService = inject(SupabaseService);

  private get supabase() {
    return this.supabaseService.client;
  }

  async requestAppointment(data: {
    user_name: string;
    email: string;
    phone?: string;
    requested_date: string;
    requested_time: string;
    message?: string;
    emotional_state?: string;
    consent: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .insert({
          user_name: data.user_name,
          email: data.email,
          phone: data.phone || null,
          requested_date: data.requested_date,
          requested_time: data.requested_time,
          message: data.message || null,
          emotional_state: data.emotional_state || null,
          consent: data.consent,
          status: 'pendiente',
        });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al solicitar cita' };
    }
  }

  async getMyAppointments(email: string): Promise<AppointmentRequest[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_my_appointments', { p_email: email });
      if (error) throw error;
      return (data || []).map((a: any) => ({
        ...a,
        status: a.status || 'pendiente',
      }));
    } catch (e) {
      console.warn('⚠️ Error fetching appointments:', e);
      return [];
    }
  }

  async cancelAppointment(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .update({ status: 'cancelada' })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  async rescheduleAppointment(id: string, newDate: string, newTime: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .update({
          requested_date: newDate,
          requested_time: newTime,
          status: 'reagendada',
          reagendada_date: new Date().toISOString(),
        })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
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

  getTimeSlots(): string[] {
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  }

  getEmotionalStates(): { value: string; label: string; icon: string }[] {
    return [
      { value: '', label: 'Seleccionar...', icon: '🤍' },
      { value: 'feliz', label: 'Feliz', icon: '😊' },
      { value: 'tranquilo', label: 'Tranquilo/a', icon: '😌' },
      { value: 'neutral', label: 'Neutral', icon: '😐' },
      { value: 'ansioso', label: 'Ansioso/a', icon: '😰' },
      { value: 'triste', label: 'Triste', icon: '😢' },
      { value: 'estresado', label: 'Estresado/a', icon: '😤' },
      { value: 'enojado', label: 'Enojado/a', icon: '😠' },
      { value: 'cansado', label: 'Cansado/a', icon: '😴' },
      { value: 'motivado', label: 'Motivado/a', icon: '💪' },
    ];
  }
}
