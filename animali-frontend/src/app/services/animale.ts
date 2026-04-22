import { inject, Injectable, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Importante per il controllo browser
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnimaleDto, AdozioneRequestDto } from '../dto/animale';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AnimaleService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // Identifica dove sta girando il codice
  private readonly apiUrl = 'http://localhost:8080/api/animali';

  // Inizializziamo con un array vuoto, caricheremo i dati dopo
  listaPreferiti = signal<AnimaleDto[]>([]);

  constructor() {
    // 1. Carichiamo i dati solo se siamo nel Browser
    if (isPlatformBrowser(this.platformId)) {
      const datiSalvati = localStorage.getItem('preferiti_animali');
      if (datiSalvati) {
        this.listaPreferiti.set(JSON.parse(datiSalvati));
      }
    }

    // 2. Salviamo i dati solo se siamo nel Browser
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('preferiti_animali', JSON.stringify(this.listaPreferiti()));
      }
    });
  }

  togglePreferito(animale: AnimaleDto) {
    this.listaPreferiti.update((lista) => {
      const giaPresente = lista.find((a) => a.id === animale.id);
      if (giaPresente) {
        return lista.filter((a) => a.id !== animale.id);
      } else {
        return [...lista, animale];
      }
    });
  }

  // --- RESTO DEI METODI (getAll, getFiltered, etc.) ---
  getAll(): Observable<AnimaleDto[]> {
    return this.http.get<AnimaleDto[]>(`${this.apiUrl}/all`);
  }

  getAllFiltrati(): Observable<AnimaleDto[]> {
    return this.http.get<AnimaleDto[]>(`${this.apiUrl}/allFiltrati`);
  }

  getById(id: number): Observable<AnimaleDto> {
    return this.http.get<AnimaleDto>(`${this.apiUrl}/${id}`);
  }

  generaContratto(dto: AdozioneRequestDto): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/genera-contratto`, dto, {
      responseType: 'blob',
    });
  }

  getFiltered(
    specie: string,
    genere: string,
    centroId: number | null = null,
  ): Observable<AnimaleDto[]> {
    let params = new HttpParams();
    if (specie) params = params.set('specie', specie);
    if (genere) params = params.set('genere', genere);
    if (centroId) params = params.set('centroId', centroId.toString());
    return this.http.get<AnimaleDto[]>(`${this.apiUrl}/search`, { params });
  }

  getFilteredByCentro(idCentro: number): Observable<AnimaleDto[]> {
    return this.http.get<AnimaleDto[]>(`${this.apiUrl}/centro/${idCentro}`);
  }

  insert(dto: AnimaleDto): Observable<AnimaleDto> {
    return this.http.post<AnimaleDto>(`${this.apiUrl}/insert`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
