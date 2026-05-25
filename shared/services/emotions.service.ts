import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ContentEngineService, LocalEmotion } from './content-engine.service';

export interface EmotionCheckIn {
  id?: string;
  emotion_id: string;
  emotion_name: string;
  emotion_icon: string;
  emotion_color: string;
  note?: string;
  created_at?: string;
}

const CHECKIN_KEY = 'pb_emotion_checkins';

@Injectable({ providedIn: 'root' })
export class EmotionsService {
  private supabase = inject(SupabaseService);
  private engine = inject(ContentEngineService);

  private localCheckins: EmotionCheckIn[] = [];

  async init(): Promise<void> {
    await this.engine.init();
    this.loadLocal();
  }

  getDailyOptions(): LocalEmotion[] {
    return this.engine.getDailyEmotions(8);
  }

  getAllEmotions(): LocalEmotion[] {
    return this.engine.getEmotions();
  }

  getEmotionById(id: string): LocalEmotion | undefined {
    return this.engine.getEmotionById(id);
  }

  async checkIn(emotionId: string, note?: string): Promise<void> {
    const emotion = this.engine.getEmotionById(emotionId);
    if (!emotion) return;

    const checkin: EmotionCheckIn = {
      emotion_id: emotion.id,
      emotion_name: emotion.nombre,
      emotion_icon: emotion.icon,
      emotion_color: emotion.color,
      note: note || undefined,
      created_at: new Date().toISOString(),
    };

    this.localCheckins.unshift({ ...checkin });
    this.saveLocal();

    try {
      await this.supabase.client.from('user_progress').insert({
        emocion: emotion.nombre,
        emotion_id: emotion.id,
        nota: note || null,
      });
    } catch { }
  }

  getHistory(): EmotionCheckIn[] {
    return this.localCheckins;
  }

  getTodayCheckin(): EmotionCheckIn | undefined {
    const today = new Date().toDateString();
    return this.localCheckins.find(
      c => c.created_at && new Date(c.created_at).toDateString() === today
    );
  }

  getWeekStats(): { emotion_id: string; count: number }[] {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recent = this.localCheckins.filter(
      c => c.created_at && new Date(c.created_at) >= weekAgo
    );

    const stats = new Map<string, number>();
    for (const c of recent) {
      stats.set(c.emotion_id, (stats.get(c.emotion_id) || 0) + 1);
    }

    return Array.from(stats.entries()).map(([emotion_id, count]) => ({
      emotion_id,
      count,
    }));
  }

  async syncFromSupabase(): Promise<void> {
    try {
      const { data } = await this.supabase.client
        .from('user_progress')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        const mapped: EmotionCheckIn[] = data.map((row: any) => ({
          id: row.id,
          emotion_id: row.emotion_id || '',
          emotion_name: row.emocion || row.emotion_name || '',
          emotion_icon: row.emotion_icon || '',
          emotion_color: row.emotion_color || '',
          note: row.nota || row.note || undefined,
          created_at: row.created_at,
        }));
        this.localCheckins = mapped;
        this.saveLocal();
      }
    } catch { }
  }

  clearLocal(): void {
    this.localCheckins = [];
    try {
      localStorage.removeItem(CHECKIN_KEY);
    } catch { }
  }

  private loadLocal(): void {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY);
      if (raw) this.localCheckins = JSON.parse(raw);
    } catch {
      this.localCheckins = [];
    }
  }

  private saveLocal(): void {
    try {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(this.localCheckins.slice(0, 100)));
    } catch { }
  }
}
