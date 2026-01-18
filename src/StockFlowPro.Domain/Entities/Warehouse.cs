using StockFlowPro.Domain.Common;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class Warehouse : BaseEntity, IAuditableEntity
{
    public int WarehouseId { get; set; }
    public string WarehouseCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public WarehouseType Type { get; set; } = WarehouseType.Main;
    public WarehouseStatus Status { get; set; } = WarehouseStatus.Active;

    // Address
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? StateProvince { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    // Contact
    public string? ManagerName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? OperatingHours { get; set; }

    // Capacity
    public decimal TotalAreaSqFt { get; set; }
    public decimal StorageCapacityCuFt { get; set; }
    public int TotalPalletPositions { get; set; }
    public decimal CurrentUtilizationPercent { get; set; }

    // Settings
    public ValuationMethod DefaultValuationMethod { get; set; } = ValuationMethod.FIFO;
    public bool AllowNegativeStock { get; set; }
    public bool AutoReplenishment { get; set; }
    public PickingStrategy PickingStrategy { get; set; } = PickingStrategy.FIFO;

    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<Zone> Zones { get; set; } = new List<Zone>();
    public ICollection<StockLevel> StockLevels { get; set; } = new List<StockLevel>();
    public ICollection<User> AssignedUsers { get; set; } = new List<User>();
}
