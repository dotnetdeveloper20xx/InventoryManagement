import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DashboardStats,
  ReportFilter,
  InventoryValuationReport,
  StockMovementReport,
  ReorderReport,
  ABCAnalysisReport,
  SupplierPerformanceReport,
  AgingAnalysisReport,
  StockOnHandReport
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'reports';

  getDashboardStats(warehouseId?: number): Observable<DashboardStats> {
    return this.api.get<DashboardStats>(`${this.endpoint}/dashboard`, { warehouseId });
  }

  getInventoryValuation(filter: ReportFilter): Observable<InventoryValuationReport> {
    return this.api.get<InventoryValuationReport>(`${this.endpoint}/inventory-valuation`, {
      warehouseId: filter.warehouseId,
      categoryId: filter.categoryId,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString()
    });
  }

  getStockMovement(filter: ReportFilter): Observable<StockMovementReport> {
    return this.api.get<StockMovementReport>(`${this.endpoint}/stock-movement`, {
      warehouseId: filter.warehouseId,
      categoryId: filter.categoryId,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString()
    });
  }

  getReorderReport(filter: ReportFilter): Observable<ReorderReport> {
    return this.api.get<ReorderReport>(`${this.endpoint}/reorder`, {
      warehouseId: filter.warehouseId,
      categoryId: filter.categoryId,
      supplierId: filter.supplierId
    });
  }

  getABCAnalysis(filter: ReportFilter): Observable<ABCAnalysisReport> {
    return this.api.get<ABCAnalysisReport>(`${this.endpoint}/abc-analysis`, {
      warehouseId: filter.warehouseId,
      categoryId: filter.categoryId,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString()
    });
  }

  getSupplierPerformance(filter: ReportFilter): Observable<SupplierPerformanceReport> {
    return this.api.get<SupplierPerformanceReport>(`${this.endpoint}/supplier-performance`, {
      supplierId: filter.supplierId,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString()
    });
  }

  getAgingAnalysis(filter: ReportFilter): Observable<AgingAnalysisReport> {
    return this.api.get<AgingAnalysisReport>(`${this.endpoint}/aging-analysis`, {
      warehouseId: filter.warehouseId,
      categoryId: filter.categoryId
    });
  }

  getStockOnHand(filter: ReportFilter): Observable<StockOnHandReport> {
    return this.api.get<StockOnHandReport>(`${this.endpoint}/stock-on-hand`, {
      warehouseId: filter.warehouseId,
      categoryId: filter.categoryId
    });
  }
}
