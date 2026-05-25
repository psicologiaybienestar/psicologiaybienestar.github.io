import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';
import { ContentEngineService } from './content-engine.service';

const SCHEDULE_KEY = 'pb_scheduled_date';

interface NotificationSchedule {
  id: number;
  title: string;
  body: string;
  hour: number;
  minute: number;
  channel: string;
}

const DAILY_SCHEDULE: NotificationSchedule[] = [
  {
    id: 1,
    title: 'Buenos días',
    body: '',
    hour: 9,
    minute: 0,
    channel: 'recordatorios',
  },
  {
    id: 2,
    title: 'Tiempo para ti',
    body: '',
    hour: 14,
    minute: 0,
    channel: 'recordatorios',
  },
  {
    id: 3,
    title: 'Reflexión nocturna',
    body: '',
    hour: 20,
    minute: 0,
    channel: 'recordatorios',
  },
];

@Injectable({ providedIn: 'root' })
export class ScheduledNotificationsService {
  private platform = inject(PlatformService);
  private engine = inject(ContentEngineService);

  async scheduleDaily(): Promise<void> {
    const today = new Date().toDateString();
    const scheduled = this.getScheduledDate();

    if (scheduled === today) return;

    await this.engine.init();
    await this.cancelAll();
    await this.scheduleAll();
    this.saveScheduledDate(today);
  }

  private async scheduleAll(): Promise<void> {
    if (!this.platform.isAndroid || typeof (window as any).Capacitor === 'undefined') return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      const pending = LocalNotifications.schedule({
        notifications: DAILY_SCHEDULE.map(s => {
          const now = new Date();
          const fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), s.hour, s.minute, 0);

          return {
            id: s.id,
            title: s.title,
            body: this.getBodyForId(s.id),
            schedule: { at: fireDate, repeats: false, allowWhileIdle: true },
            channelId: s.channel,
            smallIcon: 'ic_stat_icon',
            sound: 'beep.wav',
            actionTypeId: '',
            extra: { scheduled: true, type: s.id === 1 ? 'quote' : s.id === 2 ? 'activity' : 'tip' },
          };
        }),
      });
    } catch { }
  }

  private async cancelAll(): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: DAILY_SCHEDULE.map(s => ({ id: s.id })) });
    } catch { }
  }

  private getBodyForId(id: number): string {
    switch (id) {
      case 1: {
        const quote = this.engine.getDailyQuote();
        return `${quote.quote} — ${quote.author}`;
      }
      case 2: {
        const activity = this.engine.getDailyActivity();
        return `${activity.title} (${activity.duration} min) — ${activity.description}`;
      }
      case 3: {
        const tip = this.engine.getDailyTip();
        return `${tip.title}: ${tip.description}`;
      }
      default:
        return 'Tómate un momento para tu bienestar';
    }
  }

  private getScheduledDate(): string | null {
    try {
      return localStorage.getItem(SCHEDULE_KEY);
    } catch {
      return null;
    }
  }

  private saveScheduledDate(date: string): void {
    try {
      localStorage.setItem(SCHEDULE_KEY, date);
    } catch { }
  }

  clearSchedule(): void {
    this.cancelAll();
    try {
      localStorage.removeItem(SCHEDULE_KEY);
    } catch { }
  }
}
