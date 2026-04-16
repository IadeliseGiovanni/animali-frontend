export interface VisitaMedicaDto {
  id?: number;
  data: Date | string;
  esito: string;
  veterinario: string;
  note?: string;
  animaleId?: number; // Assunto in base al contesto "adozioni animali"
}
