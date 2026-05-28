import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private supabaseService = inject(SupabaseService);

  private get supabase() {
    return this.supabaseService.client;
  }

  async autoFinalize(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('auto_finalize_eventos');
      if (error) {
        console.warn('[Eventos] autoFinalize RPC error:', error.message);
        return 0;
      }
      if (typeof data === 'number' && data > 0) {
        console.log(`[Eventos] Auto-finalizados: ${data} eventos`);
      }
      return data ?? 0;
    } catch (e: any) {
      console.warn('[Eventos] autoFinalize exception:', e?.message);
      return 0;
    }
  }
}
