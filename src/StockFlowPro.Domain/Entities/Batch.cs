using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class Batch : BaseEntity, IAuditableEntity
{
    public int BatchId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }

    // Dates
    public DateTime? ManufactureDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public DateTime ReceiptDate { get; set; }

    // Supplier
    public int? SupplierId { get; set; }
    public string? SupplierBatchNumber { get; set; }

    // Quality
    public BatchStatus Status { get; set; } = BatchStatus.Available;
    public string? CertificateOfAnalysis { get; set; }
    public DateTime? QualityCheckDate { get; set; }
    public int? QualityCheckedByUserId { get; set; }

    public string? Notes { get; set; }

    // Navigation Properties
    public Product Product { get; set; } = null!;
    public Supplier? Supplier { get; set; }
    public User? QualityCheckedBy { get; set; }
    public User? CreatedBy { get; set; }
    public ICollection<StockLevel> StockLevels { get; set; } = new List<StockLevel>();
}
