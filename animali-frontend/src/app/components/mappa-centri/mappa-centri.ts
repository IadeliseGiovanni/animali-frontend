import {
  Component,
  inject,
  AfterViewInit,
  PLATFORM_ID,
  Output,
  EventEmitter,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CentroAdozioneService } from '../../services/centroadozione';

@Component({
  selector: 'app-mappa',
  standalone: true,
  templateUrl: './mappa-centri.html',
  styleUrls: ['./mappa-centri.css'],
})
export class MappaComponent implements AfterViewInit {
  private centroService = inject(CentroAdozioneService);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone); // Necessario per far sentire i cambiamenti ad Angular dal mondo esterno (Leaflet)

  @Output() centroSelezionato = new EventEmitter<number>();

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private async initMap() {
    const L = await import('leaflet');
    const map = L.map('map').setView([41.9028, 12.4964], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    this.centroService.getAll().subscribe({
      next: (centri) => {
        console.log('Mappa: Centri caricati correttamente', centri);

        centri.forEach((c) => {
          if (c.latitudine && c.longitudine) {
            const m = L.marker([c.latitudine, c.longitudine], { icon: iconDefault }).addTo(map);

            // Aggiungiamo il popup MA evitiamo che blocchi il click
            m.bindPopup(`<b>${c.nomeCentro}</b>`);

            // Usiamo zone.run perché Leaflet lavora fuori dal rilevamento di Angular
            m.on('click', () => {
              console.log('Mappa: Click rilevato sul centro ID:', c.id);
              this.zone.run(() => {
                this.centroSelezionato.emit(c.id);
              });
            });
          }
        });
      },
      error: (err) => console.error('Mappa: Errore nel caricamento dei centri', err),
    });
  }
}
