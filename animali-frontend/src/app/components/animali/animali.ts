import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimaleService } from '../../services/animale';
import { AnimaleDto } from '../../dto/animale';
import { MappaComponent } from '../mappa-centri/mappa-centri'; // Importa la nuova mappa

@Component({
  selector: 'app-animali',
  standalone: true,
  imports: [CommonModule, FormsModule, MappaComponent],
  templateUrl: './animali.html',
  styleUrls: ['./animali.css'],
})
export class AnimaliComponent implements OnInit {
  private animaleService = inject(AnimaleService);

  animali = signal<AnimaleDto[]>([]);
  isLoading = signal(false);
  animaleSelezionato = signal<AnimaleDto | null>(null);
  selectedSpecie = signal('');
  selectedGenere = signal('');
  selectedCentroId = signal<number | null>(null);

  ngOnInit(): void {
    this.caricaTutti();
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
