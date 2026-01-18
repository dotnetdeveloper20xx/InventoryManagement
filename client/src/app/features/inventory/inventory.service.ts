import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse } from '../../core/models/api-response.model';
import {
  InventoryLevel,
  InventoryMovement,
  StockAdjustment,
  StockTransfer,
  InventoryFilter,
  MovementFilter
} from '../../core/models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'inventory';

  getInventoryLevels(filter: InventoryFilter): Observable<PaginatedResponse<InventoryLevel>> {
    return this.api.getPaginated<InventoryLevel>(`${this.endpoint}/levels`, {
      search: filter.search,
      warehouseId: filter.warehouseId,
      categoryId: filter.categoryId,
      stockStatus: filter.stockStatus,
      lowStockOnly: filter.lowStockOnly,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getProductInventory(productId: number): Observable<InventoryLevel[]> {
    return this.api.get<InventoryLevel[]>(`${this.endpoint}/product/${productId}`);
  }

  getWarehouseInventory(warehouseId: number, filter: InventoryFilter): Observable<PaginatedResponse<InventoryLevel>> {
    return this.api.getPaginated<InventoryLevel>(`${this.endpoint}/warehouse/${warehouseId}`, {
      search: filter.search,
      stockStatus: filter.stockStatus,
      lowStockOnly: filter.lowStockOnly,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getMovements(filter: MovementFilter): Observable<PaginatedResponse<InventoryMovement>> {
    return this.api.getPaginated<InventoryMovement>(`${this.endpoint}/movements`, {
      productId: filter.productId,
      warehouseId: filter.warehouseId,
      movementType: filter.movementType,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString(),
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  adjustStock(adjustment: StockAdjustment): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/adjust`, adjustment);
  }

  transferStock(transfer: StockTransfer): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/transfer`, transfer);
  }

  getLowStockItems(): Observable<InventoryLevel[]> {
    return this.api.get<InventoryLevel[]>(`${this.endpoint}/low-stock`);
  }
}
