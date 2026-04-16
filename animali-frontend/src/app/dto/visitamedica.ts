import { AnimaleDto } from './animale';

export interface VisitaMedicaDto {
  id?: number;
  data: Date | string;
  esito: string;
  veterinario: string;
  note?: string;

  animali: AnimaleDto[]; // Associazione con AnimaleDto
}
