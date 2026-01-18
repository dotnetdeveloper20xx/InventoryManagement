namespace StockFlowPro.Application.DTOs.Reports;

// Inventory Valuation Report
public class InventoryValuationReportDto
{
    public DateTime ReportDate { get; set; }
    public string ValuationMethod { get; set; } = "FIFO";
    public decimal TotalValue { get; set; }
    public int TotalProducts { get; set; }
    public int TotalWarehouses { get; set; }
    public IReadOnlyList<InventoryValuationItemDto> Items { get; set; } = new List<InventoryValuationItemDto>();
    public IReadOnlyList<ValuationByWarehouseDto> ByWarehouse { get; set; } = new List<ValuationByWarehouseDto>();
    public IReadOnlyList<ValuationByCategoryDto> ByCategory { get; set; } = new List<ValuationByCategoryDto>();
}

public class InventoryValuationItemDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public decimal QuantityOnHand { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public decimal LastPurchasePrice { get; set; }
    public decimal AverageCost { get; set; }
}

public class ValuationByWarehouseDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public decimal TotalValue { get; set; }
    public int ProductCount { get; set; }
    public decimal Percentage { get; set; }
}

public class ValuationByCategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal TotalValue { get; set; }
    public int ProductCount { get; set; }
    public decimal Percentage { get; set; }
}

// Stock Movement Report
public class StockMovementReportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int TotalMovements { get; set; }
    public decimal TotalInboundQty { get; set; }
    public decimal TotalOutboundQty { get; set; }
    public decimal TotalInboundValue { get; set; }
    public decimal TotalOutboundValue { get; set; }
    public IReadOnlyList<StockMovementItemDto> Movements { get; set; } = new List<StockMovementItemDto>();
    public IReadOnlyList<MovementByTypeDto> ByType { get; set; } = new List<MovementByTypeDto>();
    public IReadOnlyList<MovementByDateDto> ByDate { get; set; } = new List<MovementByDateDto>();
}

