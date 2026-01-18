using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class StockAdjustment : BaseEntity, IAuditableEntity
{
    public int StockAdjustmentId { get; set; }
    public string AdjustmentNumber { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public AdjustmentType Type { get; set; }

    // Details
    public DateTime AdjustmentDate { get; set; }
    public int ReasonCodeId { get; set; }
    public string? Reference { get; set; }

    // Status
    public AdjustmentStatus Status { get; set; } = AdjustmentStatus.Draft;

    // Totals
    public decimal TotalValueImpact { get; set; }
    public int TotalLines { get; set; }
    public int TotalPositiveLines { get; set; }
    public int TotalNegativeLines { get; set; }

    // Approval
    public bool RequiresApproval { get; set; }
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.NotRequired;
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovalNotes { get; set; }

    public DateTime? PostedDate { get; set; }
    public string? Notes { get; set; }
    public string? Attachments { get; set; }

    // Navigation Properties
    public Warehouse Warehouse { get; set; } = null!;
    public ReasonCode ReasonCode { get; set; } = null!;
    public User? CreatedBy { get; set; }
    public User? ApprovedBy { get; set; }
    public ICollection<StockAdjustmentLine> Lines { get; set; } = new List<StockAdjustmentLine>();
}
