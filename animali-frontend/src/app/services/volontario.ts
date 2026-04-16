import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VolontarioDto } from '../dto/volontario';

@Injectable({
  providedIn: 'root',
})
export class VolontarioService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/Volontario';

  getAll(): Observable<VolontarioDto[]> {
    return this.http.get<VolontarioDto[]>(`${this.apiUrl}/all`);
  }

  insert(dto: VolontarioDto): Observable<VolontarioDto> {
    return this.http.post<VolontarioDto>(`${this.apiUrl}/insert`, dto);
  }

  update(dto: VolontarioDto): Observable<VolontarioDto> {
    return this.http.put<VolontarioDto>(`${this.apiUrl}/update`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete`, {
      params: new HttpParams().set('id', id),
    });
  }

  search(keyword: string): Observable<VolontarioDto[]> {
    return this.http.get<VolontarioDto[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('keyword', keyword),
    });
  }

  findByTurno(turno: string): Observable<VolontarioDto[]> {
    return this.http.get<VolontarioDto[]>(`${this.apiUrl}/findByTurno`, {
      params: new HttpParams().set('turno', turno),
    });
  }
}
