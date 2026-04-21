import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolontarioService } from '../../services/volontario';
import { VolontarioDto } from '../../dto/volontario';

@Component({
  selector: 'app-volontario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volontario.html',
  styleUrl: './volontario.css',
})
export class VolontarioComponent implements OnInit {
  private volontarioService = inject(VolontarioService);

  // Signals per lo stato della pagina
  volontari = signal<VolontarioDto[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);

  // Signal per l'oggetto nel form di creazione
  nuovoVolontario = signal<Partial<VolontarioDto>>({
    nome: '',
    cognome: '',
    cf: '',
    turno: '',
    email: '',
  });

  ngOnInit() {
    this.caricaTutti();
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

    // Validazione minima lato client
    if (!dto.nome || !dto.cognome || !dto.cf) {
      alert('Inserire almeno Nome, Cognome e Codice Fiscale.');
      return;
    }

    this.volontarioService.insert(dto).subscribe({
      next: (volontarioSalvato) => {
        // Aggiorniamo la lista locale aggiungendo il nuovo oggetto restituito dal server
        this.volontari.update((currentList) => [...currentList, volontarioSalvato]);
        this.resetForm();
        alert('Volontario registrato correttamente!');
      },
      error: (err) => {
        console.error('Errore inserimento:', err);
        alert('Impossibile salvare il volontario. Verifica i dati o i permessi.');
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
    });
  }
}
