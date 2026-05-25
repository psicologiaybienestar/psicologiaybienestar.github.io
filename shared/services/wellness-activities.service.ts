import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { ContentEngineService, LocalActivity } from './content-engine.service';
import { WellnessActivity } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class WellnessActivitiesService {
  private supabaseService = inject(SupabaseService);
  private engine = inject(ContentEngineService);
  private activitiesSubject = new BehaviorSubject<(WellnessActivity | LocalActivity)[]>([]);
  activities$ = this.activitiesSubject.asObservable();

  private get supabase() {
    return this.supabaseService.client;
  }

  async getActivas(limit = 4, tipo?: string): Promise<(WellnessActivity | LocalActivity)[]> {
    try {
      let query = this.supabase
        .from('wellness_activities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (tipo) {
        query = query.eq('activity_type', tipo);
      }
      const { data, error } = await query;
      if (error) throw error;
      const activities = data || [];
      this.activitiesSubject.next(activities);
      return activities;
    } catch {
      await this.engine.init();
      const local = tipo
        ? this.engine.getActivitiesByType(tipo)
        : this.engine.getAvailableActivities();
      const selected = local.sort(() => Math.random() - 0.5).slice(0, limit);
      this.activitiesSubject.next(selected);
      return selected;
    }
  }

  async getDaily(activityType?: string): Promise<LocalActivity> {
    await this.engine.init();
    return this.engine.getDailyActivity(activityType);
  }

  async search(term: string): Promise<LocalActivity[]> {
    await this.engine.init();
    return this.engine.searchActivities(term);
  }

  subscribeToChanges(): any {
    return this.supabase
      .channel('activities-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wellness_activities' },
        () => { this.getActivas(); }
      )
      .subscribe();
  }
}
