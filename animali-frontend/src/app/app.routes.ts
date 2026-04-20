import { Routes } from '@angular/router';
import { VisitaMedicaComponent } from './components/visitamedica/visitamedica';
import { LoginComponent } from './components/login/login';
import { AnimaliComponent } from './components/animali/animali';
import { VolontarioComponent } from './components/volontario/volontario';
import { AdottanteComponent } from './components/adottante/adottante';
import { CentroAdozioneComponent } from './components/centroadozione/centroadozione';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth.guard';
// 1. IMPORTA IL NUOVO COMPONENTE
import { GestionePraticheComponent } from './components/gestione-pratiche/gestione-pratiche';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'animali', component: AnimaliComponent },

  // Rotta per il profilo personale
  { path: 'adottante', component: AdottanteComponent, canActivate: [authGuard] },

  // Rotta per la lista admin
  { path: 'adottanti', component: AdottanteComponent, canActivate: [authGuard] },

  { path: 'volontari', component: VolontarioComponent, canActivate: [authGuard] },
  { path: 'centri', component: CentroAdozioneComponent, canActivate: [authGuard] },

  // 2. AGGIUNGI LA ROTTA PER LE PRATICHE
  { path: 'gestione-pratiche', component: GestionePraticheComponent, canActivate: [authGuard] },

  { path: 'registrati', component: RegisterComponent },

  { path: '', redirectTo: '/animali', pathMatch: 'full' },
  { path: '**', redirectTo: '/animali' },
];
