import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { UserProfileService } from './user-profile.service';

const TOKEN_KEY = 'pb_fcm_token';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
  private supabaseService = inject(SupabaseService);
  private userProfileService = inject(UserProfileService);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private listeners: any[] = [];
  fcmToken$ = this.tokenSubject.asObservable();

  get fcmToken(): string | null {
    return this.tokenSubject.value;
  }

  async register(): Promise<boolean> {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // 1. Attach listeners BEFORE register() to avoid race condition
      const regListener = PushNotifications.addListener('registration', (token) => {
        console.log('📱 FCM token recibido:', token.value);
        this.tokenSubject.next(token.value);
        this.saveToken(token.value);
      });
      this.listeners.push(regListener);

      const errListener = PushNotifications.addListener('registrationError', (err) => {
        console.error('❌ Error registro FCM:', err.error);
      });
      this.listeners.push(errListener);

      const receivedListener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📩 Push recibido en foreground:', notification.title);
      });
      this.listeners.push(receivedListener);

      const tapListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('👆 Push presionado:', notification.notification.data);
        this.handleNotificationTap(notification.notification.data);
      });
      this.listeners.push(tapListener);

      // 2. Request permission
      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive !== 'granted') {
        console.warn('❌ Permiso de notificaciones denegado');
        return false;
      }

      // 3. Register with FCM
      await PushNotifications.register();
      console.log('✅ Push notifications registered');

      // 4. Create channels
      await this.createChannels();
      return true;
    } catch (e) {
      console.warn('❌ Push registration failed:', e);
      return false;
    }
  }

  async unregister(): Promise<void> {
    try {
      const token = this.tokenSubject.value;
      if (token) {
        await this.supabaseService.client
          .from('push_tokens')
          .update({ is_active: false })
          .eq('token', token);
      }
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.unregister();
      for (const l of this.listeners) {
        try { l.remove(); } catch { /* ignore */ }
      }
      this.listeners = [];
      this.tokenSubject.next(null);
      localStorage.removeItem(TOKEN_KEY);
      console.log('✅ Push unregistered');
    } catch { /* ignore */ }
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

    const userId = this.userProfileService.currentUserId;

    try {
      await this.supabaseService.client
        .from('push_tokens')
        .upsert({
          token,
          device: 'android',
          user_id: userId || undefined,
          is_active: true,
        }, { onConflict: 'token' });
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
