import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface InternalNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  image_url: string;
  related_id: string;
  related_table: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class InternalNotificationsService {
  private supabaseService = inject(SupabaseService);

  private get supabase() {
    return this.supabaseService.client;
  }

  async getLatest(limit = 20): Promise<InternalNotification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(n => ({ ...n, is_read: n.is_read || false }));
  }

  async getUnreadCount(): Promise<number> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) return 0;
    return data?.length || 0;
  }

  async markAsRead(id: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  }

  async markAllAsRead(): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
  }

  async deleteNotification(id: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .delete()
      .eq('id', id);
  }

  async deleteAllRead(): Promise<void> {
    await this.supabase
      .from('notifications')
      .delete()
      .eq('is_read', true);
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
