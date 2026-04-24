import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {} from '@angular/compiler';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reset-container">
      <h3>Imposta Nuova Password 🔒</h3>
      <p>Inserisci la tua nuova password per l'account PetFlow.</p>

      <input
        type="password"
        [(ngModel)]="nuovaPassword"
        class="form-control mb-3"
        placeholder="Nuova password"
      />

      <button (click)="conferma()" [disabled]="nuovaPassword.length < 6" class="btn btn-orange">
        Conferma Cambio
      </button>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private router = inject(Router);

  token: string = '';
  nuovaPassword: string = '';

  ngOnInit() {
    // Recupera il token dall'URL (?token=xxxx)
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      alert('Token mancante o non valido.');
      this.router.navigate(['/login']);
    }
  }

  conferma() {
    this.auth.confirmPasswordReset(this.token, this.nuovaPassword).subscribe({
      next: () => {
        alert('Password aggiornata con successo! Effettua il login.');
        this.router.navigate(['/login']);
      },
      error: () => alert('Il link è scaduto o non è valido.'),
    });
  }
}
