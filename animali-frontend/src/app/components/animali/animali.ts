import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnimaleService } from '../../services/animale';
import { AnimaleDto } from '../../dto/animale';
import { MappaComponent } from '../mappa-centri/mappa-centri';
import { PraticaService } from '../../services/pratica';
import { AdottanteDto } from '../../dto/adottante';
import { AdottanteService } from '../../services/adottante';
import { RouterLink } from '@angular/router';
import { CentroAdozioneService } from '../../services/centroadozione';
import { CentroAdozioneDto } from '../../dto/centroadozioni';

@Component({
  selector: 'app-animali',
  standalone: true,
  imports: [CommonModule, FormsModule, MappaComponent, RouterLink],
  templateUrl: './animali.html',
  styleUrls: ['./animali.css'],
})
export class AnimaliComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  public animaleService = inject(AnimaleService);
  private praticaService = inject(PraticaService);
  private sanitizer = inject(DomSanitizer);
  private adottanteService = inject(AdottanteService);
  private centroService = inject(CentroAdozioneService);

  animali = signal<AnimaleDto[]>([]);
  isLoading = signal(false);
  isSendingPratica = signal(false);
  animaleSelezionato = signal<AnimaleDto | null>(null);
  profilo = signal<AdottanteDto | null>(null);

  selectedSpecie = signal('');
  selectedGenere = signal('');
  selectedCentroId = signal<number | null>(null);
  filterRazza = signal('');
  pagePreferiti = signal(0);
  centri = signal<CentroAdozioneDto[]>([]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.caricaTutti();
      this.caricaProfilo();
      this.caricaCentri();
    }
  }

  getSafeVideoUrl(url: string | undefined): SafeResourceUrl {
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : '';
  }

  apriDettagli(a: AnimaleDto) {
    console.log('Dettagli DTO ricevuti:', a);
    this.animaleSelezionato.set(a);
  }

  chiudiDettagli() {
    this.animaleSelezionato.set(null);
  }

  caricaTutti() {
    this.isLoading.set(true);
    this.animaleService.getAllFiltrati().subscribe({
      next: (data) => {
        this.animali.set(data.sort((a, b) => (b.eta ?? 0) - (a.eta ?? 0)));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  caricaCentri() {
    this.centroService.getAll().subscribe({
      next: (data) => this.centri.set(data),
      error: (err) => console.error('Errore caricamento centri:', err),
    });
  }

  onFilterChange() {
    this.isLoading.set(true);
    this.animaleService
      .getFiltered(this.selectedSpecie(), this.selectedGenere(), this.selectedCentroId())
      .subscribe({
        next: (data) => {
          this.animali.set(
            this.filterRazza()
              ? data.filter((a) =>
                  a.razza?.toLowerCase().includes(this.filterRazza().toLowerCase()),
                )
              : data,
          );
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  filtraPerCentro(id: number) {
    this.selectedCentroId.set(id);
    this.onFilterChange();
  }
  resetFiltroCentro() {
    this.selectedCentroId.set(null);
    this.onFilterChange();
  }
  resetFiltri() {
    this.selectedSpecie.set('');
    this.filterRazza.set('');
    this.selectedCentroId.set(null);
    this.caricaTutti();
  }
  isPreferito(a: AnimaleDto) {
    return this.animaleService.listaPreferiti().some((p) => p.id === a.id);
  }
  nextPreferiti() {
    this.pagePreferiti.update((v) => v + 1);
  }
  prevPreferiti() {
    this.pagePreferiti.update((v) => v - 1);
  }

  avviaPratica(id: number) {
    this.isSendingPratica.set(true);
    this.praticaService.avviaPratica(id).subscribe({
      next: () => {
        alert('Successo!');
        this.isSendingPratica.set(false);
        this.chiudiDettagli();
      },
      error: () => {
        alert('Errore!');
        this.isSendingPratica.set(false);
      },
    });
  }

  inviaRichiestaIdoneita() {
    const p = this.profilo();
    if (p?.id) {
      this.adottanteService.richiediIdoneita(p.id).subscribe({
        next: () => this.profilo.update((c) => (c ? { ...c, statoIdoneita: 'IN_ATTESA' } : null)),
      });
    }
  }

  caricaProfilo() {
    this.adottanteService.getProfilo().subscribe({
      next: (data) => this.profilo.set(data),
      error: (err) => console.error(err),
    });
  }
}
