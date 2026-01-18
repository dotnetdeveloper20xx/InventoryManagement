namespace StockFlowPro.Domain.Enums;

public enum SupplierType
{
    Manufacturer = 1,
    Distributor = 2,
    Wholesaler = 3,
    Retailer = 4,
    ServiceProvider = 5
}

public enum SupplierStatus
{
    PendingApproval = 0,
    Active = 1,
    Inactive = 2,
    Blocked = 3,
    OnHold = 4
}
