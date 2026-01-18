using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class Alert
{
    public long AlertId { get; set; }
    public AlertType Type { get; set; }
    public AlertSeverity Severity { get; set; }

    // Context
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public int? SupplierId { get; set; }
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }

    // Content
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? Data { get; set; }

    // Status
    public bool IsRead { get; set; }
    public bool IsDismissed { get; set; }
    public bool IsSnoozed { get; set; }
    public DateTime? SnoozeUntil { get; set; }

    // Timestamps
    public DateTime CreatedDate { get; set; }
    public DateTime? ReadDate { get; set; }
    public DateTime? DismissedDate { get; set; }
    public int? ReadByUserId { get; set; }

    // Navigation Properties
    public Product? Product { get; set; }
    public Warehouse? Warehouse { get; set; }
    public Supplier? Supplier { get; set; }
    public User? ReadBy { get; set; }
}
