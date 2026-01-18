using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class StockLevel : BaseEntity, IHasRowVersion
{
    public long StockLevelId { get; set; }
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int? BinId { get; set; }
    public int? BatchId { get; set; }

    // Quantities
    public decimal QuantityOnHand { get; set; }
    public decimal QuantityReserved { get; set; }
    public decimal QuantityAvailable { get; set; }
    public decimal QuantityOnOrder { get; set; }
    public decimal QuantityInTransit { get; set; }
    public decimal QuantityQuarantine { get; set; }

    // Costing
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }

    // Status
    public StockStatus Status { get; set; } = StockStatus.OK;
    public DateTime LastMovementDate { get; set; }
    public DateTime? LastCountDate { get; set; }

    // Concurrency
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Navigation Properties
    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
    public Bin? Bin { get; set; }
    public Batch? Batch { get; set; }
}
