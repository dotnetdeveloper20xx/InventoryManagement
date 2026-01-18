using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs.Products;

public class ProductDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? BrandId { get; set; }
    public string? BrandName { get; set; }
    public ProductStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public decimal StandardCost { get; set; }
    public decimal ReorderPoint { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal MaxStockLevel { get; set; }
    public int PrimaryUOMId { get; set; }
    public string PrimaryUOMName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool TrackByBatch { get; set; }
    public bool TrackExpiry { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
}

public class ProductListDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? BrandName { get; set; }
    public ProductStatus Status { get; set; }
    public decimal StandardCost { get; set; }
    public decimal ReorderPoint { get; set; }
    public string PrimaryUOMName { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
}

public class ProductDetailDto : ProductDto
{
    public string? FullDescription { get; set; }
    public string? ModelNumber { get; set; }
    public string? ABCClassification { get; set; }
    public int? SecondaryUOMId { get; set; }
    public string? SecondaryUOMName { get; set; }
    public decimal? SecondaryUOMConversion { get; set; }
    public decimal ReorderQuantity { get; set; }
    public decimal SafetyStock { get; set; }
    public int LeadTimeDays { get; set; }
    public bool TrackBySerial { get; set; }
    public int? ShelfLifeDays { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Length { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
    public decimal LastPurchasePrice { get; set; }
    public decimal AverageCost { get; set; }
    public int? PreferredSupplierId { get; set; }
    public string? PreferredSupplierName { get; set; }
    public string? SupplierPartNumber { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductSupplierDto> Suppliers { get; set; } = new();
}

public class ProductImageDto
{
    public int ProductImageId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}

public class ProductSupplierDto
{
    public int ProductSupplierId { get; set; }
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierPartNumber { get; set; }
    public decimal UnitPrice { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal MinOrderQuantity { get; set; }
    public int LeadTimeDays { get; set; }
    public int Priority { get; set; }
    public bool IsActive { get; set; }
}

public class CreateProductDto
{
    public string SKU { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? FullDescription { get; set; }
    public int CategoryId { get; set; }
    public int? BrandId { get; set; }
    public int PrimaryUOMId { get; set; }
    public int? SecondaryUOMId { get; set; }
    public decimal? SecondaryUOMConversion { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal MaxStockLevel { get; set; }
    public decimal ReorderPoint { get; set; }
    public decimal ReorderQuantity { get; set; }
    public decimal StandardCost { get; set; }
    public bool TrackByBatch { get; set; }
    public bool TrackExpiry { get; set; }
    public int? ShelfLifeDays { get; set; }
    public decimal? Weight { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateProductDto
{
    public int ProductId { get; set; }
    public string? Barcode { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? FullDescription { get; set; }
    public int CategoryId { get; set; }
    public int? BrandId { get; set; }
    public ProductStatus Status { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal MaxStockLevel { get; set; }
    public decimal ReorderPoint { get; set; }
    public decimal ReorderQuantity { get; set; }
    public decimal StandardCost { get; set; }
    public bool TrackByBatch { get; set; }
    public bool TrackExpiry { get; set; }
    public int? ShelfLifeDays { get; set; }
    public decimal? Weight { get; set; }
    public string? ImageUrl { get; set; }
}

public class ProductFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } = "asc";
}
