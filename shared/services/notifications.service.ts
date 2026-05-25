import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { NotificationPreferences } from '../interfaces';
import { NotificationType } from '../types';
import { PREFS_KEY, DEFAULT_NOTIFICATION_PREFS, CONTENT_TABLES } from '../constants';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private supabaseService = inject(SupabaseService);
  private channelCounter = 0;

  private get supabase() {
    return this.supabaseService.client;
  }

  getPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) {
        return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(stored) };
      }
    } catch { /* ignore */ }
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }

  savePreferences(prefs: NotificationPreferences): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch { /* ignore */ }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } catch {
      return false;
    }
  }

  async scheduleLocal(title: string, body: string, id?: number): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: id ?? Date.now(),
          schedule: { at: new Date(Date.now() + 2000) },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample',
        }],
      });
    } catch { /* Capacitor not available */ }
  }

  async cancelAll(): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [] });
    } catch { /* Capacitor not available */ }
  }

  subscribeToEventChanges(callback: (event: any) => void) {
    return this.supabase
      .channel('eventos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos' },
        (payload) => callback(payload.new)
      )
      .subscribe();
  }

  subscribeToAllChanges(callback: (table: string, data: any) => void) {
    const tables = CONTENT_TABLES;
    const id = `all-content-changes-${++this.channelCounter}`;
    const channel = this.supabase.channel(id);
    for (const table of tables) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => callback(table, payload.new)
      );
    }
    return channel.subscribe();
  }

  subscribeToAppointmentChanges(email: string, callback: (data: any) => void) {
    return this.supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `email=eq.${email}` },
        (payload) => callback(payload.new)
      )
      .subscribe();
  }
}
