import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. Controllo fondamentale: siamo nel Browser?
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    if (token) {
      // Se il token esiste, l'utente DEVE poter passare.
      // Sincronizziamo il segnale se fosse rimasto indietro.
      if (!authService.isAuthenticated()) {
        authService.isAuthenticated.set(true);
      }
      return true;
    }
  } else {
    // 2. Se siamo sul Server (SSR), permettiamo il passaggio per evitare redirect infiniti
    // L'idratazione nel browser prenderà poi il controllo.
    return true;
  }

  // 3. Solo se siamo nel browser e NON c'è il token, allora facciamo il redirect
  router.navigate(['/login']);
  return false;
};
