import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { MiniGame } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class MiniGamesService {
  private supabaseService = inject(SupabaseService);
  private gamesSubject = new BehaviorSubject<MiniGame[]>([]);
  games$ = this.gamesSubject.asObservable();

  private get supabase() {
    return this.supabaseService.client;
  }

  async getActivos(limit = 3, tipo?: string): Promise<MiniGame[]> {
    let query = this.supabase
      .from('mini_games')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (tipo) {
      query = query.eq('game_type', tipo);
    }
    const { data, error } = await query;
    if (error) throw error;
    const games = data || [];
    this.gamesSubject.next(games);
    return games;
  }

  subscribeToChanges(): any {
    return this.supabase
      .channel('games-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mini_games' },
        () => { this.getActivos(); }
      )
      .subscribe();
  }
}
