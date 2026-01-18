using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class StockMovement : BaseEntity, IAuditableEntity
{
    public long StockMovementId { get; set; }
    public string MovementNumber { get; set; } = string.Empty;
    public MovementType MovementType { get; set; }
    public DateTime MovementDate { get; set; }

    // Product
    public int ProductId { get; set; }
    public int? BatchId { get; set; }

    // Locations
    public int? FromWarehouseId { get; set; }
    public int? FromBinId { get; set; }
    public int? ToWarehouseId { get; set; }
    public int? ToBinId { get; set; }

    // Quantities
    public decimal Quantity { get; set; }
    public int UOMId { get; set; }
    public decimal QuantityInBaseUOM { get; set; }

    // Costing
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public decimal RunningBalance { get; set; }

    // Reference
    public ReferenceType? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public string? ReferenceNumber { get; set; }

    // Reason
    public int? ReasonCodeId { get; set; }
    public string? Notes { get; set; }

    // Status
    public MovementStatus Status { get; set; } = MovementStatus.Completed;

    // Navigation Properties
    public Product Product { get; set; } = null!;
    public Batch? Batch { get; set; }
    public Warehouse? FromWarehouse { get; set; }
    public Bin? FromBin { get; set; }
    public Warehouse? ToWarehouse { get; set; }
    public Bin? ToBin { get; set; }
    public UnitOfMeasure UOM { get; set; } = null!;
    public ReasonCode? ReasonCode { get; set; }
    public User? CreatedBy { get; set; }
}
