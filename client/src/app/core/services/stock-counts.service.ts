import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api-response.model';
import {
  StockCount,
  StockCountListItem,
  StockCountFilter,
  StockCountSummary,
  CreateStockCount,
  UpdateStockCountLine,
  PostStockCount
} from '../models/stock-count.model';

@Injectable({
  providedIn: 'root'
})
export class StockCountsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'stockcounts';

  getStockCounts(filter: StockCountFilter): Observable<PaginatedResponse<StockCountListItem>> {
    return this.api.getPaginated<StockCountListItem>(this.endpoint, {
      warehouseId: filter.warehouseId,
      status: filter.status,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getStockCount(id: number): Observable<StockCount> {
    return this.api.get<StockCount>(`${this.endpoint}/${id}`);
  }

  getSummary(id: number): Observable<StockCountSummary> {
    return this.api.get<StockCountSummary>(`${this.endpoint}/${id}/summary`);
  }

  createStockCount(count: CreateStockCount): Observable<StockCount> {
    return this.api.post<StockCount>(this.endpoint, count);
  }

  updateLine(lineId: number, dto: UpdateStockCountLine): Observable<void> {
    return this.api.put<void>(`${this.endpoint}/lines/${lineId}`, dto);
  }

  postStockCount(id: number, dto: PostStockCount): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/post`, dto);
  }

  cancelStockCount(id: number): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/cancel`, {});
  }
}
