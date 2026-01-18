export interface Zone {
  zoneId: number;
  zoneCode: string;
  zoneName: string;
  warehouseId: number;
  warehouseName: string;
  zoneType: string;
  description: string;
  minTemperature: number;
  maxTemperature: number;
  maxHumidity: number;
  capacity: number;
  usedCapacity: number;
  utilizationPercent: number;
  binCount: number;
  isActive: boolean;
  createdDate: Date;
}

export interface ZoneListItem {
  zoneId: number;
  zoneCode: string;
  zoneName: string;
  warehouseName: string;
  zoneType: string;
  binCount: number;
  utilizationPercent: number;
  isActive: boolean;
}

export interface CreateZone {
  zoneCode: string;
  zoneName: string;
  warehouseId: number;
  zoneType?: string;
  description?: string;
  minTemperature?: number;
  maxTemperature?: number;
  maxHumidity?: number;
  capacity?: number;
  isActive?: boolean;
}

export interface UpdateZone {
  zoneId: number;
  zoneCode: string;
  zoneName: string;
  zoneType: string;
  description?: string;
  minTemperature?: number;
  maxTemperature?: number;
  maxHumidity?: number;
  capacity?: number;
  isActive: boolean;
}

export interface Bin {
  binId: number;
  binCode: string;
  binName: string;
  zoneId: number;
  zoneName: string;
  warehouseId: number;
  warehouseName: string;
  binType: string;
  aisle: string;
  rack: string;
  level: string;
  position: string;
  fullLocationCode: string;
  maxWeight: number;
  maxVolume: number;
  currentWeight: number;
  currentVolume: number;
  status: string;
  productCount: number;
  totalQuantity: number;
  isActive: boolean;
  createdDate: Date;
}

export interface BinListItem {
  binId: number;
  binCode: string;
  zoneName: string;
  warehouseName: string;
  binType: string;
  fullLocationCode: string;
  status: string;
  productCount: number;
  totalQuantity: number;
  isActive: boolean;
}

export interface BinContents {
  binId: number;
  binCode: string;
  fullLocationCode: string;
  items: BinContentItem[];
}

export interface BinContentItem {
  productId: number;
  sku: string;
  productName: string;
  batchNumber: string;
  expiryDate: Date | null;
  quantity: number;
  uom: string;
  lastMovementDate: Date;
}

export interface CreateBin {
  binCode: string;
  binName?: string;
  zoneId: number;
  binType?: string;
  aisle?: string;
  rack?: string;
  level?: string;
  position?: string;
  maxWeight?: number;
  maxVolume?: number;
  isActive?: boolean;
}

export interface UpdateBin {
  binId: number;
  binCode: string;
  binName?: string;
  binType: string;
  aisle?: string;
  rack?: string;
  level?: string;
  position?: string;
  maxWeight?: number;
  maxVolume?: number;
  status: string;
  isActive: boolean;
}

export interface BulkCreateBins {
  zoneId: number;
  binType?: string;
  locationPrefix: string;
  rowCount: number;
  columnCount: number;
  levelCount: number;
  maxCapacity?: number;
}
