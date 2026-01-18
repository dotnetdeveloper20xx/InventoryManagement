using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Domain.Entities;

public class ReasonCode
{
    public int ReasonCodeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ReasonCodeType Type { get; set; }
    public bool RequiresApproval { get; set; }
    public bool RequiresNote { get; set; }
    public bool IsActive { get; set; } = true;
}
