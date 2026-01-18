using StockFlowPro.Domain.Common;

namespace StockFlowPro.Domain.Entities;

public class User : BaseEntity
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }

    // Role & Access
    public int RoleId { get; set; }
    public int? DefaultWarehouseId { get; set; }
    public string? AllowedWarehouseIds { get; set; }

    // Status
    public bool IsActive { get; set; } = true;
    public bool IsLocked { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockoutEnd { get; set; }

    // Preferences
    public string? Preferences { get; set; }

    // Audit
    public DateTime? LastLoginDate { get; set; }

    // Navigation Properties
    public Role Role { get; set; } = null!;
    public Warehouse? DefaultWarehouse { get; set; }
}
