import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse, LookupDto } from '../../core/models/api-response.model';
import {
  Warehouse,
  WarehouseDetail,
  CreateWarehouse,
  UpdateWarehouse,
  WarehouseLocation,
  CreateLocation,
  WarehouseFilter
} from '../../core/models/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class WarehousesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'warehouses';

  getWarehouses(filter: WarehouseFilter): Observable<PaginatedResponse<Warehouse>> {
    return this.api.getPaginated<Warehouse>(this.endpoint, {
      search: filter.search,
      isActive: filter.isActive,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getWarehouse(id: number): Observable<WarehouseDetail> {
    return this.api.get<WarehouseDetail>(`${this.endpoint}/${id}`);
  }

  createWarehouse(warehouse: CreateWarehouse): Observable<Warehouse> {
    return this.api.post<Warehouse>(this.endpoint, warehouse);
  }

  updateWarehouse(id: number, warehouse: UpdateWarehouse): Observable<Warehouse> {
    return this.api.put<Warehouse>(`${this.endpoint}/${id}`, warehouse);
  }

  deleteWarehouse(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getLookup(): Observable<LookupDto[]> {
    return this.api.get<LookupDto[]>(`${this.endpoint}/lookup`);
  }

  getLocations(warehouseId: number): Observable<WarehouseLocation[]> {
    return this.api.get<WarehouseLocation[]>(`${this.endpoint}/${warehouseId}/locations`);
  }

  createLocation(location: CreateLocation): Observable<WarehouseLocation> {
    return this.api.post<WarehouseLocation>(`${this.endpoint}/${location.warehouseId}/locations`, location);
  }

  deleteLocation(warehouseId: number, locationId: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${warehouseId}/locations/${locationId}`);
  }
}
