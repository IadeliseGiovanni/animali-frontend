export interface CentroAdozioneDto {
  id: number;
  nomeCentro: string;
  citta: string;
  indirizzo: string;
}

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
}

export interface AdozioneRequestDto {
  idAnimale: number;
  idAdottante: number;
}
