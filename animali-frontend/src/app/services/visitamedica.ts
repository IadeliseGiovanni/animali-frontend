import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitaMedicaDto } from '../dto/visitamedica';

@Injectable({
  providedIn: 'root',
})
export class VisitaMedicaService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/VisitaMedica';

  // Metodi standard (ereditati dal tuo AbstractController in Java)
  getAll(): Observable<VisitaMedicaDto[]> {
    return this.http.get<VisitaMedicaDto[]>(this.apiUrl);
  }

  // Metodi specifici del controller
  findByData(data: string): Observable<VisitaMedicaDto[]> {
    return this.http.get<VisitaMedicaDto[]>(`${this.apiUrl}/findByData`, {
      params: new HttpParams().set('data', data),
    });
  }

  findByEsito(esito: string): Observable<VisitaMedicaDto[]> {
    return this.http.get<VisitaMedicaDto[]>(`${this.apiUrl}/findByEsito`, {
      params: new HttpParams().set('esito', esito),
    });
  }

  findByVeterinario(veterinario: string): Observable<VisitaMedicaDto[]> {
    return this.http.get<VisitaMedicaDto[]>(`${this.apiUrl}/findByVeterinario`, {
      params: new HttpParams().set('veterinario', veterinario),
    });
  }

  findByDataAndVeterinario(data: string, veterinario: string): Observable<VisitaMedicaDto[]> {
    const params = new HttpParams().set('data', data).set('veterinario', veterinario);
    return this.http.get<VisitaMedicaDto[]>(`${this.apiUrl}/findByDataAndVeterinario`, { params });
  }
}
