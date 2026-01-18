using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class TransferLine
{
    public int TransferLineId { get; set; }
    public int TransferId { get; set; }
    public int LineNumber { get; set; }
    public int ProductId { get; set; }

    // Locations
    public int? FromBinId { get; set; }
    public int? ToBinId { get; set; }

    // Batch
    public int? BatchId { get; set; }

    // Quantities
    public decimal RequestedQty { get; set; }
    public decimal ApprovedQty { get; set; }
    public decimal ShippedQty { get; set; }
    public decimal ReceivedQty { get; set; }
    public decimal VarianceQty { get; set; }
    public int UOMId { get; set; }

    // Costing
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }

    // Status
    public TransferLineStatus Status { get; set; } = TransferLineStatus.Pending;
    public string? Notes { get; set; }

    // Navigation Properties
    public Transfer Transfer { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public Bin? FromBin { get; set; }
    public Bin? ToBin { get; set; }
    public Batch? Batch { get; set; }
    public UnitOfMeasure UOM { get; set; } = null!;
}
