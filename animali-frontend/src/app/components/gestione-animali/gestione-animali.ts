import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimaleDto } from '../../dto/animale';
import { AnimaleService } from '../../services/animale';
import { CentroAdozioneService } from '../../services/centroadozione';
import { CentroAdozioneDto } from '../../dto/centroadozioni';

@Component({
  selector: 'app-gestione-animali',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestione-animali.html',
  styleUrl: './gestione-animali.css',
})
export class GestioneAnimaliComponent implements OnInit {
  private animaleService = inject(AnimaleService);
  private centroService = inject(CentroAdozioneService);

  animali = signal<AnimaleDto[]>([]);
  centri = signal<CentroAdozioneDto[]>([]);

  // Filtri UI
  filtroTesto = signal('');
  mostraSoloDisponibili = signal(false);

  // Calcola la lista da visualizzare in base ai filtri
  animaliFiltrati = computed(() => {
    let lista = this.animali();
    const cerca = this.filtroTesto().toLowerCase().trim();

    // Filtro Disponibilità
    if (this.mostraSoloDisponibili()) {
      lista = lista.filter((a) => !a.adottato);
    }

    // Filtro Ricerca Testuale
    if (cerca) {
      lista = lista.filter(
        (a) => a.nome?.toLowerCase().includes(cerca) || a.microchip?.includes(cerca),
      );
    }

    return lista;
  });

  nuovoAnimale = signal<Partial<AnimaleDto>>({
    nome: '',
    specie: 'Cane',
    microchip: '',
    genere: 'Maschio',
    descrizione: '',
    adottato: false,
    eta: 0,
    centroAdozione: undefined,
  });

  ngOnInit(): void {
    this.caricaAnimali();
    this.caricaCentri();
  }

  caricaAnimali() {
    this.animaleService.getAll().subscribe({
      next: (data) => this.animali.set(data),
      error: (err) => console.error('Errore nel caricamento animali', err),
    });
  }

  caricaCentri() {
    this.centroService.getAll().subscribe({
      next: (data) => this.centri.set(data),
      error: (err) => console.error('Errore nel caricamento centri', err),
    });
  }

  aggiungi() {
    const data = this.nuovoAnimale() as AnimaleDto;
    if (!data.nome || !data.specie || !data.microchip || !data.centroAdozione) {
      alert('Compila i campi obbligatori!');
      return;
    }

    this.animaleService.insert(data).subscribe({
      next: (res) => {
        this.animali.update((list) => [...list, res]);
        this.resetForm();
      },
      error: (err) => alert('Errore nel salvataggio'),
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Sei sicuro di voler eliminare questo animale?')) {
      this.animaleService.delete(id).subscribe({
        next: () => {
          this.animali.update((list) => list.filter((a) => a.id !== id));
        },
        error: (err) => alert("Errore durante l'eliminazione."),
      });
    }
  }

  private resetForm() {
    this.nuovoAnimale.set({
      nome: '',
      specie: 'Cane',
      microchip: '',
      genere: 'Maschio',
      descrizione: '',
      adottato: false,
      eta: 0,
      centroAdozione: undefined,
    });
  }
}
