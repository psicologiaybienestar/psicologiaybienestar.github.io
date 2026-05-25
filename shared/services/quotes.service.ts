import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Quote } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private supabaseService = inject(SupabaseService);
  private quotesSubject = new BehaviorSubject<Quote[]>([]);
  quotes$ = this.quotesSubject.asObservable();

  private get supabase() {
    return this.supabaseService.client;
  }

  async getActivas(limit = 5): Promise<Quote[]> {
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
