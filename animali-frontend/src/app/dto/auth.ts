export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  nome?: string; // Aggiunto: il nome dell'utente
  ruolo?: string; // Aggiunto: es. 'ADOTTANTE' o 'VOLONTARIO'
}
