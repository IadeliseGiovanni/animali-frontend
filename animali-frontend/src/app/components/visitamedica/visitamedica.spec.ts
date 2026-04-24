import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitaMedicaComponent } from './visitamedica';
import { VisitaMedicaService } from '../../services/visitamedica';
import { AnimaleService } from '../../services/animale';
import { of } from 'rxjs';
import { AnimaleDto } from '../../dto/animale';
import { VisitaMedicaDto } from '../../dto/visitamedica';
import { vi, describe, it, expect, beforeEach } from 'vitest'; // Import necessari per Vitest

describe('VisitaMedicaComponent', () => {
  let component: VisitaMedicaComponent;
  let fixture: ComponentFixture<VisitaMedicaComponent>;

  // Mock dei servizi usando il pattern di Vitest
  let mockVisitaService: any;
  let mockAnimaleService: any;

  const mockAnimali: AnimaleDto[] = [
    { id: 1, nome: 'Rex', microchip: '123' } as AnimaleDto,
    { id: 2, nome: 'Fuffi', microchip: '456' } as AnimaleDto,
  ];

  const mockVisite: VisitaMedicaDto[] = [
    {
      id: 10,
      data: '2024-01-01',
      veterinario: 'Dott. Rossi',
      animale: mockAnimali[0],
      esito: 'In salute',
      note: 'Controllo annuale',
    },
  ];

  beforeEach(async () => {
    // Definizione dei mock con Vitest
    mockVisitaService = {
      getAll: vi.fn().mockReturnValue(of(mockVisite)),
      insert: vi.fn(),
      delete: vi.fn(),
    };

    mockAnimaleService = {
      getAll: vi.fn().mockReturnValue(of(mockAnimali)),
    };

    await TestBed.configureTestingModule({
      imports: [VisitaMedicaComponent],
      providers: [
        { provide: VisitaMedicaService, useValue: mockVisitaService },
        { provide: AnimaleService, useValue: mockAnimaleService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitaMedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('dovrebbe caricare visite e animali all’inizializzazione', () => {
    expect(component.visite()).toEqual(mockVisite);
    expect(component.elencoAnimali()).toEqual(mockAnimali);
    expect(mockVisitaService.getAll).toHaveBeenCalled();
  });

  it('dovrebbe filtrare gli animali correttamente (computed)', () => {
    component.filtroAnimale.set('Rex');
    // Non serve detectChanges per i computed se li leggiamo direttamente
    const filtrati = component.animaliFiltrati();
    expect(filtrati.length).toBe(1);
    expect(filtrati[0].nome).toBe('Rex');
  });

  it('dovrebbe selezionare un animale e resettare il filtro', () => {
    const animale = mockAnimali[1];
    component.selezionaAnimale(animale);

    expect(component.nuovaVisita().animale).toEqual(animale);
    expect(component.filtroAnimale()).toBe('');
  });

  it('non dovrebbe aggiungere una visita se i campi sono incompleti', () => {
    const spyAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.nuovaVisita.set({
      id: 0,
      data: '',
      veterinario: '',
      esito: '',
      note: '',
      animale: undefined as any,
    });

    component.aggiungi();

    expect(mockVisitaService.insert).not.toHaveBeenCalled();
    expect(spyAlert).toHaveBeenCalledWith('Compila i campi obbligatori e seleziona un animale!');
  });

  it('dovrebbe aggiungere una visita correttamente', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const nuova = {
      id: 0,
      data: '2024-05-05',
      veterinario: 'Dott. Bianchi',
      animale: mockAnimali[0],
    };
    const rispostaServer = { ...nuova, id: 99 };

    component.nuovaVisita.set(nuova as any);
    mockVisitaService.insert.mockReturnValue(of(rispostaServer as any));

    component.aggiungi();

    expect(mockVisitaService.insert).toHaveBeenCalled();
    expect(component.visite()).toContain(rispostaServer as any);
  });

  it('dovrebbe eliminare una visita dopo conferma', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockVisitaService.delete.mockReturnValue(of(void 0));

    component.elimina(10);

    expect(mockVisitaService.delete).toHaveBeenCalledWith(10);
    // Verifichiamo che la visita con ID 10 sia stata rimossa dal signal
    expect(component.visite().find((v) => v.id === 10)).toBeUndefined();
  });
});
