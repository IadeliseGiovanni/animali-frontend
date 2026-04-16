import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnimaleDto, AdozioneRequestDto } from '../dto/animale';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AnimaleService {
  private http = inject(HttpClient);

  // Nota: I tuoi endpoint nel controller Java sono su "/api/animali"
  private readonly apiUrl = 'http://localhost:8080/api/animali';

  /**
   * Recupera la lista di tutti gli animali
   * (Assicurati di avere questo endpoint nel backend,
   * altrimenti dovrai aggiungerlo al controller Java)
   */
  getAll(): Observable<AnimaleDto[]> {
    return this.http.get<AnimaleDto[]>(`${this.apiUrl}/all`);
  }

  /**
   * Recupera un singolo animale per ID
   */
  getById(id: number): Observable<AnimaleDto> {
    return this.http.get<AnimaleDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Genera il contratto PDF e lo riceve come Blob
   */
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
    if (centroId) params = params.set('centroId', centroId.toString()); // <--- Fondamentale

    return this.http.get<AnimaleDto[]>(`${this.apiUrl}/search`, { params });
  }

  // All'interno della classe AnimaleService

  getFilteredByCentro(idCentro: number): Observable<AnimaleDto[]> {
    // Assicurati che l'URL corrisponda all'endpoint del tuo controller Spring Boot
    // Esempio: http://localhost:8080/api/animali/centro/1
    return this.http.get<AnimaleDto[]>(`${this.apiUrl}/centro/${idCentro}`);
  }
}
