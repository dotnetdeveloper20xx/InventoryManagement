export interface InventoryLevel {
  stockLevelId: number;
  productId: number;
  productSKU?: string;
  productName?: string;
  warehouseId: number;
  warehouseName?: string;
  binId?: number;
  binCode?: string;
  batchId?: number;
  batchNumber?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityOnOrder: number;
  quantityInTransit: number;
  unitCost: number;
  totalValue: number;
  status: string;
  statusName: string;
  lastMovementDate?: Date;
  lastCountDate?: Date;
}

export enum StockStatus {
  OK = 'OK',
  Low = 'Low',
  Critical = 'Critical',
  OutOfStock = 'OutOfStock',
  Overstock = 'Overstock'
}

export interface InventoryMovement {
  movementId: number;
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  movementType: MovementType;
  movementTypeName: string;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
  createdDate: Date;
}

export enum MovementType {
  PurchaseReceipt = 0,
  SalesShipment = 1,
  TransferIn = 2,
  TransferOut = 3,
  PositiveAdjustment = 4,
  NegativeAdjustment = 5,
  Return = 6,
  Scrap = 7
}

export interface StockAdjustment {
  productId: number;
  warehouseId: number;
  locationId?: number;
  adjustmentType: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockTransfer {
  productId: number;
  sourceWarehouseId: number;
  sourceLocationId?: number;
  destinationWarehouseId: number;
  destinationLocationId?: number;
  quantity: number;
  notes?: string;
}

export interface InventoryFilter {
  search?: string;
  warehouseId?: number;
  categoryId?: number;
  stockStatus?: StockStatus;
  lowStockOnly?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface MovementFilter {
  productId?: number;
  warehouseId?: number;
  movementType?: MovementType;
  fromDate?: Date;
  toDate?: Date;
  pageNumber: number;
  pageSize: number;
}
