export interface AuditLog {
  auditLogId: number;
  entityType: string;
  entityId: number;
  entityReference: string;
  action: string;
  oldValues: string;
  newValues: string;
  changedFields: string;
  userId: number;
  userName: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  notes: string;
}

export interface AuditLogListItem {
  auditLogId: number;
  entityType: string;
  entityReference: string;
  action: string;
  userName: string;
  timestamp: Date;
  summary: string;
}

export interface AuditLogDetail {
  auditLogId: number;
  entityType: string;
  entityId: number;
  entityReference: string;
  action: string;
  changes: AuditFieldChange[];
  userName: string;
  ipAddress: string;
  timestamp: Date;
}

export interface AuditFieldChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface EntityAuditHistory {
  entityType: string;
  entityId: number;
  entityReference: string;
  history: AuditLogListItem[];
}

export interface AuditSummary {
  fromDate: Date;
  toDate: Date;
  totalActions: number;
  byAction: AuditActionSummary[];
  byEntity: AuditEntitySummary[];
  byUser: AuditUserSummary[];
}

export interface AuditActionSummary {
  action: string;
  count: number;
}

export interface AuditEntitySummary {
  entityType: string;
  count: number;
}

export interface AuditUserSummary {
  userId: number;
  userName: string;
  actionCount: number;
  lastActivity: Date;
}

export interface AuditLogFilter {
  entityType?: string;
  entityId?: number;
  action?: string;
  userId?: number;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  pageNumber: number;
  pageSize: number;
}
