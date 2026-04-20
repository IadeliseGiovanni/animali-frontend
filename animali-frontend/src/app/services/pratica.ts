import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PraticaAdozioneDto } from '../dto/pratica'; // Importa il DTO appena creato

@Injectable({
  providedIn: 'root',
})
export class PraticaService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/pratiche';

  // Vista Admin: Tutte le pratiche
  getTutteLePraticheAdmin(): Observable<PraticaAdozioneDto[]> {
    return this.http.get<PraticaAdozioneDto[]>(`${this.apiUrl}/admin/all`);
  }

  // Vista Utente: Solo le proprie
  getMiePratiche(): Observable<PraticaAdozioneDto[]> {
    return this.http.get<PraticaAdozioneDto[]>(`${this.apiUrl}/mie-pratiche`);
  }

  // Avvio pratica
  avviaPratica(animaleId: number): Observable<PraticaAdozioneDto> {
    return this.http.post<PraticaAdozioneDto>(`${this.apiUrl}/avvia/${animaleId}`, {});
  }

  // Aggiornamento stato (Admin)
  aggiornaStato(id: number, nuovoStato: string, nota: string): Observable<any> {
    const url = `${this.apiUrl}/admin/${id}/stato`;
    // Passiamo nuovoStato come parametro query e un body (anche vuoto) se richiesto
    return this.http.patch(
      url,
      {},
      {
        params: { nuovoStato, nota },
      },
    );
  }
}
