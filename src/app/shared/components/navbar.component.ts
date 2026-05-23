import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { InternalNotificationsService } from '../../core/services/internal-notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DatePipe, IonHeader, IonToolbar, IonButtons, IonMenuButton],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="px-4" style="--background: #ffffff; --border-width: 0;">
        <div class="flex items-center justify-between h-16 max-w-7xl mx-auto w-full">
          <a routerLink="/inicio" class="flex items-center gap-3 shrink-0">
            <img src="assets/img/logo.png" alt="Psicología & Bienestar" class="h-10 w-auto" />
            <span class="hidden sm:block text-primary font-semibold text-base lg:text-lg tracking-tight">Psicología &amp; Bienestar</span>
          </a>

          <nav class="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a routerLink="/inicio" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Inicio</a>
            <a routerLink="/galeria" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Galería</a>
            <a routerLink="/testimonios" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Testimonios</a>
            <a routerLink="/noticias" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Noticias</a>
            <a routerLink="/eventos" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Eventos</a>
            <a routerLink="/servicio-empresarial" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Empresarial</a>
            <a routerLink="/contacto" routerLinkActive="text-primary font-semibold" class="text-gray-700 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Contacto</a>
            <div class="relative">
              <button (click)="toggleNotif()" class="text-gray-500 hover:text-primary transition-colors duration-300 relative" title="Novedades">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                @if (unreadCount > 0) {
                  <span class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
                }
              </button>
              @if (showNotifDropdown) {
                <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                  <div class="p-3 border-b border-gray-100 flex items-center justify-between">
                    <span class="text-sm font-semibold text-gray-800">Novedades</span>
                    @if (unreadCount > 0) {
                      <button (click)="markAllRead()" class="text-xs text-primary font-semibold hover:underline">Marcar todo leído</button>
                    }
                  </div>
                  @if (notifList.length === 0) {
                    <div class="p-6 text-center text-sm text-gray-400">Sin novedades</div>
                  }
                  @for (n of notifList; track n.id) {
                    <div class="flex gap-3 p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors" [class.bg-blue-50]="!n.is_read" (click)="markRead(n.id)">
                      <span class="text-lg flex-shrink-0">{{ getIcon(n.type) }}</span>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-800 truncate">{{ n.title }}</p>
                        @if (n.body) {
                          <p class="text-xs text-gray-500 truncate">{{ n.body }}</p>
                        }
                        <p class="text-[10px] text-gray-400 mt-0.5">{{ n.created_at | date:'dd MMM HH:mm' }}</p>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            <a routerLink="/admin/login" class="text-gray-400 hover:text-primary transition-colors duration-300 text-sm lg:text-base" title="Administración">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </a>
          </nav>

          <ion-buttons slot="end" class="md:hidden">
            <ion-menu-button style="--color: #627eff;" class="text-2xl"></ion-menu-button>
          </ion-buttons>
        </div>
      </ion-toolbar>
    </ion-header>
  `,
})
export class NavbarComponent implements OnInit, OnDestroy {
  private notifService = inject(InternalNotificationsService);
  unreadCount = 0;
  notifList: any[] = [];
  showNotifDropdown = false;
  private channel: any;

  ngOnInit() {
    this.loadNotifs();
    this.channel = this.notifService.subscribeToNew(() => this.loadNotifs());

    document.addEventListener('click', this.handleClickOutside);
  }

  ngOnDestroy() {
    this.channel?.unsubscribe();
    document.removeEventListener('click', this.handleClickOutside);
  }

  private async loadNotifs() {
    try {
      this.unreadCount = await this.notifService.getUnreadCount();
      this.notifList = await this.notifService.getLatest(10);
    } catch { /* ignore */ }
  }

  toggleNotif() {
    this.showNotifDropdown = !this.showNotifDropdown;
  }

  async markRead(id: string) {
    await this.notifService.markAsRead(id);
    this.loadNotifs();
  }

  async markAllRead() {
    await this.notifService.markAllAsRead();
    this.loadNotifs();
  }

  private handleClickOutside = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showNotifDropdown = false;
    }
  };

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      eventos: '📅', noticias: '📰', motivational_quotes: '💬',
      emotional_tips: '💡', wellness_activities: '🧘', mini_games: '🎮',
      emotions: '😊',
    };
    return icons[type] || '🔔';
  }
}
