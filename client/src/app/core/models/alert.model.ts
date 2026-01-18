export interface Alert {
  alertId: number;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  entityType: string;
  entityId: number;
  entityReference: string;
  warehouseId: number;
  warehouseName: string;
  isRead: boolean;
  isDismissed: boolean;
  snoozedUntil: Date | null;
  createdDate: Date;
  acknowledgedDate: Date | null;
  acknowledgedBy: string;
}

export interface AlertListItem {
  alertId: number;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  entityReference: string;
  isRead: boolean;
  createdDate: Date;
}

export interface AlertSummary {
  totalAlerts: number;
  unreadAlerts: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  byType: AlertCountByType[];
}

export interface AlertCountByType {
  alertType: string;
  count: number;
}

export interface AlertFilter {
  severity?: string;
  alertType?: string;
  warehouseId?: number;
  isRead?: boolean;
  includeDismissed?: boolean;
  fromDate?: Date;
  toDate?: Date;
  pageNumber: number;
  pageSize: number;
}

export interface AcknowledgeAlert {
  alertId: number;
  notes?: string;
}

export interface SnoozeAlert {
  alertId: number;
  snoozeMinutes: number;
}

export interface BulkAlertAction {
  alertIds: number[];
  action: string;
  snoozeMinutes?: number;
}
