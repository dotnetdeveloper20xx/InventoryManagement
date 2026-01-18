export interface Transfer {
  transferId: number;
  transferNumber: string;
  sourceWarehouseId: number;
  sourceWarehouseName: string;
  destinationWarehouseId: number;
  destinationWarehouseName: string;
  requestDate: Date;
  requiredDate: Date;
  shippedDate: Date | null;
  receivedDate: Date | null;
  status: string;
  priority: string;
  trackingNumber: string;
  carrier: string;
  notes: string;
  lines: TransferLine[];
  requestedBy: string;
  approvedBy: string;
  approvedDate: Date | null;
  createdDate: Date;
}

export interface TransferLine {
  transferLineId: number;
  productId: number;
  productSKU: string;
  productName: string;
  sourceBinId: number;
  sourceBinCode: string;
  destinationBinId: number;
  destinationBinCode: string;
  batchNumber: string;
  requestedQuantity: number;
  approvedQuantity: number;
  shippedQuantity: number;
  receivedQuantity: number;
  varianceQuantity: number;
  uom: string;
}

export interface TransferListItem {
  transferId: number;
  transferNumber: string;
  sourceWarehouseName: string;
  destinationWarehouseName: string;
  requestDate: Date;
  requiredDate: Date;
  status: string;
  priority: string;
  lineCount: number;
  totalQuantity: number;
  requestedBy: string;
}

export interface CreateTransfer {
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  requiredDate: Date;
  priority: string;
  notes?: string;
  lines: CreateTransferLine[];
}

export interface CreateTransferLine {
  productId: number;
  sourceBinId?: number;
  destinationBinId?: number;
  batchNumber?: string;
  requestedQuantity: number;
}

export interface ApproveTransfer {
  transferId: number;
  lines?: ApproveTransferLine[];
}

export interface ApproveTransferLine {
  transferLineId: number;
  approvedQuantity: number;
}

export interface ShipTransfer {
  transferId: number;
  shippedDate: Date;
  trackingNumber?: string;
  carrier?: string;
  lines?: ShipTransferLine[];
}

export interface ShipTransferLine {
  transferLineId: number;
  shippedQuantity: number;
}

export interface ReceiveTransfer {
  transferId: number;
  receivedDate: Date;
  lines: ReceiveTransferLine[];
}

export interface ReceiveTransferLine {
  transferLineId: number;
  receivedQuantity: number;
  destinationBinId?: number;
}

export interface TransferFilter {
  sourceWarehouseId?: number;
  destWarehouseId?: number;
  status?: string;
  pageNumber: number;
  pageSize: number;
}
