using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class Zone : BaseEntity
{
    public int ZoneId { get; set; }
    public int WarehouseId { get; set; }
    public string ZoneCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ZoneType Type { get; set; }

    // Environment
    public decimal? MinTemperature { get; set; }
    public decimal? MaxTemperature { get; set; }
    public decimal? MinHumidity { get; set; }
    public decimal? MaxHumidity { get; set; }

    // Capacity
    public decimal AreaSqFt { get; set; }
    public int TotalBins { get; set; }
    public int AvailableBins { get; set; }

    // Restrictions
    public string? AllowedCategoryIds { get; set; }
    public string? RestrictedProductIds { get; set; }

    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }

    // Navigation Properties
    public Warehouse Warehouse { get; set; } = null!;
    public ICollection<Bin> Bins { get; set; } = new List<Bin>();
}
