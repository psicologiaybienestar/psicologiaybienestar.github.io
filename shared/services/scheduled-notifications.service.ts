import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';
import { ContentEngineService } from './content-engine.service';

const SCHEDULE_KEY = 'pb_scheduled_date';

interface NotificationSchedule {
  id: number;
  title: string;
  bodyGetter: () => string;
  hour: number;
  minute: number;
  channel: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduledNotificationsService {
  private platform = inject(PlatformService);
  private engine = inject(ContentEngineService);

  private readonly DAILY_SCHEDULE: NotificationSchedule[] = [
    {
      id: 1,
      title: 'Buenos dias',
      bodyGetter: () => {
        const q = this.engine.getDailyQuote();
        return q?.quote ? `${q.quote} - ${q.author}` : 'Arranca tu dia con una sonrisa.';
      },
      hour: 9,
      minute: 0,
      channel: 'recordatorios',
    },
    {
      id: 2,
      title: 'Tiempo para ti',
      bodyGetter: () => {
        const a = this.engine.getDailyActivity();
        return a?.title ? `${a.title} (${a.duration} min) - ${a.description}` : 'Tomate un momento para respirar y relajarte.';
      },
      hour: 14,
      minute: 0,
      channel: 'recordatorios',
    },
    {
      id: 3,
      title: 'Reflexion nocturna',
      bodyGetter: () => {
        const t = this.engine.getDailyTip();
        return t?.title ? `${t.title}: ${t.description}` : 'Termina el dia en paz y agradece lo vivido.';
      },
      hour: 20,
      minute: 0,
      channel: 'recordatorios',
    },
  ];

  async scheduleDaily(): Promise<void> {
    const today = new Date().toDateString();
    const scheduled = this.getScheduledDate();
    if (scheduled === today) return;

    await this.engine.init();
    await this.cancelAll();

    const now = new Date();
    const notifications = this.DAILY_SCHEDULE
      .filter(s => {
        const fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), s.hour, s.minute, 0);
        return fireDate > now;
      })
      .map(s => {
        const now2 = new Date();
        const fireDate = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), s.hour, s.minute, 0);
        return {
          id: s.id,
          title: s.title,
          body: safeGetter(s.bodyGetter),
          schedule: { at: fireDate, repeats: false, allowWhileIdle: true },
          channelId: s.channel,
          smallIcon: 'ic_stat_icon',
          sound: 'beep.wav',
          actionTypeId: '',
          extra: { scheduled: true },
        };
      });

    if (notifications.length > 0) {
      await this.scheduleList(notifications);
    }

    this.saveScheduledDate(today);
  }

  private async scheduleList(notifications: any[]): Promise<void> {
    if (!this.platform.isAndroid || typeof (window as any).Capacitor === 'undefined') return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({ notifications });
    } catch { }
  }

  private async cancelAll(): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: this.DAILY_SCHEDULE.map(s => ({ id: s.id })) });
    } catch { }
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

function safeGetter(fn: () => string): string {
  try {
    return fn();
  } catch {
    return 'Tomate un momento para tu bienestar.';
  }
}

