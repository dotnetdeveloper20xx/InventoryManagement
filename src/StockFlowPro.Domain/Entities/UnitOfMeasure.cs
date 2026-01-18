using StockFlowPro.Domain.Common;

namespace StockFlowPro.Domain.Entities;

public class UnitOfMeasure : BaseEntity
{
    public int UOMId { get; set; }
    public string UOMCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Symbol { get; set; }
    public string? UOMType { get; set; }
    public int? BaseUOMId { get; set; }
    public decimal ConversionFactor { get; set; } = 1;
    public int DecimalPlaces { get; set; } = 0;
    public bool IsBaseUnit { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public UnitOfMeasure? BaseUOM { get; set; }
    public ICollection<UnitOfMeasure> DerivedUOMs { get; set; } = new List<UnitOfMeasure>();
}
