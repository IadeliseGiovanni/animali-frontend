import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitaMedicaService } from '../../services/visitamedica';
import { AnimaleService } from '../../services/animale';
import { VisitaMedicaDto } from '../../dto/visitamedica';
import { AnimaleDto } from '../../dto/animale';

@Component({
  selector: 'app-visita-medica',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './visitamedica.html',
  styleUrl: './visitamedica.css',
})
export class VisitaMedicaComponent implements OnInit {
  private visitaService = inject(VisitaMedicaService);
  private animaleService = inject(AnimaleService);

  visite = signal<VisitaMedicaDto[]>([]);
  elencoAnimali = signal<AnimaleDto[]>([]);
  filtroAnimale = signal('');

  animaliFiltrati = computed(() => {
    const term = this.filtroAnimale().toLowerCase().trim();
    if (!term) return [];
    return this.elencoAnimali().filter(
      (a) => a.nome?.toLowerCase().includes(term) || a.microchip?.includes(term),
    );
  });

  nuovaVisita = signal<VisitaMedicaDto>({
    id: 0,
    data: '',
    veterinario: '',
    esito: '',
    note: '',
    animale: undefined as any,
  });

  ngOnInit() {
    this.caricaTutte();
    this.caricaAnimali();
  }

  caricaTutte() {
    this.visitaService.getAll().subscribe({
      next: (data) => {
        this.visite.set(data);
      },
      error: (err) => console.error('Errore caricamento visite', err),
    });
  }

  caricaAnimali() {
    this.animaleService.getAll().subscribe({
      next: (data) => this.elencoAnimali.set(data),
      error: (err) => console.error('Errore caricamento animali', err),
    });
  }

  selezionaAnimale(a: AnimaleDto) {
    this.nuovaVisita.update((v) => ({ ...v, animale: a }));
    this.filtroAnimale.set('');
  }

  rimuoviAnimale() {
    this.nuovaVisita.update((v) => ({ ...v, animale: undefined as any }));
  }

  aggiungi() {
    const data = this.nuovaVisita();

    if (!data.data || !data.veterinario || !data.animale) {
      alert('Compila i campi obbligatori e seleziona un animale!');
      return;
    }

    const dataVisita = new Date(data.data);
    const anno = dataVisita.getFullYear();
    if (anno > 2100 || anno < 2000) {
      alert("La data inserita non è valida (controlla l'anno)!");
      return;
    }

    this.visitaService.insert(data).subscribe({
      next: (res) => {
        this.visite.update((list) => [res, ...list]);
        this.resetForm();
      },
      error: (err) => {
        console.error('Errore nel salvataggio:', err);
        alert('Errore nel salvataggio. Riprova o controlla la sessione.');
      },
    });
  }

  private resetForm() {
    this.nuovaVisita.set({
      id: 0,
      data: '',
      veterinario: '',
      esito: '',
      note: '',
      animale: undefined as any,
    });
    this.filtroAnimale.set('');
  }
}
