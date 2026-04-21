import { Component, inject, signal, OnInit, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class CentroAdozioneComponent implements OnInit, AfterViewInit {
  private centroService = inject(CentroAdozioneService);
  private platformId = inject(PLATFORM_ID);

  centri = signal<CentroAdozioneDto[]>([]);
  isLoading = signal(false);
  cercaCitta = signal('');

  // Signal per il form di creazione
  nuovoCentro = signal<Partial<CentroAdozioneDto>>({
    nomeCentro: '',
    indirizzo: '',
    citta: '',
    capacitaMassima: 0,
    isNoProfit: false,
  });

  private map: any;
  private markers: any[] = []; // Per pulire/aggiornare i marker

  ngOnInit() {
    this.caricaTutti();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private async initMap() {
    const L = await import('leaflet');
    this.map = L.map('map').setView([41.9028, 12.4964], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.aggiornaMarkerSuMappa();
  }

  private async aggiornaMarkerSuMappa() {
    if (!this.map || !isPlatformBrowser(this.platformId)) return;
    const L = await import('leaflet');

    // Rimuovi marker vecchi
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];

    this.centri().forEach((centro) => {
      if (centro.latitudine && centro.longitudine) {
        const marker = L.marker([centro.latitudine, centro.longitudine])
          .addTo(this.map)
          .bindPopup(`<b>${centro.nomeCentro}</b><br>${centro.citta}`);
        this.markers.push(marker);
      }
    });
  }

  caricaTutti() {
    this.isLoading.set(true);
    this.centroService.getAll().subscribe({
      next: (data) => {
        this.centri.set(data);
        this.aggiornaMarkerSuMappa();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  aggiungiCentro() {
    this.centroService.creaCentro(this.nuovoCentro() as CentroAdozioneDto).subscribe({
      next: (messaggio) => {
        alert(messaggio); // Mostra il log dell'admin
        this.caricaTutti(); // Ricarica lista e mappa
        this.resetForm();
      },
      error: (err) => alert('Errore durante la creazione: ' + err.status),
    });
  }

  private resetForm() {
    this.nuovoCentro.set({
      nomeCentro: '',
      indirizzo: '',
      citta: '',
      capacitaMassima: 0,
      isNoProfit: false,
    });
  }

  filtraPerCitta() {
    if (this.cercaCitta().trim() === '') {
      this.caricaTutti();
      return;
    }
    this.centroService.findByCitta(this.cercaCitta()).subscribe((data) => {
      this.centri.set(data);
      this.aggiornaMarkerSuMappa();
    });
  }
}
