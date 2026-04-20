import { CentroAdozioneDto } from './centroadozioni';
import { AdottanteDto } from './adottante';
import { VisitaMedicaDto } from './visitamedica';

export interface AnimaleDto {
  id: number;
  nome: string;
  specie: string;
  razza: string;
  eta: number;
  descrizione?: string;
  adottato: boolean;
  genere: string;
  microchip: string;
  centroAdozione?: CentroAdozioneDto;
  visiteMediche: VisitaMedicaDto[];
  Adottante?: AdottanteDto;
  foto?: string;       // Usato in animali.html
  fotoUrl?: string;    // AGGIUNTO PER RISOLVERE L'ERRORE IN adottante.html
  videoUrl?: string;   // Per i tuoi nuovi video
}

// Assicurati che sia presente anche questo, serviva al service
export interface AdozioneRequestDto {
  idAnimale: number;
  idAdottante: number;
  dataRichiesta: string;
  note?: string;
}