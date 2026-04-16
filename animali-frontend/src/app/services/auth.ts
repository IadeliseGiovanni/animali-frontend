import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { LoginRequest, AuthResponse } from '../dto/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // 1. ASSICURATI CHE QUESTA RIGA ESISTA DENTRO LA CLASSE
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  isAuthenticated = signal<boolean>(
    isPlatformBrowser(this.platformId) ? !!localStorage.getItem('token') : false,
  );

  login(request: LoginRequest) {
    // 2. CONTROLLA CHE QUI CI SIA 'this.apiUrl' (case-sensitive)
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
        }
        this.isAuthenticated.set(true);
        this.router.navigate(['/animali']);
      }),
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  registraAdottante(data: any) {
    return this.http.post(`${this.apiUrl}/register/adottante`, data);
  }

  registraVolontario(data: any) {
    return this.http.post(`${this.apiUrl}/register/volontario`, data);
  }

  // auth.service.ts
  verifyEmail(token: string): Observable<any> {
    // Richiama l'endpoint che abbiamo creato nel backend
    return this.http.get(`${this.apiUrl}/verify?token=${token}`, { responseType: 'text' });
  }
}