public class StockMovementItemDto
{
    public long MovementId { get; set; }
    public string MovementNumber { get; set; } = string.Empty;
    public DateTime MovementDate { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? FromWarehouse { get; set; }
    public string? ToWarehouse { get; set; }
    public decimal Quantity { get; set; }
    public string UOM { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? ReasonCode { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class MovementByTypeDto
{
    public string MovementType { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
}

public class MovementByDateDto
{
    public DateTime Date { get; set; }
    public decimal InboundQty { get; set; }
    public decimal OutboundQty { get; set; }
    public decimal InboundValue { get; set; }
    public decimal OutboundValue { get; set; }
}

// Reorder Report
public class ReorderReportDto
{
    public DateTime ReportDate { get; set; }
    public int TotalItemsBelowReorderPoint { get; set; }
    public decimal TotalSuggestedOrderValue { get; set; }
    public IReadOnlyList<ReorderItemDto> Items { get; set; } = new List<ReorderItemDto>();
}

public class ReorderItemDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? PreferredSupplier { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal ReorderPoint { get; set; }
    public decimal BelowReorderBy { get; set; }
    public decimal SafetyStock { get; set; }
    public decimal ReorderQuantity { get; set; }
    public decimal OnOrderQuantity { get; set; }
    public int LeadTimeDays { get; set; }
    public DateTime? EstimatedStockoutDate { get; set; }
    public decimal SuggestedOrderQty { get; set; }
    public decimal EstimatedOrderValue { get; set; }
    public string Priority { get; set; } = "Normal";
}

// ABC Analysis Report
public class ABCAnalysisReportDto
{
    public DateTime ReportDate { get; set; }
    public string AnalysisCriteria { get; set; } = "Value";
    public int TotalProducts { get; set; }
    public decimal TotalValue { get; set; }
    public ABCClassSummaryDto ClassA { get; set; } = new();
    public ABCClassSummaryDto ClassB { get; set; } = new();
    public ABCClassSummaryDto ClassC { get; set; } = new();
    public IReadOnlyList<ABCItemDto> Items { get; set; } = new List<ABCItemDto>();
}

public class ABCClassSummaryDto
{
    public string Classification { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public decimal ProductPercentage { get; set; }
    public decimal TotalValue { get; set; }
    public decimal ValuePercentage { get; set; }
}

public class ABCItemDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public decimal AnnualValue { get; set; }
    public decimal CumulativePercentage { get; set; }
    public string Classification { get; set; } = string.Empty;
    public string CurrentClassification { get; set; } = string.Empty;
    public bool NeedsReclassification { get; set; }
}

// Supplier Performance Report
public class SupplierPerformanceReportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int TotalSuppliers { get; set; }
    public IReadOnlyList<SupplierPerformanceItemDto> Suppliers { get; set; } = new List<SupplierPerformanceItemDto>();
}

public class SupplierPerformanceItemDto
{
    public int SupplierId { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalValue { get; set; }
    public decimal OnTimeDeliveryRate { get; set; }
    public decimal QualityAcceptanceRate { get; set; }
    public decimal AverageLeadTimeDays { get; set; }
    public decimal LeadTimeVarianceDays { get; set; }
    public decimal PriceVariancePercent { get; set; }
    public decimal OverallScore { get; set; }
    public int Ranking { get; set; }
}

// Aging Analysis Report
public class AgingAnalysisReportDto
{
    public DateTime ReportDate { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public AgingBucketSummaryDto Bucket0To30 { get; set; } = new();
    public AgingBucketSummaryDto Bucket31To60 { get; set; } = new();
    public AgingBucketSummaryDto Bucket61To90 { get; set; } = new();
    public AgingBucketSummaryDto Bucket91To180 { get; set; } = new();
    public AgingBucketSummaryDto Bucket181To365 { get; set; } = new();
    public AgingBucketSummaryDto BucketOver365 { get; set; } = new();
    public IReadOnlyList<AgingItemDto> Items { get; set; } = new List<AgingItemDto>();
}

public class AgingBucketSummaryDto
{
    public string BucketName { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal Percentage { get; set; }
}

public class AgingItemDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal QuantityOnHand { get; set; }
    public decimal TotalValue { get; set; }
    public DateTime? LastMovementDate { get; set; }
    public int DaysSinceLastMovement { get; set; }
    public string AgingBucket { get; set; } = string.Empty;
    public decimal TurnoverRate { get; set; }
    public string ObsolescenceRisk { get; set; } = "Low";
}

// Stock on Hand Report
public class StockOnHandReportDto
{
    public DateTime ReportDate { get; set; }
    public int TotalProducts { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public IReadOnlyList<StockOnHandItemDto> Items { get; set; } = new List<StockOnHandItemDto>();
}

public class StockOnHandItemDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string? BinLocation { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public decimal QuantityOnHand { get; set; }
    public decimal QuantityReserved { get; set; }
    public decimal QuantityAvailable { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public string StockStatus { get; set; } = string.Empty;
}

// Report Filters
public class ReportFilterDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int? WarehouseId { get; set; }
    public int? CategoryId { get; set; }
    public int? SupplierId { get; set; }
    public int? ProductId { get; set; }
    public string? MovementType { get; set; }
    public string? ValuationMethod { get; set; }
    public bool IncludeZeroStock { get; set; }
}

// Dashboard Stats
public class DashboardStatsDto
{
    public decimal TotalInventoryValue { get; set; }
    public decimal InventoryValueChange { get; set; }
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    public int LowStockItems { get; set; }
    public int OutOfStockItems { get; set; }
    public int OverstockedItems { get; set; }
    public int TotalWarehouses { get; set; }
    public int PendingPurchaseOrders { get; set; }
    public int OverduePurchaseOrders { get; set; }
    public int PendingTransfers { get; set; }
    public int CriticalAlerts { get; set; }
    public int WarningAlerts { get; set; }
    public int InfoAlerts { get; set; }
    public decimal TodayInboundQty { get; set; }
    public decimal TodayOutboundQty { get; set; }
    public IReadOnlyList<TopMovingProductDto> TopMovingProducts { get; set; } = new List<TopMovingProductDto>();
    public IReadOnlyList<WarehouseUtilizationDto> WarehouseUtilization { get; set; } = new List<WarehouseUtilizationDto>();
    public IReadOnlyList<MovementTrendDto> MovementTrend { get; set; } = new List<MovementTrendDto>();
    public StockHealthDto StockHealth { get; set; } = new();
}

public class TopMovingProductDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal TotalMovement { get; set; }
    public decimal TrendPercentage { get; set; }
}

public class WarehouseUtilizationDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public decimal Capacity { get; set; }
    public decimal Used { get; set; }
    public decimal UtilizationPercent { get; set; }
}

public class MovementTrendDto
{
    public DateTime Date { get; set; }
    public decimal Inbound { get; set; }
    public decimal Outbound { get; set; }
}

public class StockHealthDto
{
    public int InStock { get; set; }
    public int LowStock { get; set; }
    public int OutOfStock { get; set; }
    public int Overstocked { get; set; }
    public decimal InStockPercent { get; set; }
    public decimal LowStockPercent { get; set; }
    public decimal OutOfStockPercent { get; set; }
    public decimal OverstockedPercent { get; set; }
}
