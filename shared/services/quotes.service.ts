import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { ContentEngineService, LocalQuote } from './content-engine.service';
import { Quote } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private supabaseService = inject(SupabaseService);
  private engine = inject(ContentEngineService);
  private quotesSubject = new BehaviorSubject<(Quote | LocalQuote)[]>([]);
  quotes$ = this.quotesSubject.asObservable();

  private get supabase() {
    return this.supabaseService.client;
  }

  async getActivas(limit = 5): Promise<(Quote | LocalQuote)[]> {
    try {
      const { data, error } = await this.supabase
        .from('motivational_quotes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      const quotes = data || [];
      this.quotesSubject.next(quotes);
      return quotes;
    } catch {
      await this.engine.init();
      const local = this.engine.getRandomQuotes(limit);
      this.quotesSubject.next(local);
      return local;
    }
  }

  async getDaily(): Promise<LocalQuote> {
    await this.engine.init();
    return this.engine.getDailyQuote();
  }

  async search(term: string): Promise<LocalQuote[]> {
    await this.engine.init();
    return this.engine.searchQuotes(term);
  }

  async getByCategory(category: string): Promise<LocalQuote[]> {
    await this.engine.init();
    return this.engine.getQuotesByCategory(category);
  }

  subscribeToChanges(): any {
    return this.supabase
      .channel('quotes-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'motivational_quotes' },
        () => { this.getActivas(); }
      )
      .subscribe();
  }
}
