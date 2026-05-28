import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface LocalEmotion {
  id: string;
  nombre: string;
  icon: string;
  color: string;
  description: string;
  recommendations: string[];
  suggested_activities: string[];
  related_tips: string[];
}

export interface LocalQuote {
  id: number;
  quote: string;
  author: string;
  category: string;
}

export interface LocalTip {
  id: number;
  title: string;
  description: string;
  emotion_type: string;
}

export interface LocalActivity {
  id: number;
  title: string;
  description: string;
  content?: string;
  activity_type: string;
  duration: number;
}

const HISTORY_KEY = 'pb_content_history';
const MAX_HISTORY = 100;

@Injectable({ providedIn: 'root' })
export class ContentEngineService {
  private http = inject(HttpClient);

  private emotions: LocalEmotion[] = [];
  private quotes: LocalQuote[] = [];
  private tips: LocalTip[] = [];
  private activities: LocalActivity[] = [];

  private loaded = false;
  private loading: Promise<void> | null = null;

  private fixedEmotionIds = ['feliz', 'tranquilo', 'ansioso', 'triste', 'motivado'];

  async init(): Promise<void> {
    if (this.loaded) return;
    if (this.loading) return this.loading;
    this.loading = this.loadAll();
    await this.loading;
  }

  private async loadAll(): Promise<void> {
    try {
      const [emotions, quotes, tips, activities] = await Promise.all([
        lastValueFrom(this.http.get<LocalEmotion[]>('assets/data/emotions.json')),
        lastValueFrom(this.http.get<LocalQuote[]>('assets/data/quotes.json')),
        lastValueFrom(this.http.get<LocalTip[]>('assets/data/tips.json')),
        lastValueFrom(this.http.get<LocalActivity[]>('assets/data/activities.json')),
      ]);
      this.emotions = emotions || [];
      this.quotes = quotes || [];
      this.tips = tips || [];
      this.activities = activities || [];
    } catch {
      try {
        const [emotions, quotes, tips, activities] = await Promise.all([
          fetch('assets/data/emotions.json').then(r => r.json()),
          fetch('assets/data/quotes.json').then(r => r.json()),
          fetch('assets/data/tips.json').then(r => r.json()),
          fetch('assets/data/activities.json').then(r => r.json()),
        ]);
        this.emotions = emotions || [];
        this.quotes = quotes || [];
        this.tips = tips || [];
        this.activities = activities || [];
      } catch {
        this.emotions = [];
        this.quotes = this.getDefaultQuotes();
        this.tips = this.getDefaultTips();
        this.activities = this.getDefaultActivities();
      }
    }
    this.loaded = true;
  }

  private getDefaultQuotes(): LocalQuote[] {
    return [
      { id: 1, quote: 'Cada dia es una nueva oportunidad para empezar', author: 'Anonimo', category: 'motivacion' },
      { id: 2, quote: 'La calma es tu superpoder', author: 'Anonimo', category: 'relajacion' },
      { id: 3, quote: 'Respira, suelta, confia', author: 'Anonimo', category: 'mindfulness' },
      { id: 4, quote: 'Tu bienestar es primero', author: 'Anonimo', category: 'bienestar' },
      { id: 5, quote: 'No estas solo, estamos contigo', author: 'Anonimo', category: 'general' },
    ];
  }

  private getDefaultTips(): LocalTip[] {
    return [
      { id: 1, title: 'Respira profundo', description: 'Inhala 4 segundos, aguanta 4, exhala 4', emotion_type: 'ansiedad' },
      { id: 2, title: 'Tomate una pausa', description: 'Alejate 5 minutos de lo que te estresa', emotion_type: 'estres' },
      { id: 3, title: 'Escribe lo que sientes', description: 'Poner tus emociones en papel ayuda a procesarlas', emotion_type: 'general' },
      { id: 4, title: 'Valorate', description: 'Reconoce tus logros, por pequeños que sean', emotion_type: 'autoestima' },
      { id: 5, title: 'Conecta contigo', description: 'Cierra los ojos y siente tu respiracion por un minuto', emotion_type: 'mindfulness' },
    ];
  }

  private getDefaultActivities(): LocalActivity[] {
    return [
      { id: 1, title: 'Respiracion 4-7-8', description: 'Inhala 4s, reten 7s, exhala 8s', activity_type: 'respiracion', duration: 1 },
      { id: 2, title: 'Escaneo corporal', description: 'Recorre tu cuerpo con atencion de cabeza a pies', activity_type: 'mindfulness', duration: 5 },
      { id: 3, title: 'Diario de gratitud', description: 'Escribe 3 cosas por las que agradeces hoy', activity_type: 'meditacion', duration: 5 },
    ];
  }

  getEmotions(): LocalEmotion[] {
    return this.emotions;
  }

  getDailyEmotions(count = 8): LocalEmotion[] {
    const fixed = this.emotions.filter(e => this.fixedEmotionIds.includes(e.id));
    const secondary = this.emotions.filter(e => !this.fixedEmotionIds.includes(e.id));

    const today = new Date().toDateString();
    const seed = this.hashCode(today);
    const shuffled = this.seededShuffle(secondary, seed);

    const recentlySeen = this.getHistory('emotion');
    const available = shuffled.filter(e => !recentlySeen.includes(e.id));

    const picks = available.length >= count - fixed.length
      ? available.slice(0, count - fixed.length)
      : shuffled.slice(0, count - fixed.length);

    const result = [...fixed];
    for (const pick of picks) {
      if (!result.find(r => r.id === pick.id)) {
        result.push(pick);
      }
    }

    return result.slice(0, count);
  }

