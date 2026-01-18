namespace StockFlowPro.Application.DTOs.Zones;

// Zone DTOs
public class ZoneDto
{
    public int ZoneId { get; set; }
    public string ZoneCode { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string ZoneType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? MinTemperature { get; set; }
    public decimal? MaxTemperature { get; set; }
    public decimal? MaxHumidity { get; set; }
    public decimal? Capacity { get; set; }
    public decimal? UsedCapacity { get; set; }
    public decimal UtilizationPercent { get; set; }
    public int BinCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class ZoneListDto
{
    public int ZoneId { get; set; }
    public string ZoneCode { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string ZoneType { get; set; } = string.Empty;
    public int BinCount { get; set; }
    public decimal UtilizationPercent { get; set; }
    public bool IsActive { get; set; }
}

public class CreateZoneDto
{
    public string ZoneCode { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string ZoneType { get; set; } = "Storage";
    public string? Description { get; set; }
    public decimal? MinTemperature { get; set; }
    public decimal? MaxTemperature { get; set; }
    public decimal? MaxHumidity { get; set; }
    public decimal? Capacity { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateZoneDto
{
    public int ZoneId { get; set; }
    public string ZoneCode { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public string ZoneType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? MinTemperature { get; set; }
    public decimal? MaxTemperature { get; set; }
    public decimal? MaxHumidity { get; set; }
    public decimal? Capacity { get; set; }
    public bool IsActive { get; set; }
}

// Bin DTOs
public class BinDto
{
    public int BinId { get; set; }
    public string BinCode { get; set; } = string.Empty;
    public string BinName { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string BinType { get; set; } = string.Empty;
    public string? Aisle { get; set; }
    public string? Rack { get; set; }
    public string? Level { get; set; }
    public string? Position { get; set; }
    public string FullLocationCode { get; set; } = string.Empty;
    public decimal? MaxWeight { get; set; }
    public decimal? MaxVolume { get; set; }
    public decimal? CurrentWeight { get; set; }
    public decimal? CurrentVolume { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class BinListDto
{
    public int BinId { get; set; }
    public string BinCode { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public string BinType { get; set; } = string.Empty;
    public string FullLocationCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ProductCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public bool IsActive { get; set; }
}

public class CreateBinDto
{
    public string BinCode { get; set; } = string.Empty;
    public string? BinName { get; set; }
    public int ZoneId { get; set; }
    public string BinType { get; set; } = "Storage";
    public string? Aisle { get; set; }
    public string? Rack { get; set; }
    public string? Level { get; set; }
    public string? Position { get; set; }
    public decimal? MaxWeight { get; set; }
    public decimal? MaxVolume { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateBinDto
{
    public int BinId { get; set; }
    public string BinCode { get; set; } = string.Empty;
    public string? BinName { get; set; }
    public string BinType { get; set; } = string.Empty;
    public string? Aisle { get; set; }
    public string? Rack { get; set; }
    public string? Level { get; set; }
    public string? Position { get; set; }
    public decimal? MaxWeight { get; set; }
    public decimal? MaxVolume { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class BinContentsDto
{
    public int BinId { get; set; }
    public string BinCode { get; set; } = string.Empty;
    public string FullLocationCode { get; set; } = string.Empty;
    public IReadOnlyList<BinContentItemDto> Items { get; set; } = new List<BinContentItemDto>();
}

public class BinContentItemDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public decimal Quantity { get; set; }
    public string UOM { get; set; } = string.Empty;
    public DateTime LastMovementDate { get; set; }
}

public class BulkCreateBinsDto
{
    public int ZoneId { get; set; }
    public string BinType { get; set; } = "Storage";
    public string AislePrefix { get; set; } = string.Empty;
    public int AisleStart { get; set; } = 1;
    public int AisleEnd { get; set; } = 1;
    public int RackStart { get; set; } = 1;
    public int RackEnd { get; set; } = 1;
    public int LevelStart { get; set; } = 1;
    public int LevelEnd { get; set; } = 1;
    public int PositionsPerLevel { get; set; } = 1;
    public decimal? MaxWeight { get; set; }
    public decimal? MaxVolume { get; set; }
}
