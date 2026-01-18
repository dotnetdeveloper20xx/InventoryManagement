import { Routes } from '@angular/router';

export const TRANSFERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./transfers-list/transfers-list.component').then(m => m.TransfersListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./transfer-form/transfer-form.component').then(m => m.TransferFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./transfer-detail/transfer-detail.component').then(m => m.TransferDetailComponent)
  }
];
