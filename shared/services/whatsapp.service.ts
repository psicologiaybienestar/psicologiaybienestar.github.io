import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private defaultPhone = '573164603881';
  private baseUrl = 'https://wa.me/';

  getLink(phone?: string, message?: string): string {
    const p = phone || this.defaultPhone;
    const url = `${this.baseUrl}${p}`;
    if (message) {
      return `${url}?text=${encodeURIComponent(message)}`;
    }
    return url;
  }

  openChat(message?: string): void {
    const url = this.getLink(undefined, message);
    window.open(url, '_blank');
  }

  openAppointmentReminder(date: string, time: string): void {
    const msg = `Hola, recordatorio: tienes una cita agendada para el ${date} a las ${time}.`;
    this.openChat(msg);
  }

  openConfirmation(name: string, date: string, time: string): void {
    const msg = `Hola ${name}, tu cita ha sido confirmada para el ${date} a las ${time}. ¡Te esperamos!`;
    this.openChat(msg);
  }
}
