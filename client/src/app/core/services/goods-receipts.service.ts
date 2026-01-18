import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api-response.model';
import {
  GoodsReceipt,
  GoodsReceiptListItem,
  GoodsReceiptFilter,
  PendingReceipt,
  CreateGoodsReceipt
} from '../models/goods-receipt.model';

@Injectable({
  providedIn: 'root'
})
export class GoodsReceiptsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'goodsreceipts';

  getGoodsReceipts(filter: GoodsReceiptFilter): Observable<PaginatedResponse<GoodsReceiptListItem>> {
    return this.api.getPaginated<GoodsReceiptListItem>(this.endpoint, {
      poId: filter.poId,
      supplierId: filter.supplierId,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString(),
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getGoodsReceipt(id: number): Observable<GoodsReceipt> {
    return this.api.get<GoodsReceipt>(`${this.endpoint}/${id}`);
  }

  getPendingReceipts(supplierId?: number): Observable<PendingReceipt[]> {
    return this.api.get<PendingReceipt[]>(`${this.endpoint}/pending`, { supplierId });
  }

  createGoodsReceipt(grn: CreateGoodsReceipt): Observable<GoodsReceipt> {
    return this.api.post<GoodsReceipt>(this.endpoint, grn);
  }

  postGoodsReceipt(id: number): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/post`, {});
  }
}
