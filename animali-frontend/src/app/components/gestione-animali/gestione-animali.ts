import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimaleDto } from '../../dto/animale'; // Verifica il percorso corretto del DTO
import { AnimaleService } from '../../services/animale'; // Verifica il percorso del service

@Component({
  selector: 'app-gestione-animali',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestione-animali.html',
  styleUrl: './gestione-animali.css', // Se hai creato anche il file CSS
})
export class GestioneAnimaliComponent implements OnInit {
  animali = signal<AnimaleDto[]>([]);

  nuovoAnimale = signal<Partial<AnimaleDto>>({
    nome: '',
    specie: '',
    microchip: '',
    genere: 'Maschio',
    descrizione: '',
    adottato: false,
    eta: 0,
  });

  constructor(private animaleService: AnimaleService) {}

  ngOnInit(): void {
    this.caricaAnimali();
  }

  caricaAnimali() {
    this.animaleService.getAll().subscribe({
      next: (data) => this.animali.set(data),
      error: (err) => console.error('Errore nel caricamento', err),
    });
  }

  aggiungi() {
    const data = this.nuovoAnimale() as AnimaleDto;
    if (!data.nome || !data.specie || !data.microchip) {
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

  /*
  elimina(id: number) {
    if (confirm("Sei sicuro di voler eliminare questo animale?")) {
      this.animaleService.delete(id).subscribe({
        next: () => {
          this.animali.update(list => list.filter(a => a.id !== id));
        }
      });
    }
  }*/

  private resetForm() {
    this.nuovoAnimale.set({
      nome: '',
      specie: '',
      microchip: '',
      genere: 'Maschio',
      descrizione: '',
      adottato: false,
      eta: 0,
    });
  }
}
