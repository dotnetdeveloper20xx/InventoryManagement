using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Application.DTOs.Warehouses;

public class WarehouseDto
{
    public int WarehouseId { get; set; }
    public string WarehouseCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public WarehouseType Type { get; set; }
    public string TypeName => Type.ToString();
    public WarehouseStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? City { get; set; }
    public string? StateProvince { get; set; }
    public string? Country { get; set; }
    public string? ManagerName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal TotalAreaSqFt { get; set; }
    public decimal CurrentUtilizationPercent { get; set; }
    public int TotalPalletPositions { get; set; }
    public bool IsActive { get; set; }
    public int ZoneCount { get; set; }
    public int BinCount { get; set; }
}

public class WarehouseDetailDto : WarehouseDto
{
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? PostalCode { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? OperatingHours { get; set; }
    public decimal StorageCapacityCuFt { get; set; }
    public ValuationMethod DefaultValuationMethod { get; set; }
    public bool AllowNegativeStock { get; set; }
    public bool AutoReplenishment { get; set; }
    public PickingStrategy PickingStrategy { get; set; }
    public List<ZoneDto> Zones { get; set; } = new();
}

public class ZoneDto
{
    public int ZoneId { get; set; }
    public int WarehouseId { get; set; }
    public string ZoneCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ZoneType Type { get; set; }
    public string TypeName => Type.ToString();
    public decimal AreaSqFt { get; set; }
    public int TotalBins { get; set; }
    public int AvailableBins { get; set; }
    public decimal? MinTemperature { get; set; }
    public decimal? MaxTemperature { get; set; }
    public bool IsActive { get; set; }
    public List<BinDto> Bins { get; set; } = new();
}

public class BinDto
{
    public int BinId { get; set; }
    public int ZoneId { get; set; }
    public string BinCode { get; set; } = string.Empty;
    public string? Aisle { get; set; }
    public string? Rack { get; set; }
    public string? Level { get; set; }
    public string? Position { get; set; }
    public BinType Type { get; set; }
    public BinStatus Status { get; set; }
    public decimal MaxWeight { get; set; }
    public decimal CurrentWeight { get; set; }
    public int MaxUnits { get; set; }
    public int CurrentUnits { get; set; }
    public bool IsActive { get; set; }
}

public class CreateWarehouseDto
{
    public string WarehouseCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public WarehouseType Type { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? StateProvince { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? ManagerName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public decimal TotalAreaSqFt { get; set; }
    public int TotalPalletPositions { get; set; }
    public ValuationMethod DefaultValuationMethod { get; set; }
    public PickingStrategy PickingStrategy { get; set; }
    public bool AllowNegativeStock { get; set; }
}

public class UpdateWarehouseDto
{
    public int WarehouseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public WarehouseType Type { get; set; }
    public WarehouseStatus Status { get; set; }
    public string? AddressLine1 { get; set; }
    public string? City { get; set; }
    public string? StateProvince { get; set; }
    public string? Country { get; set; }
    public string? ManagerName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool AllowNegativeStock { get; set; }
}
