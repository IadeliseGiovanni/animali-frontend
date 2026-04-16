import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../dto/auth';
import { Router } from 'express';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);

  // Dati del form
  loginData: LoginRequest = { email: '', password: '' };

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // Qui solitamente reindirizzi alla home degli animali
        // this.router.navigate(['/animali']);
      },
      error: (err) => {
        this.isLoading.set(false);

        // GESTIONE ERRORI SPECIFICI
        if (err.status === 403) {
          // L'utente è autenticato ma NON è abilitato (email non verificata)
          this.errorMessage.set(
            'Account non verificato. Controlla la tua email per attivare il profilo! 🐾',
          );
        } else if (err.status === 401) {
          // Email o password errate
          this.errorMessage.set('Email o password non corrette.');
        } else {
          // Errore generico (server offline, etc.)
          this.errorMessage.set('Si è verificato un errore. Riprova più tardi.');
        }

        console.error('Login Error:', err);
      },
    });
  }
}
