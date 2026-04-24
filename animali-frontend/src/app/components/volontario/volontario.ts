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

  // Segnali per i filtri
  searchTerm = signal('');
  filtroCentroId = signal<string>('TUTTI');
  filtroTurno = signal<string>('TUTTI');

  isLoading = signal(false);

  nuovoVolontario = signal<Partial<VolontarioDto>>({
    nome: '',
    cognome: '',
    cf: '',
    turno: '',
    email: '',
    centroAdozione: undefined,
    password: '',
  });

  // LOGICA DI FILTRAGGIO COMBINATA
  volontariFiltrati = computed(() => {
    let lista = this.volontari();

    // 1. Filtro per testo (Nome, Cognome o CF)
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      lista = lista.filter(
        (v) =>
          v.nome.toLowerCase().includes(search) ||
          v.cognome.toLowerCase().includes(search) ||
          v.cf.toLowerCase().includes(search),
      );
    }

    // 2. Filtro per Centro
    const centroId = this.filtroCentroId();
    if (centroId !== 'TUTTI') {
      lista = lista.filter((v) => v.centroAdozione?.id === +centroId);
    }

    // 3. Filtro per Turno
    const turno = this.filtroTurno();
    if (turno !== 'TUTTI') {
      lista = lista.filter((v) => v.turno === turno);
    }

    return lista;
  });

  ngOnInit() {
    this.caricaTutti();
    this.caricaCentri();
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

  // Nota: onSearch() ora può essere vuoto o rimosso se usiamo il filtro lato client
  // con computed, ma lo lasciamo per compatibilità con l'evento (input)
  onSearch() {
    // Il filtraggio avviene automaticamente tramite il computed 'volontariFiltrati'
  }

  aggiungi() {
    // Crea una copia pulita del DTO per l'invio
    const dto = { ...this.nuovoVolontario() } as VolontarioDto;
  
    if (!dto.nome || !dto.cognome || !dto.cf || !dto.centroAdozione) {
      alert('Inserire Nome, Cognome, CF e selezionare un Centro.');
      return;
    }
  
    this.volontarioService.insert(dto).subscribe({
      next: (volontarioSalvato) => {
        // AGGIORNAMENTO REATTIVO: Crea un nuovo riferimento all'array
        this.volontari.update(list => [...list, volontarioSalvato]);
        
        // RESET FILTRI: Garantisce che il nuovo elemento sia visibile
        this.searchTerm.set('');
        this.filtroCentroId.set('TUTTI');
        this.filtroTurno.set('TUTTI');
  
        this.resetForm();
        alert('Volontario registrato correttamente!');
      },
      error: (err) => alert('Errore nel salvataggio.')
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Sei sicuro di voler eliminare questo volontario?')) {
      this.volontarioService.delete(id).subscribe({
        next: () => {
          this.volontari.update((list) => list.filter((v) => v.id !== id));
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
      turno: '',
      email: '',
      centroAdozione: undefined,
    });
  }
}
