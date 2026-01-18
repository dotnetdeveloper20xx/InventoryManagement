using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs.Inventory;

public class StockLevelDto
{
    public long StockLevelId { get; set; }
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int? BinId { get; set; }
    public string? BinCode { get; set; }
    public int? BatchId { get; set; }
    public string? BatchNumber { get; set; }
    public decimal QuantityOnHand { get; set; }
    public decimal QuantityReserved { get; set; }
    public decimal QuantityAvailable { get; set; }
    public decimal QuantityOnOrder { get; set; }
    public decimal QuantityInTransit { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public StockStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public DateTime LastMovementDate { get; set; }
    public DateTime? LastCountDate { get; set; }
}

public class StockLevelSummaryDto
{
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal TotalQuantityOnHand { get; set; }
    public decimal TotalQuantityAvailable { get; set; }
    public decimal TotalValue { get; set; }
    public decimal ReorderPoint { get; set; }
    public StockStatus OverallStatus { get; set; }
    public int WarehouseCount { get; set; }
}

public class StockMovementDto
{
    public long StockMovementId { get; set; }
    public string MovementNumber { get; set; } = string.Empty;
    public MovementType MovementType { get; set; }
    public string MovementTypeName => MovementType.ToString();
    public DateTime MovementDate { get; set; }
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? FromWarehouseId { get; set; }
    public string? FromWarehouseName { get; set; }
    public int? ToWarehouseId { get; set; }
    public string? ToWarehouseName { get; set; }
    public decimal Quantity { get; set; }
    public string UOMName { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public decimal RunningBalance { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public MovementStatus Status { get; set; }
    public string? CreatedByUserName { get; set; }
}

public class CreateStockAdjustmentDto
{
    public int WarehouseId { get; set; }
    public int ReasonCodeId { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public List<CreateStockAdjustmentLineDto> Lines { get; set; } = new();
}

public class CreateStockAdjustmentLineDto
{
    public int ProductId { get; set; }
    public int? BinId { get; set; }
    public int? BatchId { get; set; }
    public decimal NewQuantity { get; set; }
    public int UOMId { get; set; }
    public string? Notes { get; set; }
}

public class StockLevelFilterDto
{
    public int? WarehouseId { get; set; }
    public int? ProductId { get; set; }
    public int? CategoryId { get; set; }
    public StockStatus? Status { get; set; }
    public bool? LowStockOnly { get; set; }
    public string? Search { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
