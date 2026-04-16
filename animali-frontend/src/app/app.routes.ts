import { Routes } from '@angular/router';
import { VisitaMedicaComponent } from './components/visitamedica/visitamedica';
import { LoginComponent } from './components/login/login';
import { AnimaliComponent } from './components/animali/animali';
import { VolontarioComponent } from './components/volontario/volontario';
import { AdottanteComponent } from './components/adottante/adottante';
import { CentroAdozioneComponent } from './components/centroadozione/centroadozione';
import { RegisterComponent } from './components/register/register';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'animali', component: AnimaliComponent },
  { path: 'visite', component: VisitaMedicaComponent },
  { path: 'volontari', component: VolontarioComponent },
  { path: 'adottanti', component: AdottanteComponent },
  { path: 'centri', component: CentroAdozioneComponent },
  { path: 'registrati', component: RegisterComponent },
  { path: '', redirectTo: '/animali', pathMatch: 'full' },
];
