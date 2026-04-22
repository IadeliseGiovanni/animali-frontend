import { AnimaleDto } from './animale';

export interface AdottanteDto {
  id?: number;
  nome: string;
  cognome: string;
  email: string;
  password?: string; // Solo per la registrazione
  codiceFiscale: string;
  indirizzo?: string;
  telefono?: string;
  dataDiNascita?: Date;
  isSchedato: boolean;
  ruolo?: string; // Aggiunto per gestire il ruolo dell'animale (se necessario)

  animaliAdottati: AnimaleDto[];
}
