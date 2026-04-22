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

  nuovoCentro = signal<Partial<CentroAdozioneDto>>({
    nomeCentro: '',
    citta: '',
    indirizzo: '',
    capacitaMassima: 0,
    latitudine: 40.8518,
    longitudine: 14.2681,
    isNoProfit: false,
  });

  private map: any;
  private markers: any[] = [];
  private mapReady = false;

  ngOnInit(): void {
    this.caricaTutti();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private async initMap() {
    const L = await import('leaflet');

    this.map = L.map('map').setView([41.9028, 12.4964], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    this.mapReady = true;
    this.aggiornaMarker();
  }

  private async aggiornaMarker() {
    if (!this.map || !this.mapReady) return;

    const L = await import('leaflet');

    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];

    const bounds: any[] = [];

    this.centri().forEach((c) => {
      if (c.latitudine != null && c.longitudine != null) {
        const marker = L.marker([c.latitudine, c.longitudine]).addTo(this.map).bindPopup(`
            <b>${c.nomeCentro}</b><br>
            ${c.citta}
          `);

        this.markers.push(marker);

        bounds.push([c.latitudine, c.longitudine]);
      }
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, {
        padding: [30, 30],
      });
    }
  }

  caricaTutti() {
    this.isLoading.set(true);

    this.centroService.getAll().subscribe({
      next: (data) => {
        this.centri.set(data);
        this.aggiornaMarker();
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
      },
    });
  }

  resetForm() {
    this.nuovoCentro.set({
      nomeCentro: '',
      citta: '',
      indirizzo: '',
      capacitaMassima: 0,
      latitudine: 0,
      longitudine: 0,
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
      this.aggiornaMarker();
    });
  }
}
