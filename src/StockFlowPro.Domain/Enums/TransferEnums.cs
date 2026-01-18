namespace StockFlowPro.Domain.Enums;

public enum TransferType
{
    InterWarehouse = 1,
    InterZone = 2,
    BinToBin = 3
}

public enum TransferStatus
{
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    Rejected = 3,
    Shipped = 4,
    InTransit = 5,
    PartiallyReceived = 6,
    Received = 7,
    Completed = 8,
    Cancelled = 9
}

public enum TransferPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

public enum TransferLineStatus
{
    Pending = 0,
    PartiallyShipped = 1,
    Shipped = 2,
    PartiallyReceived = 3,
    Received = 4,
    Cancelled = 5
}
