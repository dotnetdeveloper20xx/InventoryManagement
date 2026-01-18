import { Routes } from '@angular/router';

export const GOODS_RECEIPTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./goods-receipts-list/goods-receipts-list.component').then(m => m.GoodsReceiptsListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./goods-receipt-form/goods-receipt-form.component').then(m => m.GoodsReceiptFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./goods-receipt-detail/goods-receipt-detail.component').then(m => m.GoodsReceiptDetailComponent)
  }
];