  getEmotionById(id: string): LocalEmotion | undefined {
    return this.emotions.find(e => e.id === id);
  }

  getDailyQuote(): LocalQuote {
    const history = this.getHistory('quote');
    const available = this.quotes.filter(q => !history.includes(String(q.id)));
    const pool = available.length > 0 ? available : this.quotes;

    const today = new Date().toDateString();
    const seed = this.hashCode(today + 'quote');
    const idx = Math.abs(seed) % pool.length;

    const pick = pool[idx];
    this.addToHistory('quote', String(pick.id));
    return pick;
  }

  getQuoteById(id: number): LocalQuote | undefined {
    return this.quotes.find(q => q.id === id);
  }

  getRandomQuote(): LocalQuote {
    const idx = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[idx];
  }

  getRandomQuotes(count = 5): LocalQuote[] {
    const history = this.getHistory('quote');
    const available = this.quotes.filter(q => !history.includes(String(q.id)));
    const pool = available.length >= count ? available : this.quotes;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, count);

    for (const pick of picks) {
      this.addToHistory('quote', String(pick.id));
    }

    return picks;
  }

  getDailyTip(emotionType?: string): LocalTip {
    const filtered = emotionType
      ? this.tips.filter(t => t.emotion_type === emotionType)
      : this.tips;

    const pool = filtered.length > 0 ? filtered : this.tips;
    const history = this.getHistory('tip');
    const available = pool.filter(t => !history.includes(String(t.id)));
    const finalPool = available.length > 0 ? available : pool;

    const today = new Date().toDateString();
    const seed = this.hashCode(today + 'tip' + (emotionType || ''));
    const idx = Math.abs(seed) % finalPool.length;

    const pick = finalPool[idx];
    this.addToHistory('tip', String(pick.id));
    return pick;
  }

  getTipsByEmotionType(emotionType: string): LocalTip[] {
    return this.tips.filter(t => t.emotion_type === emotionType);
  }

  getRandomTip(): LocalTip {
    const idx = Math.floor(Math.random() * this.tips.length);
    return this.tips[idx];
  }

  getDailyActivity(activityType?: string): LocalActivity {
    const filtered = activityType
      ? this.activities.filter(a => a.activity_type === activityType)
      : this.activities;

    const pool = filtered.length > 0 ? filtered : this.activities;
    const history = this.getHistory('activity');
    const available = pool.filter(a => !history.includes(String(a.id)));
    const finalPool = available.length > 0 ? available : pool;

    const today = new Date().toDateString();
    const seed = this.hashCode(today + 'activity' + (activityType || ''));
    const idx = Math.abs(seed) % finalPool.length;

    const pick = finalPool[idx];
    this.addToHistory('activity', String(pick.id));
    return pick;
  }

  getActivitiesByType(activityType: string): LocalActivity[] {
    return this.activities.filter(a => a.activity_type === activityType);
  }

  getRandomActivity(): LocalActivity {
    const idx = Math.floor(Math.random() * this.activities.length);
    return this.activities[idx];
  }

  getAvailableQuotes(): LocalQuote[] {
    return this.quotes;
  }

  getAvailableTips(): LocalTip[] {
    return this.tips;
  }

  getAvailableActivities(): LocalActivity[] {
    return this.activities;
  }

  getQuotesByCategory(category: string): LocalQuote[] {
    return this.quotes.filter(q => q.category === category);
  }

  searchQuotes(term: string): LocalQuote[] {
    const lower = term.toLowerCase();
    return this.quotes.filter(
      q => q.quote.toLowerCase().includes(lower) || q.author.toLowerCase().includes(lower)
    );
  }

  searchTips(term: string): LocalTip[] {
    const lower = term.toLowerCase();
    return this.tips.filter(
      t => t.title.toLowerCase().includes(lower) || t.description.toLowerCase().includes(lower)
    );
  }

  searchActivities(term: string): LocalActivity[] {
    const lower = term.toLowerCase();
    return this.activities.filter(
      a => a.title.toLowerCase().includes(lower) || a.description.toLowerCase().includes(lower)
    );
  }

  private getHistory(type: string): string[] {
    try {
      const raw = localStorage.getItem(`${HISTORY_KEY}_${type}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private addToHistory(type: string, id: string): void {
    try {
      const history = this.getHistory(type);
      history.unshift(id);
      if (history.length > MAX_HISTORY) history.pop();
      localStorage.setItem(`${HISTORY_KEY}_${type}`, JSON.stringify(history));
    } catch { }
  }

  clearHistory(): void {
    ['emotion', 'quote', 'tip', 'activity'].forEach(type => {
      try {
        localStorage.removeItem(`${HISTORY_KEY}_${type}`);
      } catch { }
    });
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }

  private seededShuffle<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let m = shuffled.length;
    let s = seed;
    while (m) {
      m--;
      s = (s * 1664525 + 1013904223) & 0x7fffffff;
      const i = s % (m + 1);
      [shuffled[m], shuffled[i]] = [shuffled[i], shuffled[m]];
    }
    return shuffled;
  }
}
