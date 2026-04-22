import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolontarioService } from '../../services/volontario';
import { CentroAdozioneService } from '../../services/centroadozione'; // Importa il service dei centri
import { VolontarioDto } from '../../dto/volontario';
import { CentroAdozioneDto } from '../../dto/centroadozioni'; // Importa il DTO dei centri

@Component({
  selector: 'app-volontario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volontario.html',
  styleUrl: './volontario.css',
})
export class VolontarioComponent implements OnInit {
  private volontarioService = inject(VolontarioService);
  private centroService = inject(CentroAdozioneService); // Iniettiamo il service centri

  volontari = signal<VolontarioDto[]>([]);
  centri = signal<CentroAdozioneDto[]>([]); // Signal per la lista dei centri
  searchTerm = signal('');
  isLoading = signal(false);

  nuovoVolontario = signal<Partial<VolontarioDto>>({
    nome: '',
    cognome: '',
    cf: '',
    turno: '',
    email: '',
    centroAdozione: undefined, // Campo per l'associazione dell'oggetto centro
  });

  ngOnInit() {
    this.caricaTutti();
    this.caricaCentri(); // Carichiamo i centri all'avvio
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

  onSearch() {
    if (this.searchTerm().trim() === '') {
      this.caricaTutti();
      return;
    }
    this.volontarioService.search(this.searchTerm()).subscribe({
      next: (data) => this.volontari.set(data),
      error: (err) => console.error('Errore ricerca:', err),
    });
  }

  aggiungi() {
    const dto = this.nuovoVolontario() as VolontarioDto;

    if (!dto.nome || !dto.cognome || !dto.cf || !dto.centroAdozione) {
      alert('Inserire Nome, Cognome, CF e selezionare un Centro.');
      return;
    }

    this.volontarioService.insert(dto).subscribe({
      next: (volontarioSalvato) => {
        this.volontari.update((currentList) => [...currentList, volontarioSalvato]);
        this.resetForm();
        alert('Volontario registrato correttamente!');
      },
      error: (err) => {
        console.error('Errore inserimento:', err);
        alert('Errore nel salvataggio del volontario.');
      },
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
