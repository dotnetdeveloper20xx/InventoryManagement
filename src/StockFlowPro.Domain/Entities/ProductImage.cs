namespace StockFlowPro.Domain.Entities;

public class ProductImage
{
    public int ProductImageId { get; set; }
    public int ProductId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }

    // Navigation Properties
    public Product Product { get; set; } = null!;
}
