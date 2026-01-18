export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalWarehouses: number;
  totalSKUs: number;
  inventoryValue: number;
  stockOnHand: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  pendingPOs: number;
  pendingReceipts: number;
  pendingTransfers: number;
  recentMovements: number;
  alertsCount: number;
  criticalAlertsCount: number;
  movementTrends: MovementTrendDto[];
  stockValueByCategory: CategoryValueDto[];
  topMovingProducts: TopProductDto[];
  recentActivity: RecentActivityDto[];
}

export interface MovementTrendDto {
  date: string;
  inbound: number;
  outbound: number;
}

export interface CategoryValueDto {
  categoryName: string;
  value: number;
  percentage: number;
}

export interface TopProductDto {
  productId: number;
  sku: string;
  productName: string;
  totalMovements: number;
  totalQuantity: number;
}

export interface RecentActivityDto {
  activityId: number;
  type: string;
  description: string;
  reference: string;
  timestamp: Date;
  userName: string;
}

export interface ReportFilter {
  warehouseId?: number;
  categoryId?: number;
  supplierId?: number;
  fromDate?: Date;
  toDate?: Date;
  groupBy?: string;
}

export interface InventoryValuationReport {
  generatedDate: Date;
  warehouseName: string;
  totalSKUs: number;
  totalQuantity: number;
  totalValue: number;
  averageUnitCost: number;
  valuationMethod: string;
  items: InventoryValuationItem[];
  summaryByCategory: CategoryValueDto[];
}

export interface InventoryValuationItem {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  warehouseName: string;
  quantityOnHand: number;
  unitCost: number;
  totalValue: number;
  lastMovementDate: Date;
}

export interface StockMovementReport {
  generatedDate: Date;
  fromDate: Date;
  toDate: Date;
  totalInbound: number;
  totalOutbound: number;
  netMovement: number;
  totalValue: number;
  movementsByType: MovementTypeCountDto[];
  movements: StockMovementItem[];
}

export interface MovementTypeCountDto {
  movementType: string;
  count: number;
  quantity: number;
}

export interface StockMovementItem {
  movementId: number;
  movementNumber: string;
  movementType: string;
  movementDate: Date;
  sku: string;
  productName: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference: string;
}

export interface ReorderReport {
  generatedDate: Date;
  totalItems: number;
  criticalItems: number;
  estimatedOrderValue: number;
  items: ReorderItem[];
}

export interface ReorderItem {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  quantityToOrder: number;
  preferredSupplierId: number;
  preferredSupplierName: string;
  estimatedCost: number;
  priority: string;
  daysUntilStockout: number;
}

export interface ABCAnalysisReport {
  generatedDate: Date;
  analysisMethod: string;
  totalProducts: number;
  totalValue: number;
  classA: ABCClassSummary;
  classB: ABCClassSummary;
  classC: ABCClassSummary;
  items: ABCItem[];
}

export interface ABCClassSummary {
  productCount: number;
  productPercentage: number;
  totalValue: number;
  valuePercentage: number;
}

export interface ABCItem {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  classification: string;
  annualValue: number;
  valuePercentage: number;
  cumulativePercentage: number;
  turnoverRate: number;
}

export interface SupplierPerformanceReport {
  generatedDate: Date;
  fromDate: Date;
  toDate: Date;
  totalSuppliers: number;
  totalOrders: number;
  totalValue: number;
  averageLeadTime: number;
  averageOnTimeRate: number;
  suppliers: SupplierPerformanceItem[];
}

export interface SupplierPerformanceItem {
  supplierId: number;
  supplierName: string;
  totalOrders: number;
  totalValue: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeRate: number;
  averageLeadTime: number;
  qualityScore: number;
  returnsCount: number;
  returnRate: number;
  ranking: number;
}

export interface AgingAnalysisReport {
  generatedDate: Date;
  totalValue: number;
  totalItems: number;
  buckets: AgingBucket[];
  items: AgingItem[];
}

export interface AgingBucket {
  bucketName: string;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
  valuePercentage: number;
}

export interface AgingItem {
  productId: number;
  sku: string;
  productName: string;
  warehouseName: string;
  quantity: number;
  value: number;
  lastMovementDate: Date;
  daysInInventory: number;
  ageBucket: string;
}

export interface StockOnHandReport {
  generatedDate: Date;
  warehouseName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  items: StockOnHandItem[];
}

export interface StockOnHandItem {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  warehouseId: number;
  warehouseName: string;
  binLocation: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  unitCost: number;
  totalValue: number;
  reorderPoint: number;
  stockStatus: string;
}
