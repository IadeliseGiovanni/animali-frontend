import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'; // Rimosso 'Experimental'
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Usa la versione stabile
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(),
  ],
};
