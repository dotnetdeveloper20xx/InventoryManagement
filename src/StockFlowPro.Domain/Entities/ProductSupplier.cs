using StockFlowPro.Domain.Common;

namespace StockFlowPro.Domain.Entities;

public class ProductSupplier : BaseEntity
{
    public int ProductSupplierId { get; set; }
    public int ProductId { get; set; }
    public int SupplierId { get; set; }
    public string? SupplierPartNumber { get; set; }
    public decimal UnitPrice { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal MinOrderQuantity { get; set; } = 1;
    public int LeadTimeDays { get; set; }
    public int Priority { get; set; } = 1;
    public bool IsActive { get; set; } = true;
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }

    // Navigation Properties
    public Product Product { get; set; } = null!;
    public Supplier Supplier { get; set; } = null!;
}
