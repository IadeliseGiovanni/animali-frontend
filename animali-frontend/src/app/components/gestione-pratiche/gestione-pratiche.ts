import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PraticaService } from '../../services/pratica';
import { PraticaAdozioneDto } from '../../dto/pratica';

type StatoPratica = 'PENDING' | 'IN_VALUTAZIONE' | 'APPROVATA' | 'RIFIUTATA';

@Component({
  selector: 'app-gestione-pratiche',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestione-pratiche.html',
})
export class GestionePraticheComponent implements OnInit {
  private praticaService = inject(PraticaService);

  pratiche = signal<PraticaAdozioneDto[]>([]);
  searchQuery = signal('');
  filtroStato = signal<string>('TUTTI');
  filtroData = signal<string>('RECENTER');
  isLoading = signal(true);
  paginaCorrente = signal(1);
  elementiPerPagina = signal(12);

  // LOGICA DI FILTRAGGIO E ORDINAMENTO REATTIVA
  filteredPratiche = computed(() => {
    let list = this.pratiche();
    const query = this.searchQuery().toLowerCase();
    const stato = this.filtroStato();
    const ordine = this.filtroData();

    // 1. Filtro Testuale
    if (query) {
      list = list.filter(
        (p) =>
          p.adottanteNominativo?.toLowerCase().includes(query) ||
          p.animaleNome?.toLowerCase().includes(query),
      );
    }

    // 2. Filtro Stato
    if (stato !== 'TUTTI') {
      list = list.filter((p) => p.stato === stato);
    }

    // 3. Ordinamento per Data
    return [...list].sort((a, b) => {
      const dataA = new Date(a.dataApertura).getTime();
      const dataB = new Date(b.dataApertura).getTime();
      return ordine === 'RECENTER' ? dataB - dataA : dataA - dataB;
    });
  });

  pratichePaginate = computed(() => {
    const inizio = (this.paginaCorrente() - 1) * this.elementiPerPagina();
    const fine = inizio + this.elementiPerPagina();
    return this.filteredPratiche().slice(inizio, fine);
  });

  constructor() {
    // Reset automatico della pagina quando cambiano i filtri
    effect(() => {
      this.searchQuery();
      this.filtroStato();
      this.filtroData();

      this.paginaCorrente.set(1);
    });
  }

  ngOnInit() {
    this.caricaPratiche();
  }

  caricaPratiche() {
    this.isLoading.set(true);
    this.praticaService.getTutteLePraticheAdmin().subscribe({
      next: (data) => {
        this.pratiche.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  totalePagine = computed(() => {
    return Math.ceil(this.filteredPratiche().length / this.elementiPerPagina());
  });

  cambiaPagina(n: number) {
    if (n >= 1 && n <= this.totalePagine()) {
      this.paginaCorrente.set(n);
    }
  }

  aggiorna(id: number, nuovoStato: string) {
    const statoValidato = nuovoStato as StatoPratica;
    this.isLoading.set(true);

    this.praticaService.aggiornaStato(id, nuovoStato, 'Pratica elaborata con successo').subscribe({
      next: () => {
        this.pratiche.update((lista) =>
          lista.map((p) => (p.id === id ? { ...p, stato: statoValidato } : p)),
        );
        this.isLoading.set(false);
        if (nuovoStato === 'APPROVATA') {
          alert("Successo! Pratica approvata e contratto inviato via email all'adottante.");
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.error || "Errore durante l'aggiornamento.";
        alert(msg);
      },
    });
  }

  // Helpers grafici
  getLabelByStato(s: string) {
    if (s === 'APPROVATA') return 'APPROVATO';
    if (s === 'RIFIUTATA') return 'RIFIUTATO';
    return 'IN ATTESA';
  }

  getColorByStato(s: string) {
    if (s === 'APPROVATA') return '#d1e7dd';
    if (s === 'RIFIUTATA') return '#f8d7da';
    return '#fff3cd';
  }

  getTextColorByStato(s: string) {
    if (s === 'APPROVATA') return '#0f5132';
    if (s === 'RIFIUTATA') return '#842029';
    return '#664d03';
  }
}
