using StockFlowPro.Domain.Common;

namespace StockFlowPro.Domain.Entities;

public class Role : BaseEntity
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Permissions { get; set; }
    public bool IsSystem { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public ICollection<User> Users { get; set; } = new List<User>();
}
