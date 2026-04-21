import { inject, Injectable, signal } from '@angular/core'; // <--- Aggiunto signal
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnimaleDto, AdozioneRequestDto } from '../dto/animale';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AnimaleService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/animali';

  // --- LOGICA PREFERITI CON SIGNALS ---
  // Questo signal conterrà la lista degli animali preferiti
  listaPreferiti = signal<AnimaleDto[]>([]);

  // Funzione per aggiungere o rimuovere un preferito (Toggle)
  togglePreferito(animale: AnimaleDto) {
    this.listaPreferiti.update((lista) => {
      const giaPresente = lista.find((a) => a.id === animale.id);
      if (giaPresente) {
        // Se c'è già, lo tolgo
        return lista.filter((a) => a.id !== animale.id);
      } else {
        // Se non c'è, lo aggiungo
        return [...lista, animale];
      }
    });
  }
  // ------------------------------------

  getAll(): Observable<AnimaleDto[]> {
    return this.http.get<AnimaleDto[]>(`${this.apiUrl}/all`);
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
}