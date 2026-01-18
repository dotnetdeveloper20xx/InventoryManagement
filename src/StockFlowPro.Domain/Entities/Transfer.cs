using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class Transfer : BaseEntity, IAuditableEntity, IHasRowVersion
{
    public int TransferId { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public TransferType Type { get; set; } = TransferType.InterWarehouse;

    // Locations
    public int FromWarehouseId { get; set; }
    public int ToWarehouseId { get; set; }

    // Dates
    public DateTime RequestedDate { get; set; }
    public DateTime? RequiredDate { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public DateTime? CompletedDate { get; set; }

    // Status
    public TransferStatus Status { get; set; } = TransferStatus.Draft;
    public TransferPriority Priority { get; set; } = TransferPriority.Normal;

    // Shipping
    public string? Carrier { get; set; }
    public string? TrackingNumber { get; set; }
    public decimal? ShippingCost { get; set; }

    // Approval
    public bool RequiresApproval { get; set; }
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.NotRequired;
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovedDate { get; set; }

    // Users
    public int RequestedByUserId { get; set; }
    public int? ShippedByUserId { get; set; }
    public int? ReceivedByUserId { get; set; }

    public string? Notes { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Navigation Properties
    public Warehouse FromWarehouse { get; set; } = null!;
    public Warehouse ToWarehouse { get; set; } = null!;
    public User RequestedBy { get; set; } = null!;
    public User? ApprovedBy { get; set; }
    public User? ShippedBy { get; set; }
    public User? ReceivedBy { get; set; }
    public ICollection<TransferLine> Lines { get; set; } = new List<TransferLine>();
}
