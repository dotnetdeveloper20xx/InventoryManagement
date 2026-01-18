namespace StockFlowPro.Application.DTOs.StockCount;

public class StockCountDto
{
    public int StockCountId { get; set; }
    public string CountNumber { get; set; } = string.Empty;
    public string CountType { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime CountDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool BlindCount { get; set; }
    public string? Notes { get; set; }
    public int TotalLines { get; set; }
    public int CountedLines { get; set; }
    public int VarianceLines { get; set; }
    public decimal TotalVarianceValue { get; set; }
    public IReadOnlyList<StockCountLineDto> Lines { get; set; } = new List<StockCountLineDto>();
    public string? CreatedBy { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? CompletedBy { get; set; }
    public DateTime? CompletedDate { get; set; }
}

public class StockCountLineDto
{
    public int StockCountLineId { get; set; }
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? BinId { get; set; }
    public string? BinCode { get; set; }
    public string? BatchNumber { get; set; }
    public decimal SystemQuantity { get; set; }
    public decimal? CountQuantity1 { get; set; }
    public decimal? CountQuantity2 { get; set; }
    public decimal? FinalCountQuantity { get; set; }
    public decimal Variance { get; set; }
    public decimal VariancePercent { get; set; }
    public decimal VarianceValue { get; set; }
    public bool RecountRequired { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Pending";
}

public class CreateStockCountDto
{
    public string CountType { get; set; } = "Full";
    public int WarehouseId { get; set; }
    public DateTime CountDate { get; set; }
    public bool BlindCount { get; set; }
    public int? ZoneId { get; set; }
    public int? CategoryId { get; set; }
    public string? Notes { get; set; }
    public IList<int>? ProductIds { get; set; }
}

public class UpdateStockCountLineDto
{
    public int StockCountLineId { get; set; }
    public decimal CountQuantity { get; set; }
    public bool IsSecondCount { get; set; }
    public string? Notes { get; set; }
}

public class StockCountListDto
{
    public int StockCountId { get; set; }
    public string CountNumber { get; set; } = string.Empty;
    public string CountType { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime CountDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalLines { get; set; }
    public int CountedLines { get; set; }
    public int VarianceLines { get; set; }
    public decimal TotalVarianceValue { get; set; }
    public string? CreatedBy { get; set; }
}

public class StockCountSummaryDto
{
    public int StockCountId { get; set; }
    public string CountNumber { get; set; } = string.Empty;
    public int TotalLines { get; set; }
    public int CountedLines { get; set; }
    public int MatchedLines { get; set; }
    public int PositiveVarianceLines { get; set; }
    public int NegativeVarianceLines { get; set; }
    public decimal TotalPositiveVariance { get; set; }
    public decimal TotalNegativeVariance { get; set; }
    public decimal NetVariance { get; set; }
    public decimal TotalPositiveVarianceValue { get; set; }
    public decimal TotalNegativeVarianceValue { get; set; }
    public decimal NetVarianceValue { get; set; }
}

public class PostStockCountDto
{
    public int StockCountId { get; set; }
    public int ReasonCodeId { get; set; }
    public string? Notes { get; set; }
}
