import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  SystemSettings,
  CompanySettings,
  InventorySettings,
  AlertSettings,
  UpdateCompanySettings,
  UpdateInventorySettings,
  UpdateAlertSettings
} from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'settings';

  getAllSettings(): Observable<SystemSettings> {
    return this.api.get<SystemSettings>(this.endpoint);
  }

  getCompanySettings(): Observable<CompanySettings> {
    return this.api.get<CompanySettings>(`${this.endpoint}/company`);
  }

  getInventorySettings(): Observable<InventorySettings> {
    return this.api.get<InventorySettings>(`${this.endpoint}/inventory`);
  }

  getAlertSettings(): Observable<AlertSettings> {
    return this.api.get<AlertSettings>(`${this.endpoint}/alerts`);
  }

  updateCompanySettings(settings: UpdateCompanySettings): Observable<void> {
    return this.api.put<void>(`${this.endpoint}/company`, settings);
  }

  updateInventorySettings(settings: UpdateInventorySettings): Observable<void> {
    return this.api.put<void>(`${this.endpoint}/inventory`, settings);
  }

  updateAlertSettings(settings: UpdateAlertSettings): Observable<void> {
    return this.api.put<void>(`${this.endpoint}/alerts`, settings);
  }

  generateNextNumber(seriesType: string): Observable<string> {
    return this.api.post<string>(`${this.endpoint}/number-series/${seriesType}`, {});
  }
}
