import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { importProvidersFrom } from '@angular/core';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([
      ...routes,
      { path: 'vehicles', loadComponent: () => import('./components/vehicles/vehicles.component').then(m => m.VehiclesComponent) }
    ]),
    provideAnimationsAsync(),
    provideHttpClient()
  ]
};
