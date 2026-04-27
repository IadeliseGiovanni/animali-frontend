import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentroAdozioneService } from '../../services/centroadozione';
import { CentroAdozioneDto } from '../../dto/centroadozioni';
import { MappaComponent } from '../mappa-centri/mappa-centri'; // Importa il componente!

@Component({
  selector: 'app-centro-adozione',
  standalone: true,
  imports: [CommonModule, FormsModule, MappaComponent], // Aggiungilo agli imports
  templateUrl: './centroadozione.html',
  styleUrl: './centroadozione.css',
})
export class CentroAdozioneComponent implements OnInit {
  private centroService = inject(CentroAdozioneService);

  isLoading = signal(false);
  cercaCitta = signal('');
  centriCompleti = signal<CentroAdozioneDto[]>([]);
  paginaCorrente = signal(1);
  elementiPerPagina = signal(5);

  totalePagine = computed(() => Math.ceil(this.centriFiltrati().length / this.elementiPerPagina()));

  centriPaginati = computed(() => {
    const inizio = (this.paginaCorrente() - 1) * this.elementiPerPagina();
    const fine = inizio + this.elementiPerPagina();
    return this.centriFiltrati().slice(inizio, fine);
  });

  cambiaPagina(nuovaPagina: number) {
    if (nuovaPagina >= 1 && nuovaPagina <= this.totalePagine()) {
      this.paginaCorrente.set(nuovaPagina);
    }
  }

  constructor() {
    effect(() => {
      this.cercaCitta();
      this.paginaCorrente.set(1);
    });
  }

  nuovoCentro = signal<Partial<CentroAdozioneDto>>({
    nomeCentro: '',
    citta: '',
    indirizzo: '',
    capacitaMassima: 0,
    latitudine: 41.9028,
    longitudine: 12.4964,
    isNoProfit: false,
  });

  centriFiltrati = computed(() => {
    const q = this.cercaCitta().toLowerCase().trim();
    const tutti = this.centriCompleti(); // Prendi il valore attuale

    if (!q) return tutti;

    return tutti.filter(
      (c) => c.citta?.toLowerCase().includes(q) || c.nomeCentro?.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.caricaTutti();
  }

  caricaTutti() {
    this.centroService.getAll().subscribe({
      next: (data) => this.centriCompleti.set(data),
    });
  }

  aggiungiCentro() {
    this.centroService.creaCentro(this.nuovoCentro() as CentroAdozioneDto).subscribe({
      next: () => {
        this.resetForm();
        this.caricaTutti();
        // Nota: MappaComponent ricaricherà i marker automaticamente al suo interno
        // perché chiama il servizio getAll() al suo init.
      },
    });
  }

  resetForm() {
    this.nuovoCentro.set({
      nomeCentro: '',
      citta: '',
      indirizzo: '',
      capacitaMassima: 0,
      latitudine: 41.9028,
      longitudine: 12.4964,
      isNoProfit: false,
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Sei sicuro di voler eliminare questo centro?')) {
      this.centroService.delete(id).subscribe({
        next: () => {
          // Aggiorniamo centriCompleti: centriFiltrati reagirà automaticamente!
          this.centriCompleti.update((list) => list.filter((v) => v.id !== id));
        },
        error: (err) => alert("Errore durante l'eliminazione."),
      });
    }
  }
}
