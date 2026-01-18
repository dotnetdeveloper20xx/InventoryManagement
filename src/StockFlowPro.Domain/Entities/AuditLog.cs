using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class AuditLog
{
    public long AuditLogId { get; set; }

    // Entity
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string? EntityReference { get; set; }

    // Action
    public AuditAction Action { get; set; }
    public string? ActionDescription { get; set; }

    // Changes
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? ChangedFields { get; set; }

    // Context
    public int UserId { get; set; }
    public string? Username { get; set; }
    public DateTime Timestamp { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    // Navigation Properties
    public User? User { get; set; }
}
