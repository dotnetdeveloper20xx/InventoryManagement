using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class StockCount : BaseEntity, IAuditableEntity
{
    public int StockCountId { get; set; }
    public string CountNumber { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public StockCountType Type { get; set; }

    // Scope
    public string? ZoneIds { get; set; }
    public string? BinIds { get; set; }
    public string? CategoryIds { get; set; }
    public string? ProductIds { get; set; }
    public string? ABCClasses { get; set; }

    // Dates
    public DateTime ScheduledDate { get; set; }
    public DateTime? StartedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? PostedDate { get; set; }

    // Status
    public StockCountStatus Status { get; set; } = StockCountStatus.Scheduled;

    // Options
    public bool BlindCount { get; set; }
    public bool RequireRecount { get; set; }
    public decimal RecountThresholdPercent { get; set; }

    // Summary
    public int TotalLines { get; set; }
    public int LinesCounted { get; set; }
    public int LinesWithVariance { get; set; }
    public decimal TotalVarianceValue { get; set; }

    public string? AssignedUserIds { get; set; }
    public string? Notes { get; set; }

    // Navigation Properties
    public Warehouse Warehouse { get; set; } = null!;
    public User? CreatedBy { get; set; }
    public ICollection<StockCountLine> Lines { get; set; } = new List<StockCountLine>();
}
