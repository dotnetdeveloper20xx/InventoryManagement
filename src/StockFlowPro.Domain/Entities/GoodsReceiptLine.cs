using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class GoodsReceiptLine
{
    public int GoodsReceiptLineId { get; set; }
    public int GoodsReceiptId { get; set; }
    public int PurchaseOrderLineId { get; set; }
    public int ProductId { get; set; }

    // Quantities
    public decimal QuantityOrdered { get; set; }
    public decimal QuantityReceived { get; set; }
    public decimal QuantityRejected { get; set; }
    public decimal QuantityAccepted { get; set; }
    public int UOMId { get; set; }

    // Location
    public int? BinId { get; set; }

    // Batch
    public int? BatchId { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ManufactureDate { get; set; }
    public DateTime? ExpiryDate { get; set; }

    // Costing
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }

    // Quality
    public InspectionStatus InspectionStatus { get; set; } = InspectionStatus.NotRequired;
    public string? InspectionNotes { get; set; }
    public string? RejectionReason { get; set; }

    // Navigation Properties
    public GoodsReceipt GoodsReceipt { get; set; } = null!;
    public PurchaseOrderLine PurchaseOrderLine { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public Bin? Bin { get; set; }
    public Batch? Batch { get; set; }
    public UnitOfMeasure UOM { get; set; } = null!;
}
