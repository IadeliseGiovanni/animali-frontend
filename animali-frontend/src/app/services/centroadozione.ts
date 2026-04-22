import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CentroAdozioneDto } from '../dto/centroadozioni';
import { AnimaleDto } from '../dto/animale';

@Injectable({
  providedIn: 'root',
})
export class CentroAdozioneService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/centri';

  // GET /api/centri/lista
  getAll(): Observable<CentroAdozioneDto[]> {
    return this.http.get<CentroAdozioneDto[]>(`${this.apiUrl}/lista`);
  }

  // GET /api/centri/citta/{citta}
  findByCitta(citta: string): Observable<CentroAdozioneDto[]> {
    return this.http.get<CentroAdozioneDto[]>(`${this.apiUrl}/citta/${citta}`);
  }

  // GET /api/centri/noprofit/{noProfit}
  findByNoProfit(noProfit: boolean): Observable<CentroAdozioneDto[]> {
    return this.http.get<CentroAdozioneDto[]>(`${this.apiUrl}/noprofit/${noProfit}`);
  }

  // GET /api/centri/nome/{nome}
  findByNome(nome: string): Observable<CentroAdozioneDto> {
    return this.http.get<CentroAdozioneDto>(`${this.apiUrl}/nome/${nome}`);
  }

  creaCentro(centro: CentroAdozioneDto): Observable<string> {
    // Nota: il tuo controller restituisce una String, quindi usiamo { responseType: 'text' }
    return this.http.post(`${this.apiUrl}/admin/crea`, centro, { responseType: 'text' });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
