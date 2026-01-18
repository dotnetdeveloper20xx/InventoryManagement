using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class GoodsReceipt : BaseEntity
{
    public int GoodsReceiptId { get; set; }
    public string GRNNumber { get; set; } = string.Empty;
    public int PurchaseOrderId { get; set; }
    public int WarehouseId { get; set; }

    // Details
    public DateTime ReceiptDate { get; set; }
    public string? SupplierDeliveryNote { get; set; }
    public string? Carrier { get; set; }
    public string? TrackingNumber { get; set; }

    // Status
    public GoodsReceiptStatus Status { get; set; } = GoodsReceiptStatus.Draft;

    // Audit
    public int ReceivedByUserId { get; set; }
    public DateTime? PostedDate { get; set; }
    public string? Notes { get; set; }

    // Navigation Properties
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
    public User ReceivedBy { get; set; } = null!;
    public ICollection<GoodsReceiptLine> Lines { get; set; } = new List<GoodsReceiptLine>();
}
