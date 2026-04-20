import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../dto/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData: LoginRequest = { email: '', password: '' };
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Aggiungiamo questo signal per controllare la visibilità del tasto reinvio
  showResendButton = signal(false);

  onLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.showResendButton.set(false); // Reset al nuovo tentativo

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/animali']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 403) {
          this.errorMessage.set('Account non verificato. Controlla la tua email! 🐾');
          this.showResendButton.set(true); // Mostra il tasto se l'errore è 403
        } else if (err.status === 401) {
          this.errorMessage.set('Email o password non corrette.');
        } else {
          this.errorMessage.set('Errore di connessione al server.');
        }
      },
    });
  }

  // Metodo per gestire il reinvio dell'email
  handleResend() {
    if (!this.loginData.email) return;

    this.isLoading.set(true);
    // Assicurati di aver aggiunto resendVerification nel tuo AuthService
    this.authService.resendVerification(this.loginData.email).subscribe({
      next: (msg) => {
        this.isLoading.set(false);
        this.errorMessage.set('Email di verifica inviata con successo! 📧');
        this.showResendButton.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Errore nel reinvio: ' + (err.error || 'riprova più tardi.'));
      },
    });
  }
}
