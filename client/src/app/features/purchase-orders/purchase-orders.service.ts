import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse } from '../../core/models/api-response.model';
import {
  PurchaseOrder,
  PurchaseOrderDetail,
  CreatePurchaseOrder,
  UpdatePurchaseOrder,
  ReceivePurchaseOrder,
  PurchaseOrderFilter
} from '../../core/models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'purchaseorders';

  getPurchaseOrders(filter: PurchaseOrderFilter): Observable<PaginatedResponse<PurchaseOrder>> {
    return this.api.getPaginated<PurchaseOrder>(this.endpoint, {
      search: filter.search,
      supplierId: filter.supplierId,
      warehouseId: filter.warehouseId,
      status: filter.status,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString(),
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getPurchaseOrder(id: number): Observable<PurchaseOrderDetail> {
    return this.api.get<PurchaseOrderDetail>(`${this.endpoint}/${id}`);
  }

  createPurchaseOrder(order: CreatePurchaseOrder): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(this.endpoint, order);
  }

  updatePurchaseOrder(id: number, order: UpdatePurchaseOrder): Observable<PurchaseOrder> {
    return this.api.put<PurchaseOrder>(`${this.endpoint}/${id}`, order);
  }

  deletePurchaseOrder(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  submitPurchaseOrder(id: number): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(`${this.endpoint}/${id}/submit`, {});
  }

  approvePurchaseOrder(id: number): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(`${this.endpoint}/${id}/approve`, {});
  }

  receivePurchaseOrder(id: number, receipt: ReceivePurchaseOrder): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/receive`, receipt);
  }

  cancelPurchaseOrder(id: number): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/cancel`, {});
  }
}
