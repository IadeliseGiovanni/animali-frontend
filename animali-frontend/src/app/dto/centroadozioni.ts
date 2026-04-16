import { AnimaleDto } from './animale';
import { VolontarioDto } from './volontario';

export interface CentroAdozioneDto {
  id: number;
  nomeCentro: string;
  indirizzo: string;
  citta: string;
  capacitaMassima: number;
  isNoProfit: boolean;

  AnimaliOspitati?: AnimaleDto[];
  Volontari?: VolontarioDto[];
}
