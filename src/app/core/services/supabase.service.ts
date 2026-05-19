import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
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
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
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
      .eq('estado', 'publicado')
      .gte('fecha_inicio', new Date().toISOString())
      .order('fecha_inicio', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }
}
