import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { ContentEngineService, LocalTip } from './content-engine.service';
import { EmotionalTip } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class EmotionalTipsService {
  private supabaseService = inject(SupabaseService);
  private engine = inject(ContentEngineService);
  private tipsSubject = new BehaviorSubject<(EmotionalTip | LocalTip)[]>([]);
  tips$ = this.tipsSubject.asObservable();

  private get supabase() {
    return this.supabaseService.client;
  }

  async getActivos(limit = 3, tipo?: string): Promise<(EmotionalTip | LocalTip)[]> {
    try {
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
    } catch {
      await this.engine.init();
      const local = tipo
        ? this.engine.getTipsByEmotionType(tipo)
        : this.engine.getAvailableTips();
      const selected = local.sort(() => Math.random() - 0.5).slice(0, limit);
      this.tipsSubject.next(selected);
      return selected;
    }
  }

  async getDaily(emotionType?: string): Promise<LocalTip> {
    await this.engine.init();
    return this.engine.getDailyTip(emotionType);
  }

  async search(term: string): Promise<LocalTip[]> {
    await this.engine.init();
    return this.engine.searchTips(term);
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
