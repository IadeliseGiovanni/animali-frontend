import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimaleService } from '../../services/animale';
import { AnimaleDto } from '../../dto/animale';
import { MappaComponent } from '../mappa-centri/mappa-centri'; // Importa la nuova mappa
import { PraticaService } from '../../services/pratica';

@Component({
  selector: 'app-animali',
  standalone: true,
  imports: [CommonModule, FormsModule, MappaComponent],
  templateUrl: './animali.html',
  styleUrls: ['./animali.css'],
})
export class AnimaliComponent implements OnInit {
  private animaleService = inject(AnimaleService);
  private praticaService = inject(PraticaService);

  isSendingPratica = signal(false);
  animali = signal<AnimaleDto[]>([]);
  isLoading = signal(false);
  animaleSelezionato = signal<AnimaleDto | null>(null);
  selectedSpecie = signal('');
  selectedGenere = signal('');
  selectedCentroId = signal<number | null>(null);

  ngOnInit(): void {
    this.caricaTutti();
  }

  avviaPratica(animaleId: number) {
    if (this.isSendingPratica()) return;

    this.isSendingPratica.set(true);

    this.praticaService.avviaPratica(animaleId).subscribe({
      next: (res) => {
        alert('Richiesta inviata con successo! Il centro adozioni esaminerà la tua pratica.');
        this.isSendingPratica.set(false);
        this.chiudiDettagli(); // Chiude la modale dopo il successo
      },
      error: (err) => {
        // Qui catturiamo i messaggi di errore inviati dal backend (es. "Non sei idoneo")
        const messaggioErrore =
          err.error || "Si è verificato un errore durante l'avvio della pratica.";
        alert(messaggioErrore);
        this.isSendingPratica.set(false);
      },
    });
  }

  caricaTutti() {
    this.selectedCentroId.set(null);
    this.isLoading.set(true);
    this.animaleService.getAll().subscribe({
      next: (data) => {
        this.animali.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  filtraPerCentro(idCentro: number) {
    this.selectedCentroId.set(idCentro);
    this.onFilterChange(); // Usa la logica centralizzata dei filtri
  }

  onFilterChange() {
    this.isLoading.set(true);

    // Ora TypeScript non si lamenterà più dei 3 argomenti
    this.animaleService
      .getFiltered(
        this.selectedSpecie(),
        this.selectedGenere(),
        this.selectedCentroId(), // Questo ora viene passato correttamente al service
      )
      .subscribe({
        next: (data) => {
          this.animali.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  resetFiltri() {
    this.selectedSpecie.set('');
    this.selectedGenere.set('');
    this.selectedCentroId.set(null);
    this.caricaTutti();
  }

  apriDettagli(a: AnimaleDto) {
    console.log('Dati animale ricevuto:', a);
    this.animaleSelezionato.set(a);
  }
  chiudiDettagli() {
    this.animaleSelezionato.set(null);
  }
}
