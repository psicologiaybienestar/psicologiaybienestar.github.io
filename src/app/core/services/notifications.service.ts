import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type NotificationType = 'eventos' | 'consejos' | 'frases' | 'recordatorios' | 'minijuegos';

export interface NotificationPreferences {
  eventos: boolean;
  consejos: boolean;
  frases: boolean;
  recordatorios: boolean;
  minijuegos: boolean;
}

const PREFS_KEY = 'pb_notification_prefs';
const DEFAULT_PREFS: NotificationPreferences = {
  eventos: true,
  consejos: true,
  frases: true,
  recordatorios: true,
  minijuegos: true,
};

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private supabaseService = inject(SupabaseService);

  private get supabase() {
    return this.supabaseService.client;
  }

  getPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) {
        return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
      }
    } catch { /* ignore */ }
    return { ...DEFAULT_PREFS };
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
}
