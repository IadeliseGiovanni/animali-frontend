import { Component, OnInit, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimaleDto } from '../../dto/animale';
import { AnimaleService } from '../../services/animale';
import { CentroAdozioneService } from '../../services/centroadozione';
import { CentroAdozioneDto } from '../../dto/centroadozioni';

@Component({
  selector: 'app-gestione-animali',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestione-animali.html',
  styleUrl: './gestione-animali.css',
})
export class GestioneAnimaliComponent implements OnInit {
  private animaleService = inject(AnimaleService);
  private centroService = inject(CentroAdozioneService);

  animali = signal<AnimaleDto[]>([]);
  centri = signal<CentroAdozioneDto[]>([]);

  // Filtri UI
  filtroTesto = signal('');
  mostraSoloDisponibili = signal(false);
  filtroSpecie = signal('TUTTE');
  filtroCentroId = signal('TUTTI');
  paginaCorrente = signal(1);
  elementiPerPagina = 6;
  isSaving = signal(false);

  // Calcola la lista da visualizzare in base ai filtri
  animaliFiltrati = computed(() => {
    let lista = this.animali();
    const cerca = this.filtroTesto().toLowerCase().trim();
    const specie = this.filtroSpecie();
    const centroId = this.filtroCentroId();

    // 1. Filtro Disponibilità
    if (this.mostraSoloDisponibili()) {
      lista = lista.filter((a) => !a.adottato);
    }

    // 2. Filtro Specie
    if (specie !== 'TUTTE') {
      lista = lista.filter((a) => a.specie === specie);
    }

    // 3. Filtro Centro (converte in stringa per confronto sicuro)
    if (centroId !== 'TUTTI') {
      lista = lista.filter((a) => a.centroAdozione?.id?.toString() === centroId);
    }

    // 4. Filtro Ricerca Testuale (Nome o Microchip)
    if (cerca) {
      lista = lista.filter(
        (a) => a.nome?.toLowerCase().includes(cerca) || a.microchip?.includes(cerca),
      );
    }

    return lista;
  });

  constructor() {
    effect(() => {
      // Quando uno di questi cambia...
      this.filtroTesto();
      this.filtroSpecie();
      this.filtroCentroId();
      this.mostraSoloDisponibili();

      // ...riporta la visualizzazione all'inizio
      this.paginaCorrente.set(1);
    });
  }

  cambiaPagina(nuovaPagina: number) {
    // Verifica che la pagina sia valida (non minore di 1 e non superiore al totale)
    if (nuovaPagina >= 1 && nuovaPagina <= this.totalePagine()) {
      this.paginaCorrente.set(nuovaPagina);
    }
  }

  animaliPaginati = computed(() => {
    const inizio = (this.paginaCorrente() - 1) * this.elementiPerPagina;
    return this.animaliFiltrati().slice(inizio, inizio + this.elementiPerPagina);
  });

  totalePagine = computed(() => Math.ceil(this.animaliFiltrati().length / this.elementiPerPagina));

  nuovoAnimale = signal<Partial<AnimaleDto>>({
    id: undefined,
    nome: '',
    specie: 'Cane',
    microchip: '',
    genere: 'Maschio',
    descrizione: '',
    adottato: false,
    eta: 0,
    razza: '',
    fotoUrl: '',
    videoUrl: '',
    centroAdozione: undefined,
  });

  ngOnInit(): void {
    this.caricaAnimali();
    this.caricaCentri();
  }

  caricaAnimali() {
    this.animaleService.getAll().subscribe({
      next: (data) => this.animali.set(data),
      error: (err) => console.error('Errore nel caricamento animali', err),
    });
  }

  caricaCentri() {
    this.centroService.getAll().subscribe({
      next: (data) => this.centri.set(data),
      error: (err) => console.error('Errore nel caricamento centri', err),
    });
  }

  aggiungi() {
    const data = this.nuovoAnimale() as AnimaleDto;
    if (!data.nome || !data.specie || !data.microchip || !data.centroAdozione) {
      alert('Compila i campi obbligatori!');
      return;
    }

    this.isSaving.set(true);
    this.animaleService.insert(data).subscribe({
      next: (res) => {
        this.animali.update((list) => [res, ...list]); // Inserisci in testa
        this.resetForm();
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
        alert('Errore nel salvataggio');
      },
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Sei sicuro di voler eliminare questo animale?')) {
      this.animaleService.delete(id).subscribe({
        next: () => {
          this.animali.update((list) => list.filter((a) => a.id !== id));
        },
        error: (err) => alert("Errore durante l'eliminazione."),
      });
    }
  }

  private resetForm() {
    this.nuovoAnimale.set({
      nome: '',
      specie: 'Cane',
      microchip: '',
      genere: 'Maschio',
      descrizione: '',
      adottato: false,
      eta: 0,
      razza: '',
      fotoUrl: '',
      videoUrl: '',
      centroAdozione: undefined,
    });
  }
}
