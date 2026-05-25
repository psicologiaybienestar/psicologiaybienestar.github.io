import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';

export const platformGuard = () => {
  const router = inject(Router);
  try {
    if (Capacitor.getPlatform() === 'android') {
      router.navigate(['/']);
      return false;
    }
  } catch {
    // Web - always allowed
  }
  return true;
};
