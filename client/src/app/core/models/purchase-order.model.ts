export interface PurchaseOrder {
  purchaseOrderId: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  status: string;
  statusName: string;
  priority?: string;
  currency?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  lineCount: number;
  createdDate: Date;
}

export enum POStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Ordered = 'Ordered',
  PartiallyReceived = 'PartiallyReceived',
  Received = 'Received',
  Cancelled = 'Cancelled',
  Closed = 'Closed'
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  notes?: string;
  lineItems: PurchaseOrderLineItem[];
  receipts?: PurchaseOrderReceipt[];
}

export interface PurchaseOrderLineItem {
  lineItemId: number;
  purchaseOrderId: number;
  productId: number;
  productName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  lineTotal: number;
  notes?: string;
}

export interface PurchaseOrderReceipt {
  receiptId: number;
  receiptNumber: string;
  receivedDate: Date;
  receivedBy: string;
  totalQuantity: number;
}

export interface CreatePurchaseOrder {
  supplierId: number;
  warehouseId: number;
  expectedDeliveryDate?: Date;
  notes?: string;
  lineItems: CreatePurchaseOrderLineItem[];
}

export interface CreatePurchaseOrderLineItem {
  productId: number;
  quantityOrdered: number;
  unitCost: number;
  notes?: string;
}

export interface UpdatePurchaseOrder {
  expectedDeliveryDate?: Date;
  notes?: string;
  lineItems: UpdatePurchaseOrderLineItem[];
}

export interface UpdatePurchaseOrderLineItem {
  lineItemId?: number;
  productId: number;
  quantityOrdered: number;
  unitCost: number;
  notes?: string;
}

export interface ReceivePurchaseOrder {
  receiptDate: Date;
  lineItems: ReceiveLineItem[];
  notes?: string;
}

export interface ReceiveLineItem {
  lineItemId: number;
  quantityReceived: number;
  locationId?: number;
}

export interface PurchaseOrderFilter {
  search?: string;
  supplierId?: number;
  warehouseId?: number;
  status?: POStatus;
  fromDate?: Date;
  toDate?: Date;
  pageNumber: number;
  pageSize: number;
}
