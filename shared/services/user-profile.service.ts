import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

const UUID_KEY = 'pb_user_uuid';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private supabaseService = inject(SupabaseService);
  private userIdSubject = new BehaviorSubject<string | null>(null);
  private profileSubject = new BehaviorSubject<any | null>(null);

  currentUserId$ = this.userIdSubject.asObservable();
  currentProfile$ = this.profileSubject.asObservable();

  get currentUserId(): string | null {
    return this.userIdSubject.value;
  }

  get currentProfile(): any | null {
    return this.profileSubject.value;
  }

  async init(): Promise<void> {
    let uuid = await this.getStoredUuid();
    if (!uuid) {
      uuid = crypto.randomUUID();
      await this.storeUuid(uuid);
    }
    this.userIdSubject.next(uuid);
    await this.syncProfile(uuid);
  }

  private async getStoredUuid(): Promise<string | null> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: UUID_KEY });
      return value || null;
    } catch {
      return localStorage.getItem(UUID_KEY);
    }
  }

  private async storeUuid(uuid: string): Promise<void> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: UUID_KEY, value: uuid });
    } catch {
      localStorage.setItem(UUID_KEY, uuid);
    }
  }

  async syncProfile(uuid: string): Promise<void> {
    try {
      const existing = await this.supabaseService.client
        .from('profiles')
        .select('*')
        .eq('id', uuid)
        .maybeSingle();

      if (existing.data) {
        await this.supabaseService.client
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', uuid);
        this.profileSubject.next(existing.data);
      } else {
        const { data, error } = await this.supabaseService.client
          .from('profiles')
          .insert({ id: uuid, last_seen: new Date().toISOString() })
          .select()
          .maybeSingle();
        if (!error && data) {
          this.profileSubject.next(data);
        }
      }
    } catch {
      // Silently fail — user can still use the app
    }
  }

  async updateProfile(updates: Partial<{
    nickname: string;
    avatar: string;
    emotional_points: number;
    level: number;
    streak: number;
    preferences: Record<string, any>;
  }>): Promise<void> {
    const uuid = this.currentUserId;
    if (!uuid) return;
    try {
      const { error } = await this.supabaseService.client
        .from('profiles')
        .update(updates)
        .eq('id', uuid);
      if (!error) {
        const current = this.profileSubject.value;
        this.profileSubject.next({ ...current, ...updates });
      }
    } catch { /* ignore */ }
  }

  async recordProgress(data: {
    activity_id?: string;
    activity_type?: string;
    emotional_state?: string;
    score?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const uuid = this.currentUserId;
    if (!uuid) return;
    try {
      await this.supabaseService.client
        .from('user_progress')
        .insert({ user_id: uuid, ...data });
    } catch { /* ignore */ }
  }

  async resetIdentity(): Promise<void> {
    const newUuid = crypto.randomUUID();
    await this.storeUuid(newUuid);
    this.userIdSubject.next(newUuid);
    await this.syncProfile(newUuid);
  }
}
