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

  // Dati
  visite = signal<VisitaMedicaDto[]>([]);
  elencoAnimali = signal<AnimaleDto[]>([]);

  // Filtri per il form di inserimento
  filtroAnimale = signal('');

  // Filtri per la tabella dello storico
  termineRicercaVisite = signal('');
  filtroVeterinario = signal('');

  // 1. Filtraggio per la ricerca rapida nel form
  animaliFiltrati = computed(() => {
    const term = this.filtroAnimale().toLowerCase().trim();
    if (!term) return [];
    return this.elencoAnimali().filter(
      (a) => a.nome?.toLowerCase().includes(term) || a.microchip?.includes(term),
    );
  });

  // 2. Filtraggio per la tabella delle visite effettuate
  visiteFiltrate = computed(() => {
    let lista = this.visite();
    const search = this.termineRicercaVisite().toLowerCase().trim();
    const vet = this.filtroVeterinario().toLowerCase().trim();

    if (search) {
      lista = lista.filter((v) => v.animale?.nome?.toLowerCase().includes(search));
    }
    if (vet) {
      lista = lista.filter((v) => v.veterinario?.toLowerCase().includes(vet));
    }
    return lista;
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
      next: (data) => this.visite.set(data),
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

    this.visitaService.insert(data).subscribe({
      next: (res) => {
        this.visite.update((list) => [res, ...list]);
        this.resetForm();
        alert('Visita salvata correttamente!');
      },
      error: (err) => alert('Errore nel salvataggio.'),
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Sei sicuro di voler eliminare questa visita medica?')) {
      this.visitaService.delete(id).subscribe({
        next: () => {
          this.visite.update((list) => list.filter((v) => v.id !== id));
        },
        error: (err) => alert("Errore durante l'eliminazione."),
      });
    }
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
