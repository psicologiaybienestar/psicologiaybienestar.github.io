import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InternalNotificationsService } from '../../core/services/internal-notifications.service';

@Component({
  selector: 'app-floating-notif',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="fixed bottom-24 right-6 z-40">
      <button (click)="toggle()" class="bg-white p-3.5 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors relative group" aria-label="Novedades">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        @if (unreadCount > 0) {
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        }
        <span class="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
          Novedades
        </span>
      </button>

      @if (open) {
        <div class="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div class="p-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
            <span class="text-sm font-semibold text-gray-800">Novedades</span>
            <div class="flex items-center gap-1">
              @if (unreadCount > 0) {
                <button (click)="markAll(); $event.stopPropagation()" class="text-xs text-primary font-semibold hover:underline whitespace-nowrap">Leer todo</button>
              }
              @if (list.length > 0) {
                <button (click)="deleteAllRead(); $event.stopPropagation()" class="text-xs text-gray-400 hover:text-red-500 ml-1" title="Vaciar leídas"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
              }
              <button (click)="open = false" class="text-gray-400 hover:text-gray-600 ml-1 text-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
          </div>
          @if (list.length === 0) {
            <div class="p-6 text-center text-sm text-gray-400">Sin novedades</div>
          }
          @for (n of list; track n.id) {
            <div class="flex gap-3 p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors" [class.bg-blue-50]="!n.is_read">
              <div class="flex-1 min-w-0 cursor-pointer" (click)="markRead(n.id)">
                <span class="text-lg shrink-0 mr-2">{{ icon(n.type) }}</span>
                <span class="text-sm font-medium text-gray-800">{{ n.title }}</span>
                @if (n.body) {
                  <p class="text-xs text-gray-500 truncate mt-0.5">{{ n.body }}</p>
                }
                <p class="text-[10px] text-gray-400 mt-0.5">{{ n.created_at | date:'dd MMM HH:mm' }}</p>
              </div>
              <button (click)="deleteOne(n.id); $event.stopPropagation()" class="text-gray-300 hover:text-red-500 text-xs shrink-0 self-start mt-1" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class FloatingNotifComponent implements OnInit, OnDestroy {
  private notifService = inject(InternalNotificationsService);
  open = false;
  unreadCount = 0;
  list: any[] = [];
  private channel: any;

  ngOnInit() {
    this.load();
    this.channel = this.notifService.subscribeToNew(() => this.load());
  }

  ngOnDestroy() {
    this.channel?.unsubscribe();
  }

  private async load() {
    try {
      this.unreadCount = await this.notifService.getUnreadCount();
      this.list = await this.notifService.getLatest(10);
    } catch { /* ignore */ }
  }

  toggle() { this.open = !this.open; }

  async markRead(id: string) {
    await this.notifService.markAsRead(id);
    this.load();
  }

  async markAll() {
    await this.notifService.markAllAsRead();
    this.load();
  }

  async deleteOne(id: string) {
    await this.notifService.deleteNotification(id);
    this.load();
  }

  async deleteAllRead() {
    await this.notifService.deleteAllRead();
    this.load();
  }

  icon(type: string): string {
    const m: Record<string, string> = {
      eventos: 'calendar-outline', noticias: 'newspaper-outline', motivational_quotes: 'chatbubbles-outline',
      emotional_tips: 'bulb-outline', wellness_activities: 'leaf-outline', mini_games: 'game-controller-outline',
      emotions: 'happy-outline',
    };
    return m[type] || 'notifications-outline';
  }
}
