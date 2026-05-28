import { Injectable, Inject, InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const SUPABASE_CONFIG = new InjectionToken<SupabaseConfig>('shared.supabase.config');

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(@Inject(SUPABASE_CONFIG) config: SupabaseConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
        autoRefreshToken: true,
        lock: <R>(_name: string, _timeout: number, fn: () => Promise<R>) => fn(),
      },
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async uploadImage(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;
    return data;
  }

  getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteImage(bucket: string, path: string) {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }

  async getLatestNoticias(limit = 3) {
    const { data, error } = await this.supabase
      .from('noticias')
      .select('*')
      .eq('estado', 'publicado')
      .order('fecha_publicacion', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async getProximosEventos(limit = 3) {
    const { data, error } = await this.supabase
      .from('eventos')
      .select('*')
      .in('estado', ['publicado', 'pospuesto'])
      .order('fecha_inicio', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }
}
