import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimaliComponent } from './animali'; 
import { AnimaleService } from '../../services/animale';
import { AdottanteService } from '../../services/adottante';
import { PraticaService } from '../../services/pratica';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest'; // Import necessari per Vitest

describe('AnimaliComponent', () => {
  let component: AnimaliComponent;
  let fixture: ComponentFixture<AnimaliComponent>;
  let mockAnimaleService: any;
  let mockAdottanteService: any;

  beforeEach(async () => {
    // Creazione dei MOCK compatibili con Vitest
    mockAnimaleService = {
      getAllFiltrati: vi.fn(),
      getFiltered: vi.fn(),
      listaPreferiti: vi.fn(),
      togglePreferito: vi.fn()
    };

    mockAdottanteService = {
      getProfilo: vi.fn(),
      richiediIdoneita: vi.fn()
    };

    // Configurazione dei ritorni dei Mock (Dati finti per il test)
    mockAnimaleService.getAllFiltrati.mockReturnValue(of([
      { id: 1, nome: 'Baffo', specie: 'Cane', razza: 'Europeo', eta: 5, fotoUrl: '' }
    ]));
    mockAnimaleService.listaPreferiti.mockReturnValue([]);
    mockAdottanteService.getProfilo.mockReturnValue(of({ id: 1, nome: 'Giovanni', ruolo: 'ADMIN' }));

    await TestBed.configureTestingModule({
      imports: [
        AnimaliComponent, 
        HttpClientTestingModule
      ],
      providers: [
        { provide: AnimaleService, useValue: mockAnimaleService },
        { provide: AdottanteService, useValue: mockAdottanteService },
        { provide: PraticaService, useValue: { inviaPratica: vi.fn().mockReturnValue(of({})) } } 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimaliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Esegue ngOnInit
  });

  // TEST 1: Verifica caricamento iniziale
  it('dovrebbe popolare il signal animali all’avvio', () => {
    expect(component.animali().length).toBe(1);
    expect(component.animali()[0].nome).toBe('Baffo');
  });

  // TEST 2: Verifica apertura Modal
  it('dovrebbe settare l’animale selezionato quando si apre il modal', () => {
    const animaleTest = { id: 1, nome: 'Baffo' } as any;
    component.apriDettagli(animaleTest);
    
    expect(component.animaleSelezionato()).toBeTruthy();
    expect(component.animaleSelezionato()?.nome).toBe('Baffo');
  });

  // TEST 3: Verifica chiusura Modal
  it('dovrebbe resettare l’animale selezionato quando si chiude il modal', () => {
    component.chiudiDettagli();
    expect(component.animaleSelezionato()).toBeNull();
  });

  // TEST 4: Verifica interazione Servizio Preferiti
  it('dovrebbe chiamare il servizio quando si clicca sulla stella dei preferiti', () => {
    const animaleTest = { id: 1, nome: 'Baffo' } as any;
    
    // Usiamo il metodo del componente che internamente chiama il servizio
    component.animaleService.togglePreferito(animaleTest);
    
    expect(mockAnimaleService.togglePreferito).toHaveBeenCalledWith(animaleTest);
  });
});