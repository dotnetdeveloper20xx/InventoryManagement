import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-list/reports-list.component').then(m => m.ReportsListComponent)
  },
  {
    path: 'inventory-valuation',
    loadComponent: () => import('./inventory-valuation/inventory-valuation.component').then(m => m.InventoryValuationComponent)
  },
  {
    path: 'stock-movement',
    loadComponent: () => import('./stock-movement/stock-movement.component').then(m => m.StockMovementComponent)
  },
  {
    path: 'reorder',
    loadComponent: () => import('./reorder-report/reorder-report.component').then(m => m.ReorderReportComponent)
  },
  {
    path: 'abc-analysis',
    loadComponent: () => import('./abc-analysis/abc-analysis.component').then(m => m.ABCAnalysisComponent)
  },
  {
    path: 'supplier-performance',
    loadComponent: () => import('./supplier-performance/supplier-performance.component').then(m => m.SupplierPerformanceComponent)
  },
  {
    path: 'aging-analysis',
    loadComponent: () => import('./aging-analysis/aging-analysis.component').then(m => m.AgingAnalysisComponent)
  },
  {
    path: 'stock-on-hand',
    loadComponent: () => import('./stock-on-hand/stock-on-hand.component').then(m => m.StockOnHandComponent)
  }
];
