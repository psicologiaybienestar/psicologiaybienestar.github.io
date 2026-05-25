import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { SUPABASE_CONFIG, SupabaseService } from '@shared/services/supabase.service';
import { GOOGLE_SHEETS_URL, TestimoniosService } from '@shared/services/testimonios.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular({ mode: 'md' }),
    provideHttpClient(),
    provideAnimations(),
    { provide: SUPABASE_CONFIG, useValue: { supabaseUrl: environment.supabaseUrl, supabaseAnonKey: environment.supabaseAnonKey } },
    SupabaseService,
    { provide: GOOGLE_SHEETS_URL, useValue: environment.googleSheetsUrl },
    TestimoniosService,
  ],
};
