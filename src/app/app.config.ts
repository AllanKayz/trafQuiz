import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

import { routes } from './app.routes';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatNativeDateModule } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([
      ...routes,
      { path: 'vehicles', loadComponent: () => import('./components/vehicles/vehicles.component').then(m => m.VehiclesComponent) }
    ]),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(MatNativeDateModule)
  ]
};
