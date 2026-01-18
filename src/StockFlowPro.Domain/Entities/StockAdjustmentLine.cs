namespace StockFlowPro.Domain.Entities;

public class StockAdjustmentLine
{
    public int StockAdjustmentLineId { get; set; }
    public int StockAdjustmentId { get; set; }
    public int LineNumber { get; set; }
    public int ProductId { get; set; }

    // Location
    public int? BinId { get; set; }
    public int? BatchId { get; set; }

    // Quantities
    public decimal QuantityBefore { get; set; }
    public decimal QuantityAfter { get; set; }
    public decimal Variance { get; set; }
    public int UOMId { get; set; }

    // Costing
    public decimal UnitCost { get; set; }
    public decimal ValueImpact { get; set; }

    // Details
    public int? ReasonCodeId { get; set; }
    public string? Notes { get; set; }

    // Navigation Properties
    public StockAdjustment StockAdjustment { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public Bin? Bin { get; set; }
    public Batch? Batch { get; set; }
    public UnitOfMeasure UOM { get; set; } = null!;
    public ReasonCode? ReasonCode { get; set; }
}
