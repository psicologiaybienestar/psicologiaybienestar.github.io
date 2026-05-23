import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface EmotionalTip {
  id: string;
  title: string;
  description: string;
  emotion_type: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class EmotionalTipsService {
  private supabaseService = inject(SupabaseService);
  private tipsSubject = new BehaviorSubject<EmotionalTip[]>([]);
  tips$ = this.tipsSubject.asObservable();

  private get supabase() {
    return this.supabaseService.client;
  }

  async getActivos(limit = 3, tipo?: string): Promise<EmotionalTip[]> {
    let query = this.supabase
      .from('emotional_tips')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (tipo) {
      query = query.eq('emotion_type', tipo);
    }
    const { data, error } = await query;
    if (error) throw error;
    const tips = data || [];
    this.tipsSubject.next(tips);
    return tips;
  }

  subscribeToChanges(): any {
    return this.supabase
      .channel('tips-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'emotional_tips' },
        () => { this.getActivos(); }
      )
      .subscribe();
  }
}
