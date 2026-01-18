import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api-response.model';
import {
  Alert,
  AlertListItem,
  AlertSummary,
  AlertFilter,
  AcknowledgeAlert,
  SnoozeAlert,
  BulkAlertAction
} from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'alerts';

  getAlerts(filter: AlertFilter): Observable<PaginatedResponse<AlertListItem>> {
    return this.api.getPaginated<AlertListItem>(this.endpoint, {
      severity: filter.severity,
      alertType: filter.alertType,
      warehouseId: filter.warehouseId,
      isRead: filter.isRead,
      includeDismissed: filter.includeDismissed,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString(),
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getAlert(id: number): Observable<Alert> {
    return this.api.get<Alert>(`${this.endpoint}/${id}`);
  }

  getSummary(): Observable<AlertSummary> {
    return this.api.get<AlertSummary>(`${this.endpoint}/summary`);
  }

  acknowledge(dto: AcknowledgeAlert): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${dto.alertId}/acknowledge`, dto);
  }

  dismiss(id: number): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/dismiss`, {});
  }

  snooze(dto: SnoozeAlert): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${dto.alertId}/snooze`, dto);
  }

  markAsRead(id: number): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/read`, {});
  }

  bulkAction(dto: BulkAlertAction): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/bulk`, dto);
  }

  generateAlerts(): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/generate`, {});
  }
}
