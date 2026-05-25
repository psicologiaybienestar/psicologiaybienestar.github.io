import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserProfileService } from './user-profile.service';
import { InternalNotification } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class InternalNotificationsService {
  private supabaseService = inject(SupabaseService);
  private userProfile = inject(UserProfileService);

  private get supabase() {
    return this.supabaseService.client;
  }

  private get deviceId(): string | null {
    return this.userProfile.currentUserId;
  }

  async getLatest(limit = 20): Promise<InternalNotification[]> {
    const did = this.deviceId;
    if (!did) return [];

    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    if (!data || data.length === 0) return [];

    const ids = data.map(n => n.id);
    const { data: acks } = await this.supabase
      .from('notification_ack')
      .select('*')
      .eq('device_id', did)
      .in('notification_id', ids);

    const ackMap = new Map((acks || []).map(a => [a.notification_id, a]));

    return data
      .filter(n => !ackMap.get(n.id)?.dismissed)
      .map(n => ({ ...n, is_read: ackMap.get(n.id)?.is_read || false }));
  }

  async getUnreadCount(): Promise<number> {
    const did = this.deviceId;
    if (!did) return 0;

    const { data, error } = await this.supabase
      .from('notifications')
      .select('id');
    if (error || !data || data.length === 0) return 0;

    const ids = data.map(n => n.id);
    const { data: acks } = await this.supabase
      .from('notification_ack')
      .select('notification_id,is_read,dismissed')
      .eq('device_id', did)
      .in('notification_id', ids);

    const ackMap = new Map((acks || []).map(a => [a.notification_id, a]));
    return data.filter(n => {
      const ack = ackMap.get(n.id);
      return !ack?.dismissed && !ack?.is_read;
    }).length;
  }

  async markAsRead(id: string): Promise<void> {
    const did = this.deviceId;
    if (!did) return;
    await this.supabase
      .from('notification_ack')
      .upsert({
        notification_id: id,
        device_id: did,
        is_read: true,
        dismissed: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'notification_id,device_id' });
  }

  async markAllAsRead(): Promise<void> {
    const did = this.deviceId;
    if (!did) return;

    const { data } = await this.supabase
      .from('notifications')
      .select('id');
    if (!data || data.length === 0) return;

    const ids = data.map(n => n.id);
    const { data: acks } = await this.supabase
      .from('notification_ack')
      .select('notification_id')
      .eq('device_id', did)
      .in('notification_id', ids);

    const ackedIds = new Set((acks || []).map(a => a.notification_id));
    const unackedIds = ids.filter(id => !ackedIds.has(id));
    if (unackedIds.length === 0) return;

    const rows = unackedIds.map(id => ({
      notification_id: id,
      device_id: did,
      is_read: true,
      dismissed: false,
    }));
    await this.supabase.from('notification_ack').upsert(rows, { onConflict: 'notification_id,device_id' });
  }

  async deleteNotification(id: string): Promise<void> {
    const did = this.deviceId;
    if (!did) return;
    await this.supabase
      .from('notification_ack')
      .upsert({
        notification_id: id,
        device_id: did,
        dismissed: true,
        is_read: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'notification_id,device_id' });
  }

  async deleteAllRead(): Promise<void> {
    const did = this.deviceId;
    if (!did) return;

    const { data: ackRows } = await this.supabase
      .from('notification_ack')
      .select('notification_id')
      .eq('device_id', did)
      .eq('is_read', true)
      .eq('dismissed', false);

    if (!ackRows || ackRows.length === 0) return;

    await this.supabase
      .from('notification_ack')
      .update({ dismissed: true, updated_at: new Date().toISOString() })
      .eq('device_id', did)
      .eq('is_read', true)
      .eq('dismissed', false);
  }

  subscribeToNew(callback: () => void): any {
    return this.supabase
      .channel('notifications-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => callback()
      )
      .subscribe();
  }
}
