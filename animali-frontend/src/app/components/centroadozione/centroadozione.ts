import { Component, inject, signal, OnInit } from '@angular/core';
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

  centri = signal<CentroAdozioneDto[]>([]);
  isLoading = signal(false);
  cercaCitta = signal('');

  nuovoCentro = signal<Partial<CentroAdozioneDto>>({
    nomeCentro: '',
    citta: '',
    indirizzo: '',
    capacitaMassima: 0,
    latitudine: 41.9028,
    longitudine: 12.4964,
    isNoProfit: false,
  });

  ngOnInit(): void {
    this.caricaTutti();
  }

  caricaTutti() {
    this.isLoading.set(true);
    this.centroService.getAll().subscribe({
      next: (data) => {
        this.centri.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
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

  filtraPerCitta() {
    const q = this.cercaCitta().trim();
    if (!q) {
      this.caricaTutti();
      return;
    }
    this.centroService.findByCitta(q).subscribe((data) => {
      this.centri.set(data);
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Sei sicuro di voler eliminare questo centro?')) {
      this.centroService.delete(id).subscribe({
        next: () => {
          this.centri.update((list) => list.filter((v) => v.id !== id));
        },
        error: (err) => alert("Errore durante l'eliminazione."),
      });
    }
  }
}
