using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class StockCountLine
{
    public int StockCountLineId { get; set; }
    public int StockCountId { get; set; }
    public int LineNumber { get; set; }
    public int ProductId { get; set; }

    // Location
    public int? BinId { get; set; }
    public int? BatchId { get; set; }

    // Quantities
    public decimal SystemQty { get; set; }
    public decimal? CountQty1 { get; set; }
    public decimal? CountQty2 { get; set; }
    public decimal? FinalCountQty { get; set; }
    public decimal Variance { get; set; }
    public decimal VariancePercent { get; set; }
    public int UOMId { get; set; }

    // Costing
    public decimal UnitCost { get; set; }
    public decimal VarianceValue { get; set; }

    // Status
    public StockCountLineStatus Status { get; set; } = StockCountLineStatus.Pending;
    public bool RecountRequired { get; set; }

    // Counters
    public int? CountedBy1UserId { get; set; }
    public DateTime? CountedDate1 { get; set; }
    public int? CountedBy2UserId { get; set; }
    public DateTime? CountedDate2 { get; set; }

    public string? Notes { get; set; }

    // Navigation Properties
    public StockCount StockCount { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public Bin? Bin { get; set; }
    public Batch? Batch { get; set; }
    public UnitOfMeasure UOM { get; set; } = null!;
    public User? CountedBy1 { get; set; }
    public User? CountedBy2 { get; set; }
}
