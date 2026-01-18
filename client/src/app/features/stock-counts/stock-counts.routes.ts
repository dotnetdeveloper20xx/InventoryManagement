import { Routes } from '@angular/router';

export const STOCK_COUNTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./stock-counts-list/stock-counts-list.component').then(m => m.StockCountsListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./stock-count-form/stock-count-form.component').then(m => m.StockCountFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./stock-count-detail/stock-count-detail.component').then(m => m.StockCountDetailComponent)
  },
  {
    path: ':id/count',
    loadComponent: () => import('./stock-count-entry/stock-count-entry.component').then(m => m.StockCountEntryComponent)
  }
];
