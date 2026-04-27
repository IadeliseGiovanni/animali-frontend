import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitaMedicaService } from '../../services/visitamedica';
import { AnimaleService } from '../../services/animale';
import { VisitaMedicaDto } from '../../dto/visitamedica';
import { AnimaleDto } from '../../dto/animale';

@Component({
  selector: 'app-visita-medica',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './visitamedica.html',
  styleUrl: './visitamedica.css',
})
export class VisitaMedicaComponent implements OnInit {
  private visitaService = inject(VisitaMedicaService);
  private animaleService = inject(AnimaleService);

  // Dati
  visite = signal<VisitaMedicaDto[]>([]);
  elencoAnimali = signal<AnimaleDto[]>([]);

  // --- PAGINAZIONE ---
  currentPage = signal(1);
  pageSize = signal(5); // Elementi per pagina

  // Filtri
  filtroAnimale = signal('');
  termineRicercaVisite = signal('');
  filtroVeterinario = signal('');

  // 1. Ricerca rapida animali (per il form)
  animaliFiltrati = computed(() => {
    const term = this.filtroAnimale().toLowerCase().trim();
    if (!term) return [];
    return this.elencoAnimali().filter(
      (a) => a.nome?.toLowerCase().includes(term) || a.microchip?.includes(term),
    );
  });

  // 2. Logica di Filtraggio + Paginazione per la tabella
  // Prima filtriamo, poi calcoliamo le pagine, poi tagliamo la lista
  visiteDopoFiltro = computed(() => {
    let lista = this.visite();
    const search = this.termineRicercaVisite().toLowerCase().trim();
    const vet = this.filtroVeterinario().toLowerCase().trim();

    if (search) {
      lista = lista.filter((v) => v.animale?.nome?.toLowerCase().includes(search));
    }
    if (vet) {
      lista = lista.filter((v) => v.veterinario?.toLowerCase().includes(vet));
    }
    return lista;
  });

  // Questa è la lista effettiva da mostrare nel @for della tabella
  visitePaginate = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.visiteDopoFiltro().slice(startIndex, startIndex + this.pageSize());
  });

  // Calcolo totale pagine
  totalPages = computed(() => Math.ceil(this.visiteDopoFiltro().length / this.pageSize()));

  nuovaVisita = signal<VisitaMedicaDto>({
    id: undefined,
    data: '',
    veterinario: '',
    esito: '',
    note: '',
    animale: undefined as any,
  });

  ngOnInit() {
    this.caricaTutte();
    this.caricaAnimali();
  }

  // --- METODI NAVIGAZIONE ---
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Se l'utente scrive nel filtro, resettiamo alla pagina 1
  resetPagination() {
    this.currentPage.set(1);
  }

  caricaTutte() {
    this.visitaService.getAll().subscribe({
      next: (data) => this.visite.set(data),
      error: (err) => console.error('Errore caricamento visite', err),
    });
  }

  caricaAnimali() {
    this.animaleService.getAll().subscribe({
      next: (data) => this.elencoAnimali.set(data),
      error: (err) => console.error('Errore caricamento animali', err),
    });
  }

  selezionaAnimale(a: AnimaleDto) {
    this.nuovaVisita.update((v) => ({ ...v, animale: a }));
    this.filtroAnimale.set('');
  }

  rimuoviAnimale() {
    this.nuovaVisita.update((v) => ({ ...v, animale: undefined as any }));
  }

  aggiungi() {
    const data = { ...this.nuovaVisita() };
    if (!data.data || !data.veterinario || !data.animale) {
      alert('Compila i campi obbligatori!');
      return;
    }
    delete data.id;

    this.visitaService.insert(data).subscribe({
      next: (res) => {
        this.visite.update((list) => [res, ...list]);
        this.resetForm();
        this.currentPage.set(1); // Torna alla pag 1 per vedere l'inserimento
        alert('Visita salvata correttamente!');
      },
      error: (err) => console.error(err),
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Eliminare questa visita?')) {
      this.visitaService.delete(id).subscribe({
        next: () => {
          this.visite.update((list) => list.filter((v) => v.id !== id));
          // Se la pagina rimane vuota dopo l'eliminazione, torna indietro di una
          if (this.visitePaginate().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
        },
      });
    }
  }

  private resetForm() {
    this.nuovaVisita.set({
      id: undefined,
      data: '',
      veterinario: '',
      esito: '',
      note: '',
      animale: undefined as any,
    });
    this.filtroAnimale.set('');
  }
}
