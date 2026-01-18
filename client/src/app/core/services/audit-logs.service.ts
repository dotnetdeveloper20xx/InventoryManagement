import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api-response.model';
import {
  AuditLogListItem,
  AuditLogDetail,
  AuditLogFilter,
  EntityAuditHistory,
  AuditSummary
} from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'auditlogs';

  getAuditLogs(filter: AuditLogFilter): Observable<PaginatedResponse<AuditLogListItem>> {
    return this.api.getPaginated<AuditLogListItem>(this.endpoint, {
      entityType: filter.entityType,
      entityId: filter.entityId,
      action: filter.action,
      userId: filter.userId,
      fromDate: filter.fromDate?.toISOString(),
      toDate: filter.toDate?.toISOString(),
      search: filter.search,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getAuditLog(id: number): Observable<AuditLogDetail> {
    return this.api.get<AuditLogDetail>(`${this.endpoint}/${id}`);
  }

  getEntityHistory(entityType: string, entityId: number): Observable<EntityAuditHistory> {
    return this.api.get<EntityAuditHistory>(`${this.endpoint}/entity/${entityType}/${entityId}`);
  }

  getSummary(fromDate: Date, toDate: Date): Observable<AuditSummary> {
    return this.api.get<AuditSummary>(`${this.endpoint}/summary`, {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString()
    });
  }
}
