import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdottanteDto } from '../dto/adottante';

@Injectable({
  providedIn: 'root',
})
export class AdottanteService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/Adottante';

  getProfilo(): Observable<AdottanteDto> {
    // Questo chiama l'endpoint @GetMapping("/me")
    // Non servono parametri perché il backend usa il Token JWT per capire chi sei
    return this.http.get<AdottanteDto>(`${this.apiUrl}/me`);
  }

  // Metodi CRUD standard
  getAll(): Observable<AdottanteDto[]> {
    return this.http.get<AdottanteDto[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<AdottanteDto> {
    return this.http.get<AdottanteDto>(`${this.apiUrl}/read`, {
      params: new HttpParams().set('id', id),
    });
  }

  // Metodo specifico del tuo AdottanteController
  findByCognome(cognome: string): Observable<AdottanteDto[]> {
    return this.http.get<AdottanteDto[]>(`${this.apiUrl}/findByCognome`, {
      params: new HttpParams().set('cognome', cognome),
    });
  }

  update(dto: AdottanteDto): Observable<AdottanteDto> {
    return this.http.put<AdottanteDto>(`${this.apiUrl}/update`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete`, {
      params: new HttpParams().set('id', id),
    });
  }

  updateIdoneita(id: number, stato: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/idoneita?stato=${stato}`, {});
  }

  updateRuolo(id: number, ruolo: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/ruolo?nuovoRuolo=${ruolo}`, {});
  }
}
