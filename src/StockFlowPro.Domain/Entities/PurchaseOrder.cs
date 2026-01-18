using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class PurchaseOrder : BaseEntity, IAuditableEntity, IHasRowVersion
{
    public int PurchaseOrderId { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public int WarehouseId { get; set; }

    // Dates
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }

    // Status
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.NotRequired;
    public PurchaseOrderPriority Priority { get; set; } = PurchaseOrderPriority.Normal;

    // Commercial
    public string? PaymentTerms { get; set; }
    public string? ShippingTerms { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal ExchangeRate { get; set; } = 1;

    // Totals
    public decimal Subtotal { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal TotalAmount { get; set; }

    // Addresses
    public string? ShipToAddress { get; set; }
    public string? BillToAddress { get; set; }

    // Tracking
    public string? SupplierReference { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }

    // Approval
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovalNotes { get; set; }

    public string? Notes { get; set; }
    public int RevisionNumber { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Navigation Properties
    public Supplier Supplier { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
    public User? CreatedBy { get; set; }
    public User? ModifiedBy { get; set; }
    public User? ApprovedBy { get; set; }
    public ICollection<PurchaseOrderLine> Lines { get; set; } = new List<PurchaseOrderLine>();
    public ICollection<GoodsReceipt> GoodsReceipts { get; set; } = new List<GoodsReceipt>();
}
