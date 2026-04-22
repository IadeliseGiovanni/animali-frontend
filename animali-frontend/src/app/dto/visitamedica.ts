import { AnimaleDto } from './animale';

export interface VisitaMedicaDto {
  id?: number;
  data: Date | string;
  esito: string;
  veterinario: string;
  note?: string;

  animale: AnimaleDto; // Associazione con AnimaleDto
}
