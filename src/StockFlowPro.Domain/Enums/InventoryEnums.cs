namespace StockFlowPro.Domain.Enums;

public enum StockStatus
{
    OutOfStock = 0,
    Critical = 1,
    Low = 2,
    OK = 3,
    Overstocked = 4
}

public enum MovementType
{
    // Inbound
    PurchaseReceipt = 1,
    TransferIn = 2,
    CustomerReturn = 3,
    PositiveAdjustment = 4,
    OpeningBalance = 5,
    ProductionOutput = 6,

    // Outbound
    SalesIssue = 10,
    TransferOut = 11,
    SupplierReturn = 12,
    NegativeAdjustment = 13,
    DamageWriteOff = 14,
    ExpiryWriteOff = 15,
    ProductionConsumption = 16,

    // Internal
    BinToBinMove = 20,
    QualityStatusChange = 21,
    BatchMerge = 22,
    BatchSplit = 23,
    CountAdjustment = 24
}

public enum ReferenceType
{
    PurchaseOrder = 1,
    GoodsReceipt = 2,
    Transfer = 3,
    StockAdjustment = 4,
    StockCount = 5,
    SalesOrder = 6
}

public enum MovementStatus
{
    Pending = 0,
    Completed = 1,
    Reversed = 2,
    Cancelled = 3
}

public enum ReasonCodeType
{
    Positive = 1,
    Negative = 2,
    Both = 3
}

public enum BatchStatus
{
    Available = 1,
    OnHold = 2,
    Quarantine = 3,
    Expired = 4,
    Recalled = 5,
    Consumed = 6
}
