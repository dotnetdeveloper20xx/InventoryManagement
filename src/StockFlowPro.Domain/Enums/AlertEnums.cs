namespace StockFlowPro.Domain.Enums;

public enum AlertType
{
    LowStock = 1,
    OutOfStock = 2,
    OverStock = 3,
    ExpiryWarning = 4,
    Expired = 5,
    POOverdue = 6,
    POReceived = 7,
    TransferCompleted = 8,
    AdjustmentPending = 9,
    CountDue = 10,
    SystemError = 99
}

public enum AlertSeverity
{
    Info = 0,
    Warning = 1,
    Critical = 2
}

public enum AuditAction
{
    Create = 1,
    Update = 2,
    Delete = 3,
    SoftDelete = 4,
    Restore = 5,
    View = 6,
    Export = 7,
    Import = 8,
    Approve = 9,
    Reject = 10,
    Submit = 11,
    Cancel = 12,
    Post = 13,
    Login = 20,
    Logout = 21,
    FailedLogin = 22
}
