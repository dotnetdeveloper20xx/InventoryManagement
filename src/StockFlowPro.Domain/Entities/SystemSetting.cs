namespace StockFlowPro.Domain.Entities;

public class SystemSetting
{
    public int SystemSettingId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string? DataType { get; set; }
    public string? Description { get; set; }
    public bool IsEditable { get; set; } = true;
    public DateTime ModifiedDate { get; set; }
    public int? ModifiedByUserId { get; set; }
}
