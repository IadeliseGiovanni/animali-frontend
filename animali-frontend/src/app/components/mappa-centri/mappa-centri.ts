import {
  Component,
  inject,
  AfterViewInit,
  PLATFORM_ID,
  Output,
  EventEmitter,
  NgZone,
  OnDestroy,
  ElementRef,
  ViewChild,
  input,
  effect,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CentroAdozioneService } from '../../services/centroadozione';

@Component({
  selector: 'app-mappa',
  standalone: true,
  // Usiamo un template semplice: il div occupa tutto lo spazio del padre
  template: `<div #mapContainer id="map" style="height: 100%; width: 100%;"></div>`,
  styleUrls: ['./mappa-centri.css'],
})
export class MappaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Output() centroSelezionato = new EventEmitter<number>();

  // 1. Riceve la lista dei centri dal componente padre
  centri = input<any[]>([]);

  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private map: any;
  private markers: any[] = []; // <--- Teniamo traccia dei marker per pulirli
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // 2. Ogni volta che il signal 'centri' cambia, aggiorniamo i marker sulla mappa
    effect(() => {
      const listaCentri = this.centri();
      if (this.map) {
        this.aggiornaMarkers(listaCentri);
      }
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      Promise.resolve().then(() => this.initMap());
    }
  }

  private async initMap() {
    const L = await import('leaflet');
    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [41.9028, 12.4964],
        zoom: 5,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM',
      }).addTo(this.map);

      this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
      this.resizeObserver.observe(this.mapContainer.nativeElement);

      // Inizializziamo i marker con i dati attuali
      this.aggiornaMarkers(this.centri());
    } catch (e) {
      console.error(e);
    }
  }

  private async aggiornaMarkers(centri: any[]) {
    const L = await import('leaflet');

    // 3. Pulizia: rimuoviamo i vecchi marker dalla mappa
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];

    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    // 4. Creazione nuovi marker
    centri.forEach((c) => {
      if (c.latitudine && c.longitudine && this.map) {
        const m = L.marker([c.latitudine, c.longitudine], { icon: iconDefault })
          .addTo(this.map)
          .bindPopup(`<b>${c.nomeCentro}</b>`);

        m.on('click', () => {
          this.zone.run(() => this.centroSelezionato.emit(c.id));
        });

        this.markers.push(m);
      }
    });
  }

  private pulisciMappa() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.pulisciMappa();
    }
  }
}
