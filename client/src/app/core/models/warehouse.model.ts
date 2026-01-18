export interface Warehouse {
  warehouseId: number;
  warehouseCode: string;
  name: string;
  type?: string;
  typeName?: string;
  status?: string;
  statusName?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  managerName?: string;
  phone?: string;
  email?: string;
  totalAreaSqFt?: number;
  currentUtilizationPercent?: number;
  totalPalletPositions?: number;
  isActive: boolean;
  zoneCount?: number;
  binCount?: number;
}

export interface WarehouseDetail extends Warehouse {
  locations?: WarehouseLocation[];
}

export interface WarehouseLocation {
  locationId: number;
  warehouseId: number;
  code: string;
  name: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  locationType: LocationType;
  isActive: boolean;
}

export enum LocationType {
  Storage = 0,
  Receiving = 1,
  Shipping = 2,
  Quarantine = 3,
  Returns = 4
}

export interface CreateWarehouse {
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
}

export interface UpdateWarehouse {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isPrimary: boolean;
}

export interface CreateLocation {
  warehouseId: number;
  code: string;
  name: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  locationType: LocationType;
}

export interface WarehouseFilter {
  search?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}
