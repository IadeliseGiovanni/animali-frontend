import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolontarioService } from '../../services/volontario';
import { CentroAdozioneService } from '../../services/centroadozione';
import { VolontarioDto } from '../../dto/volontario';
import { CentroAdozioneDto } from '../../dto/centroadozioni';

@Component({
  selector: 'app-volontario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volontario.html',
  styleUrl: './volontario.css',
})
export class VolontarioComponent implements OnInit {
  private volontarioService = inject(VolontarioService);
  private centroService = inject(CentroAdozioneService);

  volontari = signal<VolontarioDto[]>([]);
  centri = signal<CentroAdozioneDto[]>([]);

  // --- PAGINAZIONE ---
  currentPage = signal(1);
  pageSize = signal(5);

  // Segnali per i filtri
  searchTerm = signal('');
  filtroCentroId = signal<string>('TUTTI');
  filtroTurno = signal<string>('TUTTI');

  isLoading = signal(false);

  // 1. Logica di filtraggio (Dati filtrati ma non ancora paginati)
  volontariFiltratiTotali = computed(() => {
    let lista = this.volontari();

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      lista = lista.filter(
        (v) =>
          v.nome.toLowerCase().includes(search) ||
          v.cognome.toLowerCase().includes(search) ||
          v.cf.toLowerCase().includes(search),
      );
    }

    const centroId = this.filtroCentroId();
    if (centroId !== 'TUTTI') {
      lista = lista.filter((v) => v.centroAdozione?.id === +centroId);
    }

    const turno = this.filtroTurno();
    if (turno !== 'TUTTI') {
      lista = lista.filter((v) => v.turno === turno);
    }

    return lista;
  });

  // 2. Logica di paginazione applicata ai dati già filtrati
  volontariPaginate = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.volontariFiltratiTotali().slice(startIndex, startIndex + this.pageSize());
  });

  // 3. Calcolo totale pagine
  totalPages = computed(() => Math.ceil(this.volontariFiltratiTotali().length / this.pageSize()));

  nuovoVolontario = signal<Partial<VolontarioDto>>({
    id: undefined,
    nome: '',
    cognome: '',
    cf: '',
    turno: '',
    email: '',
    centroAdozione: undefined,
    password: '',
    ruolo: 'USER',
  });

  ngOnInit() {
    this.caricaTutti();
    this.caricaCentri();
  }

  // --- NAVIGAZIONE ---
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Resetta la pagina a 1 quando cambiano i filtri
  resetPagination() {
    this.currentPage.set(1);
  }

  caricaTutti() {
    this.isLoading.set(true);
    this.volontarioService.getAll().subscribe({
      next: (data) => {
        this.volontari.set(data as VolontarioDto[]);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  caricaCentri() {
    this.centroService.getAll().subscribe({
      next: (data) => this.centri.set(data),
      error: (err) => console.error('Errore caricamento centri:', err),
    });
  }

  aggiungi() {
    const dto = { ...this.nuovoVolontario() };

    // Rimuoviamo l'id per evitare errori di persistenza (come visto per le visite)
    delete dto.id;

    if (!dto.nome || !dto.cognome || !dto.cf || !dto.centroAdozione) {
      alert(`Compila i campi obbligatori!`);
      return;
    }

    this.volontarioService.insert(dto as VolontarioDto).subscribe({
      next: (volontarioSalvato) => {
        this.volontari.update((list) => [...list, volontarioSalvato]);
        this.resetForm();
        this.currentPage.set(1);
        alert('Volontario registrato correttamente!');
      },
      error: (err) => alert('Errore nel salvataggio.'),
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Sei sicuro di voler eliminare questo volontario?')) {
      this.volontarioService.delete(id).subscribe({
        next: () => {
          this.volontari.update((list) => list.filter((v) => v.id !== id));
          if (this.volontariPaginate().length === 0 && this.currentPage() > 1) {
            this.currentPage.update((p) => p - 1);
          }
        },
        error: (err) => alert("Errore durante l'eliminazione."),
      });
    }
  }

  private resetForm() {
    this.nuovoVolontario.set({
      nome: '',
      cognome: '',
      cf: '',
      turno: 'MATTINA',
      email: '',
      centroAdozione: undefined,
      password: '',
      ruolo: 'USER',
    });
    this.resetPagination();
  }
}
