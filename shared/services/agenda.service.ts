import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserProfileService } from './user-profile.service';
import { AppointmentRequest } from '../interfaces';
import { EMOTIONAL_STATES, TIME_SLOTS } from '../constants';
import { getWeekDays } from '../utils';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private supabaseService = inject(SupabaseService);
  private userProfileService = inject(UserProfileService);

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
      const payload = {
        user_name: data.user_name,
        email: data.email,
        phone: data.phone || null,
        requested_date: data.requested_date,
        requested_time: data.requested_time,
        message: data.message || null,
        emotional_state: data.emotional_state || null,
        consent: data.consent,
        status: 'pendiente',
      };

      const { error } = await this.supabase
        .from('appointments')
        .insert({
          ...payload,
          user_id: this.userProfileService.currentUserId || null,
        });

      if (error && /user_id|schema cache|column/i.test(error.message)) {
        const retry = await this.supabase
          .from('appointments')
          .insert(payload);
        if (retry.error) return { success: false, error: retry.error.message };
        return { success: true };
      }

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al solicitar cita' };
    }
  }

  async getMyAppointments(email: string): Promise<AppointmentRequest[]> {
    if (!email?.trim()) return [];
    try {
      const { data, error } = await this.supabase
        .rpc('get_my_appointments', { p_email: email.trim() });
      if (error) throw error;
      return (data || []).map((a: any) => ({
        ...a,
        status: a.status || 'pendiente',
      }));
    } catch (e) {
      console.warn('Error fetching appointments:', e);
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

  getWeekDays() {
    return getWeekDays();
  }

  getTimeSlots(): string[] {
    return TIME_SLOTS;
  }

  getEmotionalStates() {
    return EMOTIONAL_STATES;
  }
}


