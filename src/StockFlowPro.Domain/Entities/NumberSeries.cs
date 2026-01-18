namespace StockFlowPro.Domain.Entities;

public class NumberSeries
{
    public int NumberSeriesId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string Prefix { get; set; } = string.Empty;
    public string? DateFormat { get; set; }
    public int CurrentNumber { get; set; }
    public int NumberPadding { get; set; } = 5;
    public string? Suffix { get; set; }
    public DateTime? ResetDate { get; set; }
    public string? ResetFrequency { get; set; }
}
