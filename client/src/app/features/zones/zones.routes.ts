import { Routes } from '@angular/router';

export const ZONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./zones-management/zones-management.component').then(m => m.ZonesManagementComponent)
  }
];
