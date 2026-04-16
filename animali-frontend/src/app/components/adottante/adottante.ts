import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdottanteService } from '../../services/adottante';
import { AdottanteDto } from '../../dto/adottante';

@Component({
  selector: 'app-adottante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adottante.html',
  styleUrl: './adottante.css',
})
export class AdottanteComponent implements OnInit {
  private adottanteService = inject(AdottanteService);

  adottanti = signal<AdottanteDto[]>([]);
  searchCognome = signal('');
  isLoading = signal(false);

  ngOnInit() {
    this.caricaTutti();
  }

  caricaTutti() {
    this.isLoading.set(true);
    this.adottanteService.getAll().subscribe({
      next: (data) => {
        this.adottanti.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  cerca() {
    if (this.searchCognome().trim() === '') {
      this.caricaTutti();
      return;
    }
    this.adottanteService.findByCognome(this.searchCognome()).subscribe((data) => {
      this.adottanti.set(data);
    });
  }
}
