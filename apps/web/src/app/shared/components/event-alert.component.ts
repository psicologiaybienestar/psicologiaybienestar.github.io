import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonModal } from '@ionic/angular/standalone';
import { SupabaseService } from '../../core/services/supabase.service';

const DISMISSED_KEY = 'pb_dismissed_events';

@Component({
  selector: 'app-event-alert',
  standalone: true,
  imports: [DatePipe, RouterLink, IonModal],
  template: `
    <ion-modal [isOpen]="isOpen" [backdropDismiss]="false" class="event-alert-modal">
      <ng-template>
        <div class="bg-white">
          <div class="bg-gradient-to-r from-primary to-secondary px-6 pt-8 pb-6 text-white text-center">
            <div class="text-4xl mb-2">🎉</div>
            <h2 class="text-2xl font-bold">¡Nuevo Evento!</h2>
            <p class="text-white/80 text-sm mt-1">Tenemos un evento nuevo para ti</p>
          </div>
          @if (currentEvent) {
            <div class="px-6 pb-6 pt-5">
              <div class="flex items-center gap-3 bg-blue-50 rounded-xl p-4 mb-4">
                <div class="bg-white rounded-lg p-3 text-center min-w-[60px] shadow-sm">
                  <div class="text-xl font-bold text-primary">{{ currentEvent.fecha_inicio | date:'dd' }}</div>
                  <div class="text-xs text-gray-500 uppercase">{{ currentEvent.fecha_inicio | date:'MMM' }}</div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-800 text-base">{{ currentEvent.titulo }}</h3>
                  <p class="text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ currentEvent.fecha_inicio | date:'shortTime' }}
                  </p>
                </div>
              </div>
              @if (currentEvent.descripcion) {
                <p class="text-gray-600 text-sm leading-relaxed mb-5">{{ currentEvent.descripcion }}</p>
              }
              <div class="flex gap-3">
                <button (click)="dismiss()"
                  class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all duration-200">
                  Cerrar
                </button>
                <a routerLink="/eventos" (click)="dismiss()"
                  class="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl text-center hover:shadow-lg active:scale-[0.98] transition-all duration-200">
                  Ver evento
                </a>
              </div>
            </div>
          }
        </div>
      </ng-template>
    </ion-modal>
  `,
})
export class EventAlertComponent implements OnInit {
  isOpen = false;
  currentEvent: any = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.checkNewEvent();
  }

  private async checkNewEvent() {
    try {
      const eventos = await this.supabaseService.getProximosEventos(1);
      if (eventos.length > 0) {
        const evento = eventos[0];
        const dismissed = this.getDismissed();
        if (!dismissed.includes(evento.id)) {
          this.currentEvent = evento;
          this.isOpen = true;
        }
      }
    } catch {
      // Silently handle
    }
  }

  dismiss() {
    if (this.currentEvent) {
      const dismissed = this.getDismissed();
      dismissed.push(this.currentEvent.id);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    }
    this.isOpen = false;
    this.currentEvent = null;
  }

  private getDismissed(): string[] {
    try {
      const val = localStorage.getItem(DISMISSED_KEY);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }
}
