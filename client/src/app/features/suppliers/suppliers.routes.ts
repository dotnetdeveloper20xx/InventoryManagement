import { Routes } from '@angular/router';

export const SUPPLIERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./supplier-list/supplier-list.component').then(m => m.SupplierListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./supplier-form/supplier-form.component').then(m => m.SupplierFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./supplier-form/supplier-form.component').then(m => m.SupplierFormComponent)
  }
];
