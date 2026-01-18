using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class PurchaseOrderLine
{
    public int PurchaseOrderLineId { get; set; }
    public int PurchaseOrderId { get; set; }
    public int LineNumber { get; set; }
    public int ProductId { get; set; }

    // Quantities
    public decimal QuantityOrdered { get; set; }
    public int UOMId { get; set; }
    public decimal QuantityReceived { get; set; }
    public decimal QuantityPending { get; set; }
    public decimal QuantityRejected { get; set; }

    // Pricing
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LineTotal { get; set; }

    // Details
    public string? Description { get; set; }
    public string? SupplierPartNumber { get; set; }
    public DateTime? ExpectedDate { get; set; }
    public string? Notes { get; set; }

    // Status
    public PurchaseOrderLineStatus Status { get; set; } = PurchaseOrderLineStatus.Open;

    // Navigation Properties
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public UnitOfMeasure UOM { get; set; } = null!;
}
