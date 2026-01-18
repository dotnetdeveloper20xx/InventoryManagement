namespace StockFlowPro.Application.DTOs.GoodsReceipt;

public class GoodsReceiptDto
{
    public int GoodsReceiptId { get; set; }
    public string GRNNumber { get; set; } = string.Empty;
    public int PurchaseOrderId { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? DeliveryNoteNumber { get; set; }
    public string? ReceivedBy { get; set; }
    public string? Notes { get; set; }
    public decimal TotalValue { get; set; }
    public IReadOnlyList<GoodsReceiptLineDto> Lines { get; set; } = new List<GoodsReceiptLineDto>();
    public DateTime CreatedDate { get; set; }
}

public class GoodsReceiptLineDto
{
    public int GoodsReceiptLineId { get; set; }
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal OrderedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal RejectedQuantity { get; set; }
    public decimal AcceptedQuantity { get; set; }
    public int? BinId { get; set; }
    public string? BinCode { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public string? InspectionStatus { get; set; }
    public string? Notes { get; set; }
}

public class CreateGoodsReceiptDto
{
    public int PurchaseOrderId { get; set; }
    public int WarehouseId { get; set; }
    public DateTime ReceiptDate { get; set; }
    public string? DeliveryNoteNumber { get; set; }
    public string? Notes { get; set; }
    public IList<CreateGoodsReceiptLineDto> Lines { get; set; } = new List<CreateGoodsReceiptLineDto>();
}

public class CreateGoodsReceiptLineDto
{
    public int PurchaseOrderLineId { get; set; }
    public int ProductId { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal RejectedQuantity { get; set; }
    public int? BinId { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public decimal UnitCost { get; set; }
    public string? InspectionStatus { get; set; }
    public string? Notes { get; set; }
}

public class GoodsReceiptListDto
{
    public int GoodsReceiptId { get; set; }
    public string GRNNumber { get; set; } = string.Empty;
    public string PONumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int LineCount { get; set; }
    public decimal TotalValue { get; set; }
    public string? ReceivedBy { get; set; }
}

public class PendingReceiptDto
{
    public int PurchaseOrderId { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalLines { get; set; }
    public int LinesFullyReceived { get; set; }
    public int LinesPartiallyReceived { get; set; }
    public int LinesPending { get; set; }
    public IReadOnlyList<PendingReceiptLineDto> Lines { get; set; } = new List<PendingReceiptLineDto>();
}

public class PendingReceiptLineDto
{
    public int PurchaseOrderLineId { get; set; }
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal OrderedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal PendingQuantity { get; set; }
    public decimal UnitPrice { get; set; }
}
