import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Aggiunto DatePipe
import { VisitaMedicaService } from '../../services/visitamedica';
import { VisitaMedicaDto } from '../../dto/visitamedica';

@Component({
  selector: 'app-visita-medica',
  standalone: true,
  // Aggiungere DatePipe qui risolve l'errore "No pipe found with name 'date'"
  imports: [CommonModule, DatePipe],
  templateUrl: './visitamedica.html',
  styleUrl: './visitamedica.css',
})
export class VisitaMedicaComponent implements OnInit {
  private visitaService = inject(VisitaMedicaService);

  // Signal per gestire la lista delle visite
  // Assicurati che nel template HTML scrivi visite() per leggerlo
  visite = signal<VisitaMedicaDto[]>([]);

  ngOnInit() {
    this.caricaTutte();
  }

  caricaTutte() {
    // Nota: Assicurati che il metodo nel service si chiami effettivamente getAll()
    this.visitaService.getAll().subscribe({
      next: (data) => this.visite.set(data),
      error: (err) => console.error('Errore nel caricamento visite', err),
    });
  }

  cercaPerVeterinario(nome: string) {
    if (!nome) {
      this.caricaTutte();
      return;
    }
    this.visitaService.findByVeterinario(nome).subscribe({
      next: (data) => this.visite.set(data),
      error: (err) => console.error('Errore nella ricerca per veterinario', err),
    });
  }
}
