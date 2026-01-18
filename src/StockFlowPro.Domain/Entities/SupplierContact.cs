namespace StockFlowPro.Domain.Entities;

public class SupplierContact
{
    public int SupplierContactId { get; set; }
    public int SupplierId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Supplier Supplier { get; set; } = null!;
}
