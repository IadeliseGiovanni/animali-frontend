import { CentroAdozioneDto } from '../dto/centroadozioni';
import { AdottanteDto } from './adottante';
import { VisitaMedicaDto } from './visitamedica';

export interface AnimaleDto {
  id: number;
  nome: string;
  specie: string;
  razza: string;
  eta: number;
  descrizione?: string;
  adottato: boolean; // Verifica se nel backend si chiama 'adottato' o 'disponibile'
  genere: 'Maschio' | 'Femmina'; // Allinealo a quello che invia il backend
  microchip: string;
  // AGGIUNGI QUESTO:
  centroAdozione?: CentroAdozioneDto;
  visiteMediche: VisitaMedicaDto[]; //
  Adottante?: AdottanteDto;
}

export interface AdozioneRequestDto {
  idAnimale: number;
  idAdottante: number;
  dataRichiesta: string;
  note?: string; // Il '?' lo rende opzionale
}
