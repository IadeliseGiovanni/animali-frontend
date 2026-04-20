import {
  Component,
  inject,
  AfterViewInit,
  PLATFORM_ID,
  Output,
  EventEmitter,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CentroAdozioneService } from '../../services/centroadozione';

@Component({
  selector: 'app-mappa',
  standalone: true,
  templateUrl: './mappa-centri.html',
  styleUrls: ['./mappa-centri.css'],
})
export class MappaComponent implements AfterViewInit, OnDestroy {
  private centroService = inject(CentroAdozioneService);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  // Variabile per memorizzare l'istanza di Leaflet
  private map: any; 

  @Output() centroSelezionato = new EventEmitter<number>();

  ngAfterViewInit() {
    // Eseguiamo l'inizializzazione solo se siamo nel Browser (evita errore document is not defined)
    if (isPlatformBrowser(this.platformId)) {
      // Un piccolo delay assicura che il contenitore HTML sia pronto al 100%
      setTimeout(() => this.initMap(), 150);
    }
  }

  ngOnDestroy() {
    // Pulizia quando il componente viene rimosso (cambio pagina o chiusura modale)
    if (isPlatformBrowser(this.platformId)) {
      this.pulisciMappa();
    }
  }

  // Metodo per distruggere correttamente la mappa e liberare il div
  private pulisciMappa() {
    if (this.map) {
      this.map.off(); // Rimuove gli eventi
      this.map.remove(); // Distrugge l'oggetto mappa
      this.map = null;
    }
    
    // Reset manuale dell'ID di Leaflet nel DOM per evitare l'errore "already initialized"
    const container = document.getElementById('map');
    if (container) {
      (container as any)._leaflet_id = null;
    }
  }

  private async initMap() {
    // Pulizia preventiva prima di ogni creazione
    this.pulisciMappa();

    const L = await import('leaflet');

    try {
      // Creazione della mappa
      this.map = L.map('map', {
        center: [41.9028, 12.4964],
        zoom: 5,
        fadeAnimation: false // Ottimizza il caricamento iniziale
      });

      // Caricamento dei pezzi (tiles) di OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);

      // FIX PER LA MAPPA GRIGIA: Forza il ricalcolo delle dimensioni del div
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 250);

      // Icona personalizzata per i marker
      const iconDefault = L.icon({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      // Caricamento centri dal database
      this.centroService.getAll().subscribe({
        next: (centri) => {
          centri.forEach((c) => {
            if (c.latitudine && c.longitudine && this.map) {
              const m = L.marker([c.latitudine, c.longitudine], { icon: iconDefault }).addTo(this.map);
              
              m.bindPopup(`<b>${c.nomeCentro}</b>`);

              // Emissione dell'evento per filtrare gli animali
              m.on('click', () => {
                this.zone.run(() => {
                  this.centroSelezionato.emit(c.id);
                });
              });
            }
          });
        },
        error: (err) => console.error('Mappa: Errore caricamento centri', err),
      });
    } catch (e) {
      console.error('Errore durante l\'inizializzazione di Leaflet:', e);
    }
  }
}