import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventory-list/inventory-list.component').then(m => m.InventoryListComponent)
  },
  {
    path: 'adjust',
    loadComponent: () => import('./stock-adjustment/stock-adjustment.component').then(m => m.StockAdjustmentComponent)
  },
  {
    path: 'transfer',
    loadComponent: () => import('./stock-transfer/stock-transfer.component').then(m => m.StockTransferComponent)
  }
];
