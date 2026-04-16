import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Stato reattivo per il ruolo selezionato
  ruolo = signal<'adottante' | 'volontario'>('adottante');

  // Dati del form
  form = {
    nome: '',
    email: '',
    password: '',
  };

  onRegister(event: Event) {
    event.preventDefault();

    // Sceglie l'endpoint in base al ruolo selezionato
    const registerObs =
      this.ruolo() === 'adottante'
        ? this.authService.registraAdottante(this.form)
        : this.authService.registraVolontario(this.form);

    registerObs.subscribe({
      next: (response) => {
        console.log('Registrazione completata:', response);
        alert('Registrazione riuscita! Adesso puoi accedere.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Errore durante la registrazione:', err);
        alert(err.error || 'Si è verificato un errore durante la registrazione.');
      },
    });
  }
}
