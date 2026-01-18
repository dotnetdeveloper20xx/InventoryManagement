using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class Bin : BaseEntity
{
    public int BinId { get; set; }
    public int ZoneId { get; set; }
    public string BinCode { get; set; } = string.Empty;
    public string? Aisle { get; set; }
    public string? Rack { get; set; }
    public string? Level { get; set; }
    public string? Position { get; set; }

    public BinType Type { get; set; } = BinType.Storage;
    public BinStatus Status { get; set; } = BinStatus.Available;

    // Capacity
    public decimal MaxWeight { get; set; }
    public decimal MaxVolume { get; set; }
    public int MaxUnits { get; set; }
    public decimal CurrentWeight { get; set; }
    public decimal CurrentVolume { get; set; }
    public int CurrentUnits { get; set; }

    // Restrictions
    public int? DedicatedProductId { get; set; }
    public string? AllowedCategoryIds { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Zone Zone { get; set; } = null!;
    public Product? DedicatedProduct { get; set; }
    public ICollection<StockLevel> StockLevels { get; set; } = new List<StockLevel>();
}
