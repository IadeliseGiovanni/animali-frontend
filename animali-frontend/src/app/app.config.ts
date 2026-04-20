import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'; // Rimosso 'Experimental'
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { authInterceptor } from './interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Usa la versione stabile
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])), // Configura HttpClient con fetch e interceptors
  ],
};
