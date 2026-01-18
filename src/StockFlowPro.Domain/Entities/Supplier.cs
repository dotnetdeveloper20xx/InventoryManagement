using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class Supplier : BaseEntity, IAuditableEntity
{
    public int SupplierId { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? TradingName { get; set; }
    public string? TaxId { get; set; }
    public SupplierType Type { get; set; } = SupplierType.Distributor;
    public SupplierStatus Status { get; set; } = SupplierStatus.Active;

    // Billing Address
    public string? BillingAddressLine1 { get; set; }
    public string? BillingAddressLine2 { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingStateProvince { get; set; }
    public string? BillingPostalCode { get; set; }
    public string? BillingCountry { get; set; }

    // Shipping Address
    public string? ShippingAddressLine1 { get; set; }
    public string? ShippingAddressLine2 { get; set; }
    public string? ShippingCity { get; set; }
    public string? ShippingStateProvince { get; set; }
    public string? ShippingPostalCode { get; set; }
    public string? ShippingCountry { get; set; }

    // Primary Contact
    public string? PrimaryContactName { get; set; }
    public string? PrimaryContactEmail { get; set; }
    public string? PrimaryContactPhone { get; set; }
    public string? PrimaryContactPosition { get; set; }

    // Commercial Terms
    public string? PaymentTerms { get; set; }
    public int PaymentTermsDays { get; set; } = 30;
    public decimal CreditLimit { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal MinOrderValue { get; set; }
    public string? ShippingTerms { get; set; }
    public int DefaultLeadTimeDays { get; set; }

    // Banking
    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankRoutingNumber { get; set; }
    public string? BankSwiftCode { get; set; }

    // Performance Metrics
    public decimal OnTimeDeliveryRate { get; set; }
    public decimal QualityAcceptanceRate { get; set; }
    public decimal AverageLeadTimeDays { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpend { get; set; }
    public int Rating { get; set; }

    public string? Notes { get; set; }

    // Navigation Properties
    public ICollection<SupplierContact> Contacts { get; set; } = new List<SupplierContact>();
    public ICollection<ProductSupplier> ProductSuppliers { get; set; } = new List<ProductSupplier>();
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}
