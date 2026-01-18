import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Bin, BinListItem, BinContents, CreateBin, UpdateBin, BulkCreateBins } from '../models/zone-bin.model';

@Injectable({
  providedIn: 'root'
})
export class BinsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'bins';

  getBinsByZone(zoneId: number): Observable<BinListItem[]> {
    return this.api.get<BinListItem[]>(`${this.endpoint}/zone/${zoneId}`);
  }

  getBinsByWarehouse(warehouseId: number): Observable<BinListItem[]> {
    return this.api.get<BinListItem[]>(`${this.endpoint}/warehouse/${warehouseId}`);
  }

  getBin(id: number): Observable<Bin> {
    return this.api.get<Bin>(`${this.endpoint}/${id}`);
  }

  getBinContents(id: number): Observable<BinContents> {
    return this.api.get<BinContents>(`${this.endpoint}/${id}/contents`);
  }

  createBin(bin: CreateBin): Observable<Bin> {
    return this.api.post<Bin>(this.endpoint, bin);
  }

  bulkCreateBins(dto: BulkCreateBins): Observable<Bin[]> {
    return this.api.post<Bin[]>(`${this.endpoint}/bulk`, dto);
  }

  updateBin(id: number, bin: UpdateBin): Observable<Bin> {
    return this.api.put<Bin>(`${this.endpoint}/${id}`, bin);
  }

  deleteBin(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
