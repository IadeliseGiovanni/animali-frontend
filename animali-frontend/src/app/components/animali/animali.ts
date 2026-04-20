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
  private animaleService = inject(AnimaleService);
  private praticaService = inject(PraticaService);
  private sanitizer = inject(DomSanitizer); 

  isSendingPratica = signal(false);
  animali = signal<AnimaleDto[]>([]);
  isLoading = signal(false);
  animaleSelezionato = signal<AnimaleDto | null>(null);
  selectedSpecie = signal('');
  selectedGenere = signal('');
  selectedCentroId = signal<number | null>(null);

  ngOnInit(): void {
    this.caricaTutti();
  }

  // --- SICUREZZA MULTIMEDIALE ---
  // Risolve il problema della pagina grigia autorizzando l'URL del video
  getSafeVideoUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    // Questo comunica ad Angular che l'URL proveniente dal DB è sicuro
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // --- ALGORITMO SENIOR FIRST ---
  private applicaAlgoritmoSenior(lista: AnimaleDto[]): AnimaleDto[] {
    return lista.sort((a, b) => (b.eta ?? 0) - (a.eta ?? 0));
  }

  avviaPratica(animaleId: number) {
    if (this.isSendingPratica()) return;
    this.isSendingPratica.set(true);

    this.praticaService.avviaPratica(animaleId).subscribe({
      next: () => {
        alert('Richiesta inviata con successo! Il centro adozioni esaminerà la tua pratica.');
        this.isSendingPratica.set(false);
        this.chiudiDettagli();
      },
      error: (err) => {
        const messaggioErrore = err.error || "Si è verificato un errore.";
        alert(messaggioErrore);
        this.isSendingPratica.set(false);
      },
    });
  }

  caricaTutti() {
    this.selectedCentroId.set(null);
    this.isLoading.set(true);
    this.animaleService.getAll().subscribe({
      next: (data) => {
        const ordinati = this.applicaAlgoritmoSenior(data);
        this.animali.set(ordinati);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  filtraPerCentro(idCentro: number) {
    this.selectedCentroId.set(idCentro);
    this.onFilterChange();
  }

  onFilterChange() {
    this.isLoading.set(true);
    this.animaleService
      .getFiltered(
        this.selectedSpecie(),
        this.selectedGenere(),
        this.selectedCentroId(),
      )
      .subscribe({
        next: (data) => {
          const ordinati = this.applicaAlgoritmoSenior(data);
          this.animali.set(ordinati);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  resetFiltri() {
    this.selectedSpecie.set('');
    this.selectedGenere.set('');
    this.selectedCentroId.set(null);
    this.caricaTutti();
  }

  apriDettagli(a: AnimaleDto) {
    this.animaleSelezionato.set(a);
  }

  chiudiDettagli() {
    this.animaleSelezionato.set(null);
  }
}