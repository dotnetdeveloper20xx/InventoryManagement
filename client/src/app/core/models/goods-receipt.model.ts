export interface GoodsReceipt {
  goodsReceiptId: number;
  grnNumber: string;
  purchaseOrderId: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  receiptDate: Date;
  status: string;
  deliveryNoteNumber: string;
  receivedBy: string;
  notes: string;
  totalValue: number;
  lines: GoodsReceiptLine[];
  createdDate: Date;
}

export interface GoodsReceiptLine {
  goodsReceiptLineId: number;
  productId: number;
  productSKU: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  acceptedQuantity: number;
  binId: number;
  batchNumber: string;
  expiryDate: Date | null;
  unitCost: number;
  totalCost: number;
  inspectionStatus: string;
  notes: string;
}

export interface GoodsReceiptListItem {
  goodsReceiptId: number;
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  warehouseName: string;
  receiptDate: Date;
  status: string;
  lineCount: number;
  totalValue: number;
  receivedBy: string;
}

export interface PendingReceipt {
  purchaseOrderId: number;
  poNumber: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: string;
  totalLines: number;
  linesFullyReceived: number;
  linesPartiallyReceived: number;
  linesPending: number;
  lines: PendingReceiptLine[];
}

export interface PendingReceiptLine {
  purchaseOrderLineId: number;
  productId: number;
  productSKU: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  unitPrice: number;
}

export interface CreateGoodsReceipt {
  purchaseOrderId: number;
  warehouseId: number;
  receiptDate: Date;
  deliveryNoteNumber?: string;
  notes?: string;
  lines: CreateGoodsReceiptLine[];
}

export interface CreateGoodsReceiptLine {
  purchaseOrderLineId: number;
  productId: number;
  receivedQuantity: number;
  rejectedQuantity?: number;
  binId?: number;
  batchNumber?: string;
  expiryDate?: Date;
  unitCost: number;
  inspectionStatus?: string;
  notes?: string;
}

export interface GoodsReceiptFilter {
  poId?: number;
  supplierId?: number;
  fromDate?: Date;
  toDate?: Date;
  pageNumber: number;
  pageSize: number;
}
