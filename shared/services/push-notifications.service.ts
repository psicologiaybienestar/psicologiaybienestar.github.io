import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { UserProfileService } from './user-profile.service';
import { TOKEN_KEY } from '../constants';

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
    console.log('📱 [FCM] === Push registration started ===');

    const savedToken = this.getSavedToken();
    if (savedToken) {
      console.log(`📱 [FCM] Token existente encontrado en localStorage: ${savedToken.slice(0, 20)}...`);
    }

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      console.log('📱 [FCM] @capacitor/push-notifications loaded successfully');

      const regListener = PushNotifications.addListener('registration', (token) => {
        console.log('📱 [FCM] ✅ TOKEN RECIBIDO:', token.value.slice(0, 40) + '...');
        console.log('📱 [FCM] Token length:', token.value.length);
        this.tokenSubject.next(token.value);
        this.saveToken(token.value);
      });
      this.listeners.push(regListener);
      console.log('📱 [FCM] registration listener attached');

      const errListener = PushNotifications.addListener('registrationError', (err) => {
        console.error('📱 [FCM] ❌ ERROR REGISTRO:', JSON.stringify(err));
      });
      this.listeners.push(errListener);
      console.log('📱 [FCM] registrationError listener attached');

      const receivedListener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('📱 [FCM] 📩 Push recibido en foreground:', notification.title);
      });
      this.listeners.push(receivedListener);
      console.log('📱 [FCM] pushNotificationReceived listener attached');

      const tapListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('📱 [FCM] 👆 Push presionado:', JSON.stringify(notification.notification.data));
        this.handleNotificationTap(notification.notification.data);
      });
      this.listeners.push(tapListener);
      console.log('📱 [FCM] pushNotificationActionPerformed listener attached');

      console.log('📱 [FCM] Solicitando permiso de notificaciones...');
      const permResult = await PushNotifications.requestPermissions();
      console.log('📱 [FCM] Resultado permiso:', JSON.stringify(permResult));

      if (permResult.receive !== 'granted') {
        console.warn('📱 [FCM] ❌ Permiso de notificaciones denegado');
        return false;
      }

      console.log('📱 [FCM] Registrando en FCM...');
      await PushNotifications.register();
      console.log('📱 [FCM] ✅ PushNotifications.register() completed');

      await this.createChannels();

      return true;
    } catch (e: any) {
      console.error('📱 [FCM] ❌ Push registration failed:', e?.message || e);
      if (e?.stack) console.error('📱 [FCM] Stack:', e.stack);
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
        console.log('📱 [FCM] Token desactivado en Supabase');
      }
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.unregister();
      for (const l of this.listeners) {
        try { l.remove(); } catch { /* ignore */ }
      }
      this.listeners = [];
      this.tokenSubject.next(null);
      localStorage.removeItem(TOKEN_KEY);
      console.log('📱 [FCM] Push unregistered');
    } catch { /* ignore */ }
  }

  async createChannels(): Promise<void> {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const channels = [
        { id: 'eventos', name: 'Eventos', description: 'Nuevos eventos y cambios', importance: 4 as any, visibility: 1 as any },
        { id: 'consejos', name: 'Consejos', description: 'Tips de bienestar emocional', importance: 3 as any, visibility: 1 as any },
        { id: 'frases', name: 'Frases', description: 'Frases motivacionales diarias', importance: 3 as any, visibility: 1 as any },
        { id: 'citas', name: 'Citas', description: 'Estado de tus solicitudes de cita', importance: 4 as any, visibility: 1 as any },
        { id: 'noticias', name: 'Noticias', description: 'Nuevos artículos publicados', importance: 4 as any, visibility: 1 as any },
        { id: 'actividades', name: 'Actividades', description: 'Actividades de bienestar nuevas', importance: 3 as any, visibility: 1 as any },
        { id: 'minijuegos', name: 'Minijuegos', description: 'Nuevos minijuegos disponibles', importance: 3 as any, visibility: 1 as any },
        { id: 'emociones', name: 'Emociones', description: 'Nuevas categorías emocionales', importance: 3 as any, visibility: 1 as any },
        { id: 'recordatorios', name: 'Recordatorios', description: 'Alertas emocionales programadas', importance: 3 as any, visibility: 1 as any },
        { id: 'sistema', name: 'Sistema', description: 'Notificaciones del sistema', importance: 2 as any, visibility: 1 as any },
      ];
      for (const ch of channels) {
        await PushNotifications.createChannel(ch);
        console.log(`📱 [FCM] Canal creado: ${ch.id} (${ch.name})`);
      }
      console.log('📱 [FCM] ✅ Todos los canales creados');
    } catch (e: any) {
      console.warn('📱 [FCM] ⚠️ Error creando canales:', e?.message || e);
    }
  }

  async saveToken(token: string): Promise<boolean> {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      console.log(`📱 [FCM] Token guardado en localStorage`);
    } catch (e) {
      console.warn('📱 [FCM] ⚠️ No se pudo guardar en localStorage:', e);
    }

    const userId = this.userProfileService.currentUserId;
    console.log(`📱 [FCM] user_id: ${userId || 'none (anonymous)'}`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📱 [FCM] Upsertando token en Supabase (intento ${attempt}/3)...`);
        const { error } = await this.supabaseService.client
          .from('push_tokens')
          .upsert({
            token,
            device: 'android',
            user_id: userId || undefined,
            is_active: true,
          }, { onConflict: 'token' });

        if (error) {
          console.error(`📱 [FCM] ❌ Error upsert (intento ${attempt}/3):`, error.message);
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, 1000 * attempt));
          }
          continue;
        }

        console.log('📱 [FCM] ✅ Token guardado exitosamente en Supabase push_tokens');
        return true;
      } catch (e: any) {
        console.error(`📱 [FCM] ❌ Excepción upsert (intento ${attempt}/3):`, e?.message || e);
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }

    console.error('📱 [FCM] ❌ No se pudo guardar el token tras 3 intentos');
    return false;
  }

  getSavedToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async diagnose(): Promise<Record<string, any>> {
    const status: Record<string, any> = {
      platform: 'unknown',
      capacitor: false,
      pushPlugin: false,
      permission: 'unknown',
      token: null,
      supabaseConnection: false,
      pushTokensCount: 0,
      userProfile: null,
    };

    try {
      const { Capacitor } = await import('@capacitor/core');
      status['platform'] = Capacitor.getPlatform();
      status['capacitor'] = true;
      console.log(`📱 [FCM] Diagnóstico: platform=${status['platform']}`);
    } catch {
      console.warn('📱 [FCM] Diagnóstico: Capacitor no disponible');
    }

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      status['pushPlugin'] = true;
      console.log('📱 [FCM] Diagnóstico: Push plugin disponible');

      try {
        const perm = await PushNotifications.requestPermissions();
        status['permission'] = perm.receive;
        console.log(`📱 [FCM] Diagnóstico: permiso=${perm.receive}`);
      } catch { /* ignore */ }
    } catch {
      console.warn('📱 [FCM] Diagnóstico: Push plugin NO disponible');
    }

    const saved = this.getSavedToken();
    status['token'] = saved ? `${saved.slice(0, 20)}...` : null;

    status['userProfile'] = this.userProfileService.currentUserId;

    try {
      const { count, error } = await this.supabaseService.client
        .from('push_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (!error) {
        status['pushTokensCount'] = count || 0;
        status['supabaseConnection'] = true;
      } else {
        status['supabaseError'] = error.message;
      }
    } catch (e: any) {
      status['supabaseError'] = e?.message;
    }

    console.log('📱 [FCM] Diagnóstico completo:', JSON.stringify(status, null, 2));
    return status;
  }

  private handleNotificationTap(data: any): void {
    if (!data) return;
    const route = data.route || data.url || null;
    if (route) {
      console.log(`📱 [FCM] Navegando a: ${route}`);
      window.location.href = route;
    }
  }
}
