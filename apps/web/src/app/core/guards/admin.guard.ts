import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try {
    const user = await auth.getCurrentUser();
    if (!user) {
      router.navigate(['/admin/login']);
      return false;
    }
    const role = user.app_metadata?.['role'];
    if (role !== 'admin' && role !== 'editor') {
      router.navigate(['/']);
      return false;
    }
    return true;
  } catch {
    router.navigate(['/admin/login']);
    return false;
  }
};
