import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Se siamo nel browser
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    if (token) {
      // Se c'è un token ma per qualche motivo il segnale è false, lo forziamo
      if (!authService.isAuthenticated()) {
        authService.isAuthenticated.set(true);
      }
      return true; // Passa pure!
    }
  }

  // Fallback se non c'è token o non siamo nel browser
  if (authService.isAuthenticated()) {
    return true;
  }

  // Se arriviamo qui, l'utente non è davvero loggato
  router.navigate(['/login']);
  return false;
};
