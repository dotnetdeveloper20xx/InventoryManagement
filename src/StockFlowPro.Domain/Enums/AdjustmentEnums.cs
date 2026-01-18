namespace StockFlowPro.Domain.Enums;

public enum AdjustmentType
{
    Positive = 1,
    Negative = 2,
    Mixed = 3
}

public enum AdjustmentStatus
{
    Draft = 0,
    PendingApproval = 1,
    Approved = 2,
    Rejected = 3,
    Posted = 4,
    Cancelled = 5
}

public enum StockCountType
{
    Full = 1,
    Cycle = 2,
    Spot = 3,
    ABC = 4
}

public enum StockCountStatus
{
    Scheduled = 0,
    InProgress = 1,
    PendingReview = 2,
    Approved = 3,
    Posted = 4,
    Cancelled = 5
}

public enum StockCountLineStatus
{
    Pending = 0,
    Counted = 1,
    Recounting = 2,
    Verified = 3,
    Approved = 4,
    Adjusted = 5
}
