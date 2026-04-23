import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnimaleService } from '../../services/animale';
import { AnimaleDto } from '../../dto/animale';
import { MappaComponent } from '../mappa-centri/mappa-centri';
import { PraticaService } from '../../services/pratica';
import { AdottanteDto } from '../../dto/adottante';
import { AdottanteService } from '../../services/adottante';

@Component({
  selector: 'app-animali',
  standalone: true,
  imports: [CommonModule, FormsModule, MappaComponent],
  templateUrl: './animali.html',
  styleUrls: ['./animali.css'],
})
export class AnimaliComponent implements OnInit {
  // Iniezione dei servizi
  public animaleService = inject(AnimaleService);
  private praticaService = inject(PraticaService);
  private sanitizer = inject(DomSanitizer);
  private adottanteService = inject(AdottanteService);

  // Stato dell'applicazione (Signals)
  animali = signal<AnimaleDto[]>([]);
  isLoading = signal(false);
  isSendingPratica = signal(false);
  animaleSelezionato = signal<AnimaleDto | null>(null);
  profilo = signal<AdottanteDto | null>(null);

  // Filtri
  selectedSpecie = signal('');
  selectedGenere = signal('');
  selectedCentroId = signal<number | null>(null);
  filterRazza = signal('');

  // Paginazione per la sezione preferiti nella sidebar
  pagePreferiti = signal(0);

  ngOnInit(): void {
    this.caricaTutti();
    this.caricaProfilo();
  }

  // --- GESTIONE VIDEO ---
  getSafeVideoUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    // Consente ad Angular di caricare l'URL del video dal DB senza bloccarlo
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // --- APERTURA E CHIUSURA DETTAGLI ---
  apriDettagli(a: AnimaleDto) {
    console.log('Apertura dettagli per:', a.nome);
    this.animaleSelezionato.set(a);
  }

  chiudiDettagli() {
    this.animaleSelezionato.set(null);
  }

  // --- CARICAMENTO DATI ---
  caricaTutti() {
    this.isLoading.set(true);
    this.animaleService.getAllFiltrati().subscribe({
      next: (data) => {
        // Ordiniamo per età decrescente come esempio
        const ordinati = data.sort((a, b) => (b.eta ?? 0) - (a.eta ?? 0));
        this.animali.set(ordinati);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento:', err);
        this.isLoading.set(false);
      },
    });
  }

  onFilterChange() {
    this.isLoading.set(true);
    this.animaleService
      .getFiltered(this.selectedSpecie(), this.selectedGenere(), this.selectedCentroId())
      .subscribe({
        next: (data) => {
          let filtrati = data;
          // Filtro aggiuntivo per razza testuale
          if (this.filterRazza()) {
            filtrati = data.filter((a) =>
              a.razza?.toLowerCase().includes(this.filterRazza().toLowerCase()),
            );
          }
          this.animali.set(filtrati);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  // --- GESTIONE MAPPA ---
  filtraPerCentro(idCentro: number) {
    this.selectedCentroId.set(idCentro);
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

  // --- PREFERITI (LOGICA E PAGINAZIONE) ---
  isPreferito(animale: AnimaleDto): boolean {
    return this.animaleService.listaPreferiti().some((a) => a.id === animale.id);
  }

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

  // --- AZIONI ---
  avviaPratica(animaleId: number) {
    this.isSendingPratica.set(true);
    this.praticaService.avviaPratica(animaleId).subscribe({
      next: () => {
        alert('Richiesta di adozione inviata con successo!');
        this.isSendingPratica.set(false);
        this.chiudiDettagli();
      },
      error: (err) => {
        console.error('Errore invio pratica:', err);
        alert("Errore durante l'invio della richiesta.");
        this.isSendingPratica.set(false);
      },
    });
  }

  inviaRichiestaIdoneita() {
    const p = this.profilo();
    if (!p?.id) return;

    this.adottanteService.richiediIdoneita(p.id).subscribe({
      next: () => {
        // Se arrivi qui, il server ha risposto 200 OK
        this.profilo.update((curr) => (curr ? { ...curr, statoIdoneita: 'IN_ATTESA' } : null));
      },
      error: (err) => {
        alert('Errore server: i dati non sono stati salvati.');
      },
    });
  }

  caricaProfilo() {
    this.adottanteService.getProfilo().subscribe({
      next: (data) => {
        console.log('Dati ricevuti dal DB:', data);
        // CONTROLLA IN CONSOLE: statoIdoneita deve essere 'IN_ATTESA'
        this.profilo.set(data);
      },
      error: (err) => console.error('Errore nel caricamento profilo:', err),
    });
  }
}
