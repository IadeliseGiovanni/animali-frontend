import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimaleService } from '../../services/animale'; // Controlla il path
import { AnimaleDto } from '../../dto/animale'; // Controlla il path

@Component({
  selector: 'app-animali',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importanti per il funzionamento di @if, @for e ngModel
  templateUrl: './animali.html',
  styleUrls: ['./animali.css'],
})
export class AnimaliComponent implements OnInit {
  private animaleService = inject(AnimaleService);

  // Signals per la gestione dello stato
  animali = signal<AnimaleDto[]>([]);
  isLoading = signal(false);

  // Signal per l'animale selezionato (la "finestra" eBay)
  animaleSelezionato = signal<AnimaleDto | null>(null);
  selectedSpecie = signal<string>('');
  selectedGenere = signal<string>('');

  ngOnInit(): void {
    this.caricaTutti();
  }

  caricaTutti(): void {
    this.isLoading.set(true);
    this.animaleService.getAll().subscribe({
      next: (data) => {
        this.animali.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento:', err);
        this.isLoading.set(false);
      },
    });
  }

  // Metodo per aprire la modale
  apriDettagli(animale: AnimaleDto): void {
    console.log('Card cliccata:', animale);
    this.animaleSelezionato.set(animale);
  }

  // Metodo per chiudere la modale
  chiudiDettagli(): void {
    this.animaleSelezionato.set(null);
  }

  // Logica per i filtri (Specie)
  onFilterChange() {
    this.isLoading.set(true);
    // Usiamo i valori attuali dei nostri signals dei filtri
    this.animaleService.getFiltered(this.selectedSpecie(), this.selectedGenere()).subscribe({
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
    this.caricaTutti();
  }
}
