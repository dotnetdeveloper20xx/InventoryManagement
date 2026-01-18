import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Zone, ZoneListItem, CreateZone, UpdateZone } from '../models/zone-bin.model';

@Injectable({
  providedIn: 'root'
})
export class ZonesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'zones';

  getZonesByWarehouse(warehouseId: number): Observable<ZoneListItem[]> {
    return this.api.get<ZoneListItem[]>(`${this.endpoint}/warehouse/${warehouseId}`);
  }

  getZone(id: number): Observable<Zone> {
    return this.api.get<Zone>(`${this.endpoint}/${id}`);
  }

  createZone(zone: CreateZone): Observable<Zone> {
    return this.api.post<Zone>(this.endpoint, zone);
  }

  updateZone(id: number, zone: UpdateZone): Observable<Zone> {
    return this.api.put<Zone>(`${this.endpoint}/${id}`, zone);
  }

  deleteZone(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
