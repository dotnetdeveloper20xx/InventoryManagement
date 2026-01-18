namespace StockFlowPro.Application.DTOs.AuditLog;

public class AuditLogDto
{
    public long AuditLogId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string? EntityReference { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? ChangedFields { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Notes { get; set; }
}

public class AuditLogListDto
{
    public long AuditLogId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string? EntityReference { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Summary { get; set; }
}

public class AuditLogFilterDto
{
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public string? Action { get; set; }
    public int? UserId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Search { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class AuditLogDetailDto
{
    public long AuditLogId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string? EntityReference { get; set; }
    public string Action { get; set; } = string.Empty;
    public IReadOnlyList<AuditFieldChangeDto> Changes { get; set; } = new List<AuditFieldChangeDto>();
    public string? UserName { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
}

public class AuditFieldChangeDto
{
    public string FieldName { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}

public class EntityAuditHistoryDto
{
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string? EntityReference { get; set; }
    public IReadOnlyList<AuditLogListDto> History { get; set; } = new List<AuditLogListDto>();
}

public class AuditSummaryDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int TotalActions { get; set; }
    public IReadOnlyList<AuditActionSummaryDto> ByAction { get; set; } = new List<AuditActionSummaryDto>();
    public IReadOnlyList<AuditEntitySummaryDto> ByEntity { get; set; } = new List<AuditEntitySummaryDto>();
    public IReadOnlyList<AuditUserSummaryDto> ByUser { get; set; } = new List<AuditUserSummaryDto>();
}

public class AuditActionSummaryDto
{
    public string Action { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AuditEntitySummaryDto
{
    public string EntityType { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class AuditUserSummaryDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int ActionCount { get; set; }
    public DateTime LastActivity { get; set; }
}
