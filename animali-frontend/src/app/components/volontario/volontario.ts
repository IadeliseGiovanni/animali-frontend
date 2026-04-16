import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolontarioService } from '../../services/volontario';
import { VolontarioDto } from '../../dto/volontario';

@Component({
  selector: 'app-volontario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './volontario.html',
  styleUrl: './volontario.css',
})
export class VolontarioComponent implements OnInit {
  private volontarioService = inject(VolontarioService);

  volontari = signal<VolontarioDto[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);

  ngOnInit() {
    this.caricaTutti();
  }

  caricaTutti() {
    this.isLoading.set(true);
    this.volontarioService.getAll().subscribe({
      next: (data) => {
        this.volontari.set(data as VolontarioDto[]);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSearch() {
    if (this.searchTerm().trim() === '') {
      this.caricaTutti();
      return;
    }
    this.volontarioService.search(this.searchTerm()).subscribe((data) => {
      this.volontari.set(data);
    });
  }

  elimina(id: number | undefined) {
    if (id && confirm('Sei sicuro di voler eliminare questo volontario?')) {
      this.volontarioService.delete(id).subscribe(() => {
        this.volontari.update((list) => list.filter((v) => v.id !== id));
      });
    }
  }
}
