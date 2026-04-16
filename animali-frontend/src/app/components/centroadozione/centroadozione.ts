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
  private map: any;

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    // Carichiamo i marker prendendoli dai dati già caricati o dal service
    this.centroService.getAll().subscribe((data) => {
      data.forEach((centro) => {
        if (centro.latitudine && centro.longitudine) {
          L.marker([centro.latitudine, centro.longitudine])
            .addTo(this.map)
            .bindPopup(`<b>${centro.nomeCentro}</b><br>${centro.citta}`);
        }
      });
    });
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

  filtraPerCitta() {
    if (this.cercaCitta().trim() === '') {
      this.caricaTutti();
      return;
    }
    this.centroService.findByCitta(this.cercaCitta()).subscribe((data) => this.centri.set(data));
  }
}
