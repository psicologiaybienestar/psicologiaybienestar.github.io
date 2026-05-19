import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  get isAndroid(): boolean {
    try {
      return Capacitor.getPlatform() === 'android';
    } catch {
      return false;
    }
  }

  get isWeb(): boolean {
    try {
      return Capacitor.getPlatform() === 'web';
    } catch {
      return true;
    }
  }
}
