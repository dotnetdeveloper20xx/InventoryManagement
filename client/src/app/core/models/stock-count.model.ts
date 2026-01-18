export interface StockCount {
  stockCountId: number;
  countNumber: string;
  countType: string;
  warehouseId: number;
  warehouseName: string;
  countDate: Date;
  status: string;
  blindCount: boolean;
  notes: string;
  totalLines: number;
  countedLines: number;
  varianceLines: number;
  totalVarianceValue: number;
  lines: StockCountLine[];
  createdBy: string;
  createdDate: Date;
  completedBy: string;
  completedDate: Date | null;
}

export interface StockCountLine {
  stockCountLineId: number;
  productId: number;
  productSKU: string;
  productName: string;
  binId: number;
  binCode: string;
  batchNumber: string;
  systemQuantity: number;
  countQuantity1: number;
  countQuantity2: number;
  finalCountQuantity: number;
  variance: number;
  variancePercent: number;
  varianceValue: number;
  recountRequired: boolean;
  notes: string;
  status: string;
}

export interface StockCountListItem {
  stockCountId: number;
  countNumber: string;
  countType: string;
  warehouseName: string;
  countDate: Date;
  status: string;
  totalLines: number;
  countedLines: number;
  varianceLines: number;
  totalVarianceValue: number;
  createdBy: string;
}

export interface StockCountSummary {
  stockCountId: number;
  countNumber: string;
  totalLines: number;
  countedLines: number;
  matchedLines: number;
  positiveVarianceLines: number;
  negativeVarianceLines: number;
  totalPositiveVariance: number;
  totalNegativeVariance: number;
  netVariance: number;
  totalPositiveVarianceValue: number;
  totalNegativeVarianceValue: number;
  netVarianceValue: number;
}

export interface CreateStockCount {
  countType: string;
  warehouseId: number;
  countDate: Date;
  blindCount: boolean;
  notes?: string;
  categoryId?: number;
  productIds?: number[];
}

export interface UpdateStockCountLine {
  stockCountLineId: number;
  countQuantity: number;
  isSecondCount: boolean;
  notes?: string;
}

export interface PostStockCount {
  stockCountId: number;
  reasonCodeId?: number;
  notes?: string;
}

export interface StockCountFilter {
  warehouseId?: number;
  status?: string;
  pageNumber: number;
  pageSize: number;
}
