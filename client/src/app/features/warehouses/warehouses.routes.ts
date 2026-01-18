import { Routes } from '@angular/router';

export const WAREHOUSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./warehouse-list/warehouse-list.component').then(m => m.WarehouseListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./warehouse-form/warehouse-form.component').then(m => m.WarehouseFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./warehouse-form/warehouse-form.component').then(m => m.WarehouseFormComponent)
  }
];
