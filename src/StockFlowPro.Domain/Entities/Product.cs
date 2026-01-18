using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class Product : BaseEntity, IAuditableEntity, IHasRowVersion
{
    public int ProductId { get; set; }

    // Identification
    public string SKU { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? BarcodeType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? FullDescription { get; set; }
    public string? ModelNumber { get; set; }

    // Classification
    public int CategoryId { get; set; }
    public int? BrandId { get; set; }
    public string? ABCClassification { get; set; }
    public string? ProductType { get; set; }
    public ProductStatus Status { get; set; } = ProductStatus.Active;

    // Units & Quantities
    public int PrimaryUOMId { get; set; }
    public int? SecondaryUOMId { get; set; }
    public decimal? SecondaryUOMConversion { get; set; }

    // Inventory Settings
    public decimal MinStockLevel { get; set; }
    public decimal MaxStockLevel { get; set; }
    public decimal ReorderPoint { get; set; }
    public decimal ReorderQuantity { get; set; }
    public decimal SafetyStock { get; set; }
    public int LeadTimeDays { get; set; }

    // Tracking Options
    public bool TrackByBatch { get; set; }
    public bool TrackBySerial { get; set; }
    public bool TrackExpiry { get; set; }
    public int? ShelfLifeDays { get; set; }

    // Physical Attributes
    public decimal? Weight { get; set; }
    public decimal? Length { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
    public decimal? Volume { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }

    // Costing & Pricing
    public decimal StandardCost { get; set; }
    public decimal LastPurchasePrice { get; set; }
    public decimal AverageCost { get; set; }
    public decimal? MSRP { get; set; }
    public decimal? WholesalePrice { get; set; }
    public decimal MinOrderQuantity { get; set; } = 1;

    // Supplier
    public int? PreferredSupplierId { get; set; }
    public string? SupplierPartNumber { get; set; }

    // Media
    public string? ImageUrl { get; set; }
    public string? ThumbnailUrl { get; set; }

    // Storage
    public string? StorageRequirements { get; set; }
    public decimal? MinTemperature { get; set; }
    public decimal? MaxTemperature { get; set; }
    public decimal? MaxHumidity { get; set; }

    // Concurrency
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Navigation Properties
    public Category Category { get; set; } = null!;
    public Brand? Brand { get; set; }
    public UnitOfMeasure PrimaryUOM { get; set; } = null!;
    public UnitOfMeasure? SecondaryUOM { get; set; }
    public Supplier? PreferredSupplier { get; set; }
    public User? CreatedBy { get; set; }
    public User? ModifiedBy { get; set; }

    public ICollection<ProductSupplier> ProductSuppliers { get; set; } = new List<ProductSupplier>();
    public ICollection<StockLevel> StockLevels { get; set; } = new List<StockLevel>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
    public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
}
