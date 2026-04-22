import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnimaleService } from '../../services/animale';
import { AnimaleDto } from '../../dto/animale';
import { MappaComponent } from '../mappa-centri/mappa-centri';
import { PraticaService } from '../../services/pratica';

@Component({
  selector: 'app-animali',
  standalone: true,
  imports: [CommonModule, FormsModule, MappaComponent],
  templateUrl: './animali.html',
  styleUrls: ['./animali.css'],
})
export class AnimaliComponent implements OnInit {
  public animaleService = inject(AnimaleService);
  private praticaService = inject(PraticaService);
  private sanitizer = inject(DomSanitizer);

  // Stati Generali
  isSendingPratica = signal(false);
  animali = signal<AnimaleDto[]>([]);
  isLoading = signal(false);
  animaleSelezionato = signal<AnimaleDto | null>(null);

  // Filtri
  selectedSpecie = signal('');
  selectedGenere = signal('');
  selectedCentroId = signal<number | null>(null);
  filterRazza = signal(''); // Signal per la razza

  // Paginazione Preferiti
  pagePreferiti = signal(0);

  nuovoAnimale = signal<Partial<AnimaleDto>>({
    nome: '',
    specie: '',
    razza: '',
    eta: 0,
    genere: 'Maschio',
    descrizione: '',
  });

  ngOnInit(): void {
    this.caricaTutti();
  }

  // Funzioni Paginazione
  nextPreferiti() {
    const totale = this.animaleService.listaPreferiti().length;
    if ((this.pagePreferiti() + 1) * 4 < totale) {
      this.pagePreferiti.update((v) => v + 1);
    }
  }

  prevPreferiti() {
    if (this.pagePreferiti() > 0) {
      this.pagePreferiti.update((v) => v - 1);
    }
  }

  isPreferito(animale: AnimaleDto): boolean {
    return this.animaleService.listaPreferiti().some((a) => a.id === animale.id);
  }

  // Logica Caricamento e Filtri
  caricaTutti() {
    this.selectedCentroId.set(null);
    this.isLoading.set(true);
    this.animaleService.getAllFiltrati().subscribe({
      next: (data) => this.processaDati(data),
      error: () => this.isLoading.set(false),
    });
  }

  onFilterChange() {
    this.isLoading.set(true);
    this.animaleService
      .getFiltered(this.selectedSpecie(), this.selectedGenere(), this.selectedCentroId())
      .subscribe({
        next: (data) => this.processaDati(data),
        error: () => this.isLoading.set(false),
      });
  }

  private processaDati(data: AnimaleDto[]) {
    let filtrati = data;
    if (this.filterRazza()) {
      filtrati = data.filter((a) =>
        a.razza?.toLowerCase().includes(this.filterRazza().toLowerCase()),
      );
    }
    const ordinati = filtrati.sort((a, b) => (b.eta ?? 0) - (a.eta ?? 0));
    this.animali.set(ordinati);
    this.isLoading.set(false);
  }

  resetFiltri() {
    this.selectedSpecie.set('');
    this.filterRazza.set('');
    this.selectedCentroId.set(null);
    this.caricaTutti();
  }

  // Altre utility
  getSafeVideoUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  avviaPratica(animaleId: number) {
    if (this.isSendingPratica()) return;
    this.isSendingPratica.set(true);
    this.praticaService.avviaPratica(animaleId).subscribe({
      next: () => {
        alert('Richiesta inviata!');
        this.isSendingPratica.set(false);
        this.chiudiDettagli();
      },
      error: (err) => {
        alert(err.error || 'Errore');
        this.isSendingPratica.set(false);
      },
    });
  }

  filtraPerCentro(idCentro: number) {
    this.selectedCentroId.set(idCentro);
    this.onFilterChange();
  }

  apriDettagli(a: AnimaleDto) {
    this.animaleSelezionato.set(a);
  }
  chiudiDettagli() {
    this.animaleSelezionato.set(null);
  }

  aggiungi() {
    this.animaleService.insert(this.nuovoAnimale() as AnimaleDto).subscribe({
      next: (salvato) => {
        this.animali.update((list) => [...list, salvato]);
        this.resetForm();
        alert('Animale registrato con successo!');
      },
      error: (err) => alert('Errore: ' + err.message),
    });
  }

  private resetForm() {
    this.nuovoAnimale.set({
      nome: '',
      specie: '',
      razza: '',
      eta: 0,
      genere: 'Maschio',
      descrizione: '',
    });
  }
}
