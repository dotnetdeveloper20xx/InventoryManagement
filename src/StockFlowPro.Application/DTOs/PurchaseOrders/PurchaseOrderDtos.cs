using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs.PurchaseOrders;

public class PurchaseOrderDto
{
    public int PurchaseOrderId { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public PurchaseOrderStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public PurchaseOrderPriority Priority { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal TotalAmount { get; set; }
    public int LineCount { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class PurchaseOrderDetailDto : PurchaseOrderDto
{
    public DateTime? ActualDeliveryDate { get; set; }
    public ApprovalStatus ApprovalStatus { get; set; }
    public string? PaymentTerms { get; set; }
    public string? ShippingTerms { get; set; }
    public decimal ExchangeRate { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxPercent { get; set; }
    public string? ShipToAddress { get; set; }
    public string? BillToAddress { get; set; }
    public string? SupplierReference { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? Notes { get; set; }
    public int RevisionNumber { get; set; }
    public List<PurchaseOrderLineDto> Lines { get; set; } = new();
}

public class PurchaseOrderLineDto
{
    public int PurchaseOrderLineId { get; set; }
    public int LineNumber { get; set; }
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal QuantityOrdered { get; set; }
    public decimal QuantityReceived { get; set; }
    public decimal QuantityPending { get; set; }
    public string UOMName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal LineTotal { get; set; }
    public string? Description { get; set; }
    public DateTime? ExpectedDate { get; set; }
    public PurchaseOrderLineStatus Status { get; set; }
}

public class CreatePurchaseOrderDto
{
    public int SupplierId { get; set; }
    public int WarehouseId { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public PurchaseOrderPriority Priority { get; set; } = PurchaseOrderPriority.Normal;
    public string Currency { get; set; } = "USD";
    public string? PaymentTerms { get; set; }
    public string? ShippingTerms { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal ShippingCost { get; set; }
    public string? Notes { get; set; }
    public List<CreatePurchaseOrderLineDto> Lines { get; set; } = new();
}

public class CreatePurchaseOrderLineDto
{
    public int ProductId { get; set; }
    public decimal QuantityOrdered { get; set; }
    public int UOMId { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public string? Description { get; set; }
    public DateTime? ExpectedDate { get; set; }
}

public class ReceiveGoodsDto
{
    public int PurchaseOrderId { get; set; }
    public string? SupplierDeliveryNote { get; set; }
    public string? Carrier { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Notes { get; set; }
    public List<ReceiveGoodsLineDto> Lines { get; set; } = new();
}

public class ReceiveGoodsLineDto
{
    public int PurchaseOrderLineId { get; set; }
    public decimal QuantityReceived { get; set; }
    public decimal QuantityRejected { get; set; }
    public int? BinId { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public InspectionStatus InspectionStatus { get; set; }
    public string? RejectionReason { get; set; }
}
