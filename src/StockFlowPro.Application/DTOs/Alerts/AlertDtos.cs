namespace StockFlowPro.Application.DTOs.Alerts;

public class AlertDto
{
    public long AlertId { get; set; }
    public string AlertType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public string? EntityReference { get; set; }
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public bool IsRead { get; set; }
    public bool IsDismissed { get; set; }
    public DateTime? SnoozedUntil { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? AcknowledgedDate { get; set; }
    public string? AcknowledgedBy { get; set; }
}

public class AlertListDto
{
    public long AlertId { get; set; }
    public string AlertType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? EntityReference { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class AlertSummaryDto
{
    public int TotalAlerts { get; set; }
    public int UnreadAlerts { get; set; }
    public int CriticalCount { get; set; }
    public int WarningCount { get; set; }
    public int InfoCount { get; set; }
    public IReadOnlyList<AlertCountByTypeDto> ByType { get; set; } = new List<AlertCountByTypeDto>();
}

public class AlertCountByTypeDto
{
    public string AlertType { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AlertFilterDto
{
    public string? Severity { get; set; }
    public string? AlertType { get; set; }
    public int? WarehouseId { get; set; }
    public bool? IsRead { get; set; }
    public bool IncludeDismissed { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class AcknowledgeAlertDto
{
    public long AlertId { get; set; }
    public string? Notes { get; set; }
}

public class SnoozeAlertDto
{
    public long AlertId { get; set; }
    public int SnoozeMinutes { get; set; } = 60;
}

public class BulkAlertActionDto
{
    public IList<long> AlertIds { get; set; } = new List<long>();
    public string Action { get; set; } = string.Empty; // MarkRead, Dismiss, Snooze
    public int? SnoozeMinutes { get; set; }
}

// Low Stock Alert Details
public class LowStockAlertDetailDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public decimal CurrentStock { get; set; }
    public decimal ReorderPoint { get; set; }
    public decimal SafetyStock { get; set; }
    public decimal SuggestedOrderQuantity { get; set; }
    public string? PreferredSupplier { get; set; }
}

// Expiry Alert Details
public class ExpiryAlertDetailDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public int DaysUntilExpiry { get; set; }
    public decimal Quantity { get; set; }
    public decimal Value { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
}
