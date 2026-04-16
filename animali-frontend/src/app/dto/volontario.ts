import { CentroAdozioneDto } from './centroadozioni';

export interface VolontarioDto {
  id?: number;
  nome: string;
  cognome: string;
  email: string;
  cf: string;
  turno: string;
  ruolo: string;

  centroAdozione?: CentroAdozioneDto;
}
