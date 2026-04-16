export interface AdottanteDto {
  id?: number;
  nome: string;
  cognome: string;
  email: string;
  password?: string; // Solo per la registrazione
  codiceFiscale: string;
  indirizzo?: string;
  telefono?: string;
}
