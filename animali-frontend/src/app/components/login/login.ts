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

  // Gestione UI Reset Password e Reinvio Verifica
  showResendButton = signal(false);
  mostraResetForm = signal(false);
  isResetting = signal(false);

  // Dati per il reset (Email + Nuova Password scelta dall'utente)
  resetPayload = {
    email: '',
    password: '',
  };

  onLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.showResendButton.set(false);

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/animali']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 403) {
          this.errorMessage.set('Account non verificato. Controlla la tua email! 🐾');
          this.showResendButton.set(true);
        } else if (err.status === 401) {
          this.errorMessage.set('Email o password non corrette.');
        } else {
          this.errorMessage.set('Errore di connessione al server.');
        }
      },
    });
  }

  handleResend() {
    if (!this.loginData.email) return;

    this.isLoading.set(true);
    this.authService.resendVerification(this.loginData.email).subscribe({
      next: () => {
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

  inviaReset() {
    if (!this.resetPayload.email || !this.resetPayload.password) {
      alert('Inserisci email e la nuova password desiderata.');
      return;
    }

    if (this.resetPayload.password.length < 6) {
      alert('La password deve essere di almeno 6 caratteri.');
      return;
    }

    this.isResetting.set(true);
    this.authService.resetPassword(this.resetPayload.email, this.resetPayload.password).subscribe({
      next: (res) => {
        alert(res.message || 'Password aggiornata con successo! Ora puoi accedere.');
        this.isResetting.set(false);
        this.mostraResetForm.set(false);
        // Puliamo i campi dopo il successo
        this.loginData.email = this.resetPayload.email;
        this.resetPayload = { email: '', password: '' };
      },
      error: (err) => {
        const msg = err.error?.message || err.error || 'Errore durante il reset';
        alert(msg);
        this.isResetting.set(false);
      },
    });
  }
}
