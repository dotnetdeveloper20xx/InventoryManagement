export interface Supplier {
  supplierId: number;
  supplierCode: string;
  companyName: string;
  tradingName?: string;
  type?: string;
  typeName?: string;
  status?: string;
  statusName?: string;
  billingCity?: string;
  billingCountry?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  currency?: string;
  defaultLeadTimeDays?: number;
  onTimeDeliveryRate?: number;
  qualityAcceptanceRate?: number;
  rating?: number;
}

export interface SupplierDetail extends Supplier {
  products?: SupplierProduct[];
  purchaseOrders?: PurchaseOrderSummary[];
}

export interface SupplierProduct {
  productId: number;
  productName: string;
  sku: string;
  supplierSku?: string;
  unitCost: number;
  isPrimary: boolean;
}

export interface PurchaseOrderSummary {
  purchaseOrderId: number;
  orderNumber: string;
  orderDate: Date;
  status: string;
  totalAmount: number;
}

export interface CreateSupplier {
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  paymentTerms?: string;
  leadTimeDays?: number;
}

export interface UpdateSupplier {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  paymentTerms?: string;
  leadTimeDays?: number;
  isActive: boolean;
}

export interface SupplierFilter {
  search?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}
