namespace StockFlowPro.Domain.Enums;

public enum WarehouseType
{
    Main = 1,
    Distribution = 2,
    Transit = 3,
    Quarantine = 4
}

public enum WarehouseStatus
{
    Active = 1,
    Inactive = 2,
    UnderMaintenance = 3
}

public enum ValuationMethod
{
    FIFO = 1,
    LIFO = 2,
    WeightedAverage = 3,
    SpecificIdentification = 4
}

public enum PickingStrategy
{
    FIFO = 1,
    LIFO = 2,
    FEFO = 3
}

public enum ZoneType
{
    Receiving = 1,
    Storage = 2,
    ColdStorage = 3,
    FrozenStorage = 4,
    Picking = 5,
    Packing = 6,
    Shipping = 7,
    Quarantine = 8,
    Returns = 9,
    Bulk = 10
}

public enum BinType
{
    Storage = 1,
    Picking = 2,
    Bulk = 3,
    Reserve = 4,
    Receiving = 5,
    Shipping = 6,
    Staging = 7
}

public enum BinStatus
{
    Available = 1,
    PartiallyFilled = 2,
    Full = 3,
    Reserved = 4,
    Blocked = 5,
    UnderMaintenance = 6
}
