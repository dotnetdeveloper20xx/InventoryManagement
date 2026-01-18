import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api-response.model';
import {
  Transfer,
  TransferListItem,
  TransferFilter,
  CreateTransfer,
  ApproveTransfer,
  ShipTransfer,
  ReceiveTransfer
} from '../models/transfer.model';

@Injectable({
  providedIn: 'root'
})
export class TransfersService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'transfers';

  getTransfers(filter: TransferFilter): Observable<PaginatedResponse<TransferListItem>> {
    return this.api.getPaginated<TransferListItem>(this.endpoint, {
      sourceWarehouseId: filter.sourceWarehouseId,
      destWarehouseId: filter.destWarehouseId,
      status: filter.status,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getTransfer(id: number): Observable<Transfer> {
    return this.api.get<Transfer>(`${this.endpoint}/${id}`);
  }

  createTransfer(transfer: CreateTransfer): Observable<Transfer> {
    return this.api.post<Transfer>(this.endpoint, transfer);
  }

  approveTransfer(id: number, dto: ApproveTransfer): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/approve`, dto);
  }

  rejectTransfer(id: number, reason?: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/reject`, { reason });
  }

  shipTransfer(id: number, dto: ShipTransfer): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/ship`, dto);
  }

  receiveTransfer(id: number, dto: ReceiveTransfer): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/receive`, dto);
  }

  cancelTransfer(id: number, reason?: string): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/cancel`, { reason });
  }
}
