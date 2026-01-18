using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs.Suppliers;

public class SupplierDto
{
    public int SupplierId { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? TradingName { get; set; }
    public SupplierType Type { get; set; }
    public string TypeName => Type.ToString();
    public SupplierStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? BillingCity { get; set; }
    public string? BillingCountry { get; set; }
    public string? PrimaryContactName { get; set; }
    public string? PrimaryContactEmail { get; set; }
    public string? PrimaryContactPhone { get; set; }
    public string Currency { get; set; } = "USD";
    public int DefaultLeadTimeDays { get; set; }
    public decimal OnTimeDeliveryRate { get; set; }
    public decimal QualityAcceptanceRate { get; set; }
    public int Rating { get; set; }
}

public class SupplierDetailDto : SupplierDto
{
    public string? TaxId { get; set; }
    public string? BillingAddressLine1 { get; set; }
    public string? BillingAddressLine2 { get; set; }
    public string? BillingStateProvince { get; set; }
    public string? BillingPostalCode { get; set; }
    public string? ShippingAddressLine1 { get; set; }
    public string? ShippingCity { get; set; }
    public string? ShippingCountry { get; set; }
    public string? PaymentTerms { get; set; }
    public int PaymentTermsDays { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal MinOrderValue { get; set; }
    public string? ShippingTerms { get; set; }
    public decimal TotalSpend { get; set; }
    public int TotalOrders { get; set; }
    public string? Notes { get; set; }
    public List<SupplierContactDto> Contacts { get; set; } = new();
}

public class SupplierContactDto
{
    public int SupplierContactId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public bool IsPrimary { get; set; }
    public bool IsActive { get; set; }
}

public class CreateSupplierDto
{
    public string SupplierCode { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? TradingName { get; set; }
    public SupplierType Type { get; set; }
    public string? BillingAddressLine1 { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingStateProvince { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }
    public string? PrimaryContactName { get; set; }
    public string? PrimaryContactEmail { get; set; }
    public string? PrimaryContactPhone { get; set; }
    public string Currency { get; set; } = "USD";
    public int PaymentTermsDays { get; set; } = 30;
    public int DefaultLeadTimeDays { get; set; }
}

public class UpdateSupplierDto
{
    public int SupplierId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? TradingName { get; set; }
    public SupplierType Type { get; set; }
    public SupplierStatus Status { get; set; }
    public string? BillingAddressLine1 { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingCountry { get; set; }
    public string? PrimaryContactName { get; set; }
    public string? PrimaryContactEmail { get; set; }
    public string? PrimaryContactPhone { get; set; }
    public int PaymentTermsDays { get; set; }
    public int DefaultLeadTimeDays { get; set; }
}
