export interface PraticaAdozioneDto {
  id: number;
  adottanteId: number;
  adottanteNominativo: string; // Nome + Cognome mappati dal backend
  animaleId: number;
  animaleNome: string;
  stato: 'PENDING' | 'IN_VALUTAZIONE' | 'APPROVATA' | 'RIFIUTATA';
  dataApertura: string; // Arriva come stringa ISO dal backend
  noteAdmin?: string;
}
