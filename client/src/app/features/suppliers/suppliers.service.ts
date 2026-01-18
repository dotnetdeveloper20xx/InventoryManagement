import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse, LookupDto } from '../../core/models/api-response.model';
import {
  Supplier,
  SupplierDetail,
  CreateSupplier,
  UpdateSupplier,
  SupplierFilter
} from '../../core/models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'suppliers';

  getSuppliers(filter: SupplierFilter): Observable<PaginatedResponse<Supplier>> {
    return this.api.getPaginated<Supplier>(this.endpoint, {
      search: filter.search,
      isActive: filter.isActive,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getSupplier(id: number): Observable<SupplierDetail> {
    return this.api.get<SupplierDetail>(`${this.endpoint}/${id}`);
  }

  createSupplier(supplier: CreateSupplier): Observable<Supplier> {
    return this.api.post<Supplier>(this.endpoint, supplier);
  }

  updateSupplier(id: number, supplier: UpdateSupplier): Observable<Supplier> {
    return this.api.put<Supplier>(`${this.endpoint}/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getLookup(): Observable<LookupDto[]> {
    return this.api.get<LookupDto[]>(`${this.endpoint}/lookup`);
  }
}
