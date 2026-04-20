import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdottanteService } from '../../services/adottante';
import { AdottanteDto } from '../../dto/adottante';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adottante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adottante.html',
  styleUrl: './adottante.css',
})
export class AdottanteComponent implements OnInit {
  private adottanteService = inject(AdottanteService);
  private router = inject(Router);
  public authService = inject(AuthService);
  private http = inject(HttpClient);

  // Stato dei dati
  profilo = signal<AdottanteDto | null>(null);
  listaAdottanti = signal<AdottanteDto[]>([]);
  isLoading = signal(true);
  isListaMode = signal(false);
  provenienzaDaLista = signal(false);

  // Stato per il Cambio Password (REINSERITO)
  isUpdatingPwd = signal(false);
  pwdData = { old: '', new: '' };

  // Filtri e Paginazione
  searchTerm = signal('');
  filtroIdoneita = signal<'TUTTI' | 'IDONEI' | 'NON_IDONEI'>('TUTTI');
  filtroRuolo = signal<string>('TUTTI');
  paginaCorrente = signal(1);
  elementiPerPagina = 15;

  // LOGICA DI FILTRO REATTIVA
  listaFiltrata = computed(() => {
    let list = this.listaAdottanti();
    const search = this.searchTerm().toLowerCase();
    const idoneita = this.filtroIdoneita();
    const ruolo = this.filtroRuolo();

    if (search) {
      list = list.filter(
        (a) =>
          a.nome?.toLowerCase().includes(search) ||
          a.cognome?.toLowerCase().includes(search) ||
          a.email?.toLowerCase().includes(search) ||
          a.codiceFiscale?.toLowerCase().includes(search),
      );
    }

    if (idoneita === 'IDONEI') list = list.filter((a) => a.isSchedato);
    if (idoneita === 'NON_IDONEI') list = list.filter((a) => !a.isSchedato);

    if (ruolo !== 'TUTTI') {
      list = list.filter((a) => a.ruolo === ruolo);
    }

    return list;
  });

  listaPaginata = computed(() => {
    const inizio = (this.paginaCorrente() - 1) * this.elementiPerPagina;
    return this.listaFiltrata().slice(inizio, inizio + this.elementiPerPagina);
  });

  totalePagine = computed(() => Math.ceil(this.listaFiltrata().length / this.elementiPerPagina));

  ngOnInit() {
    this.caricamentoIniziale();
  }

  caricamentoIniziale() {
    this.isLoading.set(true);
    const isLista = this.router.url.includes('/adottanti');
    this.isListaMode.set(isLista);

    if (isLista) {
      this.caricaListaCompleta();
    } else {
      this.caricaMioProfilo();
    }
  }

  caricaListaCompleta() {
    this.adottanteService.getAll().subscribe({
      next: (data) => {
        this.listaAdottanti.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  caricaMioProfilo() {
    this.adottanteService.getProfilo().subscribe({
      next: (data) => {
        this.profilo.set(data);
        this.provenienzaDaLista.set(false);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // NUOVO METODO: Gestione Cambio Password
  aggiornaPassword() {
    if (!this.pwdData.old || !this.pwdData.new) return;

    this.isUpdatingPwd.set(true);
    this.authService.changePassword(this.pwdData.old, this.pwdData.new).subscribe({
      next: (res) => {
        alert(res.message || 'Password aggiornata con successo!');
        this.pwdData = { old: '', new: '' };
        this.isUpdatingPwd.set(false);
      },
      error: (err) => {
        console.error('ERRORE:', err);
        const msg = err.error?.message || "Errore durante l'aggiornamento";
        alert('Errore: ' + msg);
        this.isUpdatingPwd.set(false);
      },
    });
  }

  selezionaProfilo(adottante: AdottanteDto) {
    this.profilo.set(adottante);
    this.provenienzaDaLista.set(true);
    this.isListaMode.set(false);
  }

  tornaAllaLista() {
    this.profilo.set(null);
    this.isListaMode.set(true);
  }

  cambiaIdoneita(adottante: AdottanteDto, event: any) {
    const nuovoStato = event.target.value === 'true';
    if (adottante.id) {
      this.adottanteService.updateIdoneita(adottante.id, nuovoStato).subscribe({
        next: () => {
          this.listaAdottanti.update((lista) =>
            lista.map((a) => (a.id === adottante.id ? { ...a, isSchedato: nuovoStato } : a)),
          );
        },
      });
    }
  }

  cambiaRuolo(adottante: AdottanteDto, event: any) {
    const nuovoRuolo = event.target.value;
    if (adottante.id) {
      this.adottanteService.updateRuolo(adottante.id, nuovoRuolo).subscribe({
        next: () => {
          this.listaAdottanti.update((lista) =>
            lista.map((a) => (a.id === adottante.id ? { ...a, ruolo: nuovoRuolo } : a)),
          );
        },
      });
    }
  }

  getEta(dataNascita: any): number {
    if (!dataNascita) return 0;
    let dataConvertita = dataNascita;
    if (typeof dataNascita === 'string' && dataNascita.includes('/')) {
      const parti = dataNascita.split('/');
      dataConvertita = `${parti[2]}-${parti[1]}-${parti[0]}`;
    }
    const nascita = new Date(dataConvertita);
    const oggi = new Date();
    if (isNaN(nascita.getTime())) return 0;
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
      eta--;
    }
    return eta;
  }

  getTestoEta(dataNascita: any): string {
    const anni = this.getEta(dataNascita);
    return anni <= 0 ? 'Non specificata' : `${anni} anni`;
  }

  getpagineArray() {
    return Array.from({ length: this.totalePagine() }, (_, i) => i + 1);
  }

  scaricaContratto(animale: any, utente: any) {
    const adozioneRequest = { idAnimale: animale.id, idAdottante: utente.id };
    this.http
      .post('http://localhost:8080/api/animali/genera-contratto', adozioneRequest, {
        responseType: 'blob',
        observe: 'response',
      })
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          if (response.body) {
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Contratto_${animale.nome}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        },
        error: (err) => alert('Errore durante la generazione del contratto.'),
      });
  }
}
