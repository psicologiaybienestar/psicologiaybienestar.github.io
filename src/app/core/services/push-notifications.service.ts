import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

const TOKEN_KEY = 'pb_fcm_token';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
  private supabaseService = inject(SupabaseService);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  fcmToken$ = this.tokenSubject.asObservable();

  get fcmToken(): string | null {
    return this.tokenSubject.value;
  }

  async register(): Promise<boolean> {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive !== 'granted') {
        console.warn('❌ Push permission denied');
        return false;
      }

      await PushNotifications.register();
      console.log('✅ Push notifications registered');

      PushNotifications.addListener('registration', (token) => {
        console.log('✅ FCM token registered:', token.value);
        this.tokenSubject.next(token.value);
        this.saveToken(token.value);
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('❌ FCM registration error:', err.error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📩 Push received (foreground):', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('👆 Push tapped:', notification);
        this.handleNotificationTap(notification.notification.data);
      });

      await this.createChannels();
      return true;
    } catch (e) {
      console.warn('❌ Push registration failed:', e);
      return false;
    }
  }

  private async createChannels(): Promise<void> {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const channels: { id: string; name: string; description: string; importance: any; visibility: any }[] = [
        { id: 'eventos', name: 'Eventos', description: 'Nuevos eventos y cambios', importance: 4, visibility: 1 },
        { id: 'consejos', name: 'Consejos', description: 'Tips de bienestar emocional', importance: 3, visibility: 1 },
        { id: 'frases', name: 'Frases', description: 'Frases motivacionales diarias', importance: 3, visibility: 1 },
        { id: 'citas', name: 'Citas', description: 'Estado de tus solicitudes de cita', importance: 4, visibility: 1 },
        { id: 'recordatorios', name: 'Recordatorios', description: 'Alertas emocionales programadas', importance: 3, visibility: 1 },
      ];
      for (const ch of channels) {
        await PushNotifications.createChannel(ch);
      }
      console.log('✅ Notification channels created');
    } catch { /* ignore */ }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch { /* ignore */ }

    try {
      await this.supabaseService.client
        .from('push_tokens')
        .upsert({ token, device: 'android', is_active: true }, { onConflict: 'token' });
      console.log('✅ FCM token saved to Supabase push_tokens');
    } catch (e) {
      console.warn('⚠️ Could not save token to Supabase:', e);
    }
  }

  getSavedToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private handleNotificationTap(data: any): void {
    if (!data) return;
    const route = data.route || data.url || null;
    if (route) {
      window.location.href = route;
    }
  }
}
