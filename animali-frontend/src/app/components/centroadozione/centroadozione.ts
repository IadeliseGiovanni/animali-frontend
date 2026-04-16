import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentroAdozioneService } from '../../services/centroadozione';
import { CentroAdozioneDto } from '../../dto/centroadozioni';

@Component({
  selector: 'app-centro-adozione',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centroadozione.html',
  styleUrl: './centroadozione.css',
})
export class CentroAdozioneComponent implements OnInit {
  private centroService = inject(CentroAdozioneService);

  // Stato dell'interfaccia
  centri = signal<CentroAdozioneDto[]>([]);
  isLoading = signal(false);

  // Per i filtri di ricerca
  cercaCitta = signal('');

  ngOnInit() {
    this.caricaTutti();
  }

  caricaTutti() {
    this.isLoading.set(true);
    this.centroService.getAll().subscribe({
      next: (data) => {
        console.log('Dati ricevuti:');
        console.table(data); // <--- Questo ti dice i nomi esatti delle proprietà
        this.centri.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore API:', err);
        this.isLoading.set(false);
      },
    });
  }

  filtraPerCitta() {
    if (this.cercaCitta().trim() === '') {
      this.caricaTutti();
      return;
    }
    this.centroService.findByCitta(this.cercaCitta()).subscribe((data) => {
      this.centri.set(data);
    });
  }

  filtraNoProfit(soloNoProfit: boolean) {
    this.centroService.findByNoProfit(soloNoProfit).subscribe((data) => {
      this.centri.set(data);
    });
  }
}
