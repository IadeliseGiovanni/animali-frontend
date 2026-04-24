import { inject, Injectable, signal, PLATFORM_ID, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { LoginRequest, AuthResponse } from '../dto/auth';
import { Router } from '@angular/router';

export interface UserProfile {
  nome: string;
  email: string;
  ruolo?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  // Stato autenticazione basato sulla presenza del token
  isAuthenticated = signal<boolean>(
    isPlatformBrowser(this.platformId) ? !!localStorage.getItem('token') : false,
  );

  // Stato profilo utente caricato dal localStorage o null
  private userProfile = signal<UserProfile | null>(
    isPlatformBrowser(this.platformId) && localStorage.getItem('user_profile')
      ? JSON.parse(localStorage.getItem('user_profile')!)
      : null,
  );

  currentUser = computed(() => this.userProfile());

  // Getter reattivo per controllare se l'utente è ADMIN
  isAdmin = computed(() => {
    const user = this.userProfile();
    return user?.ruolo?.toUpperCase() === 'ADMIN';
  });

  constructor() {
    // Se l'utente è autenticato ma il profilo è vuoto (es. dopo un refresh), lo recupera dal JWT
    if (this.isAuthenticated() && !this.userProfile()) {
      this.loadUserProfile();
    }
  }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);

          const profile: UserProfile = {
            nome: response.nome || 'Utente',
            email: request.email,
            ruolo: response.ruolo,
          };

          localStorage.setItem('user_profile', JSON.stringify(profile));
          this.userProfile.set(profile);
          this.isAuthenticated.set(true);
        }
        this.router.navigate(['/animali']);
      }),
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.userProfile.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private loadUserProfile() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decodifica il payload del JWT (Base64)
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = payload.ruolo || payload.role || payload.authority || 'USER';
          const profile: UserProfile = {
            nome: payload.nome || 'Utente',
            email: payload.sub || payload.email,
            ruolo: role,
          };

          this.userProfile.set(profile);
          localStorage.setItem('user_profile', JSON.stringify(profile));
        } catch (e) {
          console.error('Errore decodifica token:', e);
          this.logout();
        }
      }
    }
  }

  /**
   * CHANGE PASSWORD: Usato quando l'utente È loggato.
   * Richiede la vecchia password per sicurezza.
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  // Registrazione e Verifiche
  registraAdottante(data: any) {
    return this.http.post(`${this.apiUrl}/register/adottante`, data);
  }

  registraVolontario(data: any) {
    return this.http.post(`${this.apiUrl}/register/volontario`, data);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify?token=${token}`, { responseType: 'text' });
  }

  resendVerification(email: string) {
    return this.http.post(
      `${this.apiUrl}/resend-verification?email=${email}`,
      {},
      { responseType: 'text' },
    );
  }

  requestResetLink(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/forgot-password?email=${email}`,
      {},
      { responseType: 'text' },
    );
  }

  /**
   * STEP 2: Invia il token ricevuto via mail e la nuova password scelta.
   */
  confirmPasswordReset(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password-confirm`, {
      token: token,
      newPassword: newPassword, // Deve essere newPassword, NON nuovaPassword o password
    });
  }
}
