import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { WellnessActivity } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class WellnessActivitiesService {
  private supabaseService = inject(SupabaseService);
  private activitiesSubject = new BehaviorSubject<WellnessActivity[]>([]);
  activities$ = this.activitiesSubject.asObservable();

  private get supabase() {
    return this.supabaseService.client;
  }

  async getActivas(limit = 4, tipo?: string): Promise<WellnessActivity[]> {
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
