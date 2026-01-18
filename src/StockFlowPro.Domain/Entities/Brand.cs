using StockFlowPro.Domain.Common;

namespace StockFlowPro.Domain.Entities;

public class Brand : BaseEntity, IAuditableEntity
{
    public int BrandId { get; set; }
    public string BrandCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public string? Country { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
