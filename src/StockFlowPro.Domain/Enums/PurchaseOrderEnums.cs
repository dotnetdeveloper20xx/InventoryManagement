namespace StockFlowPro.Domain.Enums;

public enum PurchaseOrderStatus
{
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    SentToSupplier = 3,
    Acknowledged = 4,
    PartiallyReceived = 5,
    FullyReceived = 6,
    Closed = 7,
    Cancelled = 8
}

public enum ApprovalStatus
{
    NotRequired = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

public enum PurchaseOrderPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3,
    Critical = 4
}

public enum PurchaseOrderLineStatus
{
    Open = 0,
    PartiallyReceived = 1,
    FullyReceived = 2,
    Cancelled = 3
}

public enum GoodsReceiptStatus
{
    Draft = 0,
    Posted = 1,
    Cancelled = 2
}

public enum InspectionStatus
{
    NotRequired = 0,
    Pending = 1,
    Passed = 2,
    Failed = 3,
    PartialPass = 4
}
