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
  isEditMode = signal(false);

  // Stato per il Cambio Password
  isUpdatingPwd = signal(false);
  pwdData = { old: '', new: '' };

  // Filtri e Paginazione Lista Utenti
  searchTerm = signal('');
  filtroIdoneita = signal<'TUTTI' | 'IDONEI' | 'NON_IDONEI'>('TUTTI');
  filtroRuolo = signal<string>('TUTTI');
  paginaCorrente = signal(1);
  elementiPerPagina = 15;
  nuovaEmailInserita = signal<string>('');
  isSendingEmail = signal<boolean>(false);

  // Paginazione Animali Adottati (Nuovo)
  paginaAnimali = signal(1);
  animaliPerPagina = 6;

  // --- LOGICA REATTIVA LISTA UTENTI ---
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
    if (ruolo !== 'TUTTI') list = list.filter((a) => a.ruolo === ruolo);

    return list;
  });

  listaPaginata = computed(() => {
    const inizio = (this.paginaCorrente() - 1) * this.elementiPerPagina;
    return this.listaFiltrata().slice(inizio, inizio + this.elementiPerPagina);
  });

  totalePagine = computed(() => Math.ceil(this.listaFiltrata().length / this.elementiPerPagina));

  // --- LOGICA REATTIVA ANIMALI ADOTTATI ---
  animaliPaginati = computed(() => {
    const p = this.profilo();
    if (!p || !p.animaliAdottati) return [];
    const inizio = (this.paginaAnimali() - 1) * this.animaliPerPagina;
    return p.animaliAdottati.slice(inizio, inizio + this.animaliPerPagina);
  });

  totalePagineAnimali = computed(() => {
    const p = this.profilo();
    if (!p || !p.animaliAdottati) return 0;
    return Math.ceil(p.animaliAdottati.length / this.animaliPerPagina);
  });

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
        alert('Errore: ' + (err.error?.message || "Errore durante l'aggiornamento"));
        this.isUpdatingPwd.set(false);
      },
    });
  }

  selezionaProfilo(adottante: AdottanteDto) {
    this.profilo.set(adottante);
    this.paginaAnimali.set(1); // Reset della paginazione animali
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
            lista.map((a) => {
              if (a.id === adottante.id) {
                return {
                  ...a,
                  isSchedato: nuovoStato,
                  // SE l'admin toglie l'idoneità (false), resettiamo lo stato testuale
                  // altrimenti lo impostiamo su IDONEO
                  statoIdoneita: nuovoStato ? 'IDONEO' : 'NON_RICHIESTA',
                };
              }
              return a;
            }),
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

  getEta(dataDiNascita: any): number {
    // Il tuo DTO Java usa 'dataDiNascita'
    if (!dataDiNascita) return 0;

    // Gestione se la data arriva come stringa o array dal backend (LocalDateTime)
    const nascita = new Date(dataDiNascita);
    const oggi = new Date();

    if (isNaN(nascita.getTime())) return 0;

    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
      eta--;
    }
    return eta;
  }

  getTestoEta(dataDiNascita: any): string {
    const anni = this.getEta(dataDiNascita);
    return anni <= 0 ? 'Non specificata' : `${anni} anni`;
  }

  getpagineArray() {
    return Array.from({ length: this.totalePagine() }, (_, i) => i + 1);
  }

  getpagineAnimaliArray() {
    return Array.from({ length: this.totalePagineAnimali() }, (_, i) => i + 1);
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
        error: () => alert('Errore durante la generazione del contratto.'),
      });
  }

  cancellaAccount() {
    const p = this.profilo();
    if (!p || !p.id) return;

    if (confirm("Sei sicuro di voler cancellare il tuo account? L'azione è irreversibile.")) {
      this.adottanteService.delete(p.id).subscribe({
        next: () => {
          alert('Account eliminato.');
          this.authService.logout(); // Reindirizza alla login
        },
        error: () => alert('Errore durante la cancellazione.'),
      });
    }
  }

  salvaProfilo() {
    const p = this.profilo();
    if (!p || !p.id) return;

    this.adottanteService.patch(p.id, p).subscribe({
      next: (datoAggiornato) => {
        // TRUCCO: Formatta la data prima di settare il signal
        if (datoAggiornato.dataDiNascita) {
          const d = new Date(datoAggiornato.dataDiNascita);
          datoAggiornato.dataDiNascita = d.toISOString().split('T')[0];
        }

        // Aggiorna il profilo: questo scatenerà il ricalcolo di getTestoEta(p.dataDiNascita)
        this.profilo.set({ ...datoAggiornato });

        alert('Profilo aggiornato con successo!');
      },
      error: () => alert("Errore durante l'aggiornamento."),
    });
  }

  inviaRichiestaIdoneita() {
    const p = this.profilo();
    if (!p || !p.id) return;

    this.isLoading.set(true); // Feedback visivo
    this.adottanteService.richiediIdoneita(p.id).subscribe({
      next: (res) => {
        // Aggiorniamo il profilo locale per nascondere il bottone e mostrare lo stato
        this.profilo.update((old) => (old ? { ...old, statoIdoneita: 'IN_ATTESA' } : null));
        this.isLoading.set(false);
        alert('Richiesta inviata! Controlla la tua email per la conferma 🐾');
      },
      error: (err) => {
        this.isLoading.set(false);
        alert('Errore: ' + (err.error?.message || 'Impossibile inviare la richiesta.'));
      },
    });
  }

  richiediCambioEmail(id: number | undefined, nuovaEmail: string) {
    // Controllo di sicurezza: se l'ID manca, non procedere
    if (id === undefined) {
      console.error('ID Adottante non valido');
      return;
    }

    if (!nuovaEmail) {
      alert("Inserisci un'email valida");
      return;
    }

    this.adottanteService.richiediCambioEmail(id, nuovaEmail).subscribe({
      next: () => {
        alert('Email di conferma inviata!');
      },
      error: (err) => alert('Errore: ' + err.message),
    });
  }

  cambiaPassword(id: number, vecchia: string, nuova: string, conferma: string) {
    if (nuova !== conferma) {
      alert('La nuova password e la conferma non coincidono!');
      return;
    }

    this.adottanteService.cambiaPassword(id, vecchia, nuova).subscribe({
      next: () => {
        alert('Password aggiornata! Riceverai una mail di conferma.');
        // Pulisci i campi o chiudi il modal
      },
      error: (err) => alert('Errore: ' + err.error.error),
    });
  }
}
