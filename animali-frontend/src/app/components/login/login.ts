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
          this.errorMessage.set('Account non verificato. Controlla la tua email! 🐶');
          this.showResendButton.set(true); // Mostra il tasto se l'errore è 403
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
    if (!this.resetPayload.email) {
      alert("Inserisci l'email per ricevere il link di reset.");
      return;
    }

    this.isResetting.set(true);

    // Chiamiamo il metodo che invia solo l'email al backend
    this.authService.requestResetLink(this.resetPayload.email).subscribe({
      next: (res) => {
        alert("Ti abbiamo inviato un'email con il link per resettare la password! 🐾");
        this.isResetting.set(false);
        this.mostraResetForm.set(false); // Chiudiamo il form
        this.resetPayload.email = ''; // Puliamo il campo
      },
      error: (err) => {
        this.isResetting.set(false);
        alert("Errore: assicurati che l'email sia corretta.");
      },
    });
  }
}
