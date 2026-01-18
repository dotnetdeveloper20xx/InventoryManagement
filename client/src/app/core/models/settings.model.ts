export interface SystemSettings {
  company: CompanySettings;
  inventory: InventorySettings;
  alerts: AlertSettings;
  numbering: NumberingSettings;
}

export interface CompanySettings {
  companyName: string;
  logoUrl: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  baseCurrency: string;
  dateFormat: string;
  timeZone: string;
  fiscalYearStartMonth: number;
}

export interface InventorySettings {
  defaultValuationMethod: string;
  allowNegativeStock: boolean;
  autoPostMovements: boolean;
  requireAdjustmentApproval: boolean;
  adjustmentApprovalThreshold: number;
  requireTransferApproval: boolean;
  requirePOApproval: boolean;
  poApprovalThreshold: number;
  trackBatchByDefault: boolean;
  trackExpiryByDefault: boolean;
  defaultPickingStrategy: string;
}

export interface AlertSettings {
  lowStockThresholdPercent: number;
  criticalStockThresholdPercent: number;
  expiryWarningDays: number;
  expiryAlertDays: number;
  overduePOWarningDays: number;
  overduePOAlertDays: number;
  emailLowStockAlerts: boolean;
  emailExpiryAlerts: boolean;
  emailPOAlerts: boolean;
  alertEmailRecipients: string;
}

export interface NumberingSettings {
  purchaseOrderSeries: NumberSeries;
  goodsReceiptSeries: NumberSeries;
  transferSeries: NumberSeries;
  adjustmentSeries: NumberSeries;
  stockCountSeries: NumberSeries;
  movementSeries: NumberSeries;
  skuGenerationRule: string;
  barcodeGenerationRule: string;
}

export interface NumberSeries {
  prefix: string;
  format: string;
  currentNumber: number;
  incrementBy: number;
}

export interface UpdateCompanySettings {
  companyName: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  baseCurrency: string;
  dateFormat: string;
  timeZone: string;
}

export interface UpdateInventorySettings {
  defaultValuationMethod: string;
  allowNegativeStock: boolean;
  autoPostMovements: boolean;
  requireAdjustmentApproval: boolean;
  adjustmentApprovalThreshold: number;
  requireTransferApproval: boolean;
  requirePOApproval: boolean;
  poApprovalThreshold: number;
}

export interface UpdateAlertSettings {
  lowStockThresholdPercent: number;
  criticalStockThresholdPercent: number;
  expiryWarningDays: number;
  expiryAlertDays: number;
  overduePOWarningDays: number;
  overduePOAlertDays: number;
  emailLowStockAlerts: boolean;
  emailExpiryAlerts: boolean;
  emailPOAlerts: boolean;
  alertEmailRecipients?: string;
}
