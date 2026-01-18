using StockFlowPro.Application.DTOs.Categories;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Inventory;
using StockFlowPro.Application.DTOs.PurchaseOrders;
using StockFlowPro.Application.DTOs.Suppliers;
using StockFlowPro.Application.DTOs.Users;
using StockFlowPro.Application.DTOs.Warehouses;

namespace StockFlowPro.Application.Services.Interfaces;

public interface ICategoryService
{
    Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryTreeDto>> GetTreeAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<CategoryDto> UpdateAsync(UpdateCategoryDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LookupDto>> GetLookupAsync(CancellationToken cancellationToken = default);
}

public interface IWarehouseService
{
    Task<WarehouseDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WarehouseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WarehouseDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto, CancellationToken cancellationToken = default);
    Task<WarehouseDto> UpdateAsync(UpdateWarehouseDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LookupDto>> GetLookupAsync(CancellationToken cancellationToken = default);
}

public interface ISupplierService
{
    Task<SupplierDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PaginatedResponse<SupplierDto>> GetPagedAsync(int pageNumber, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateAsync(CreateSupplierDto dto, CancellationToken cancellationToken = default);
    Task<SupplierDto> UpdateAsync(UpdateSupplierDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LookupDto>> GetLookupAsync(CancellationToken cancellationToken = default);
}

public interface IInventoryService
{
    Task<StockLevelDto?> GetStockLevelAsync(int productId, int warehouseId, CancellationToken cancellationToken = default);
    Task<PaginatedResponse<StockLevelDto>> GetStockLevelsAsync(StockLevelFilterDto filter, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockLevelSummaryDto>> GetStockSummaryByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockLevelDto>> GetLowStockAsync(int warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockMovementDto>> GetMovementHistoryAsync(int productId, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
    Task AdjustStockAsync(CreateStockAdjustmentDto dto, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalQuantityAsync(int productId, int? warehouseId = null, CancellationToken cancellationToken = default);
}

public interface IPurchaseOrderService
{
    Task<PurchaseOrderDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PaginatedResponse<PurchaseOrderDto>> GetPagedAsync(int pageNumber, int pageSize, int? supplierId = null, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> CreateAsync(CreatePurchaseOrderDto dto, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> SubmitAsync(int id, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> ApproveAsync(int id, string? notes = null, CancellationToken cancellationToken = default);
    Task<PurchaseOrderDto> RejectAsync(int id, string reason, CancellationToken cancellationToken = default);
    Task ReceiveGoodsAsync(ReceiveGoodsDto dto, CancellationToken cancellationToken = default);
    Task CancelAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PurchaseOrderDto>> GetPendingReceiptsAsync(CancellationToken cancellationToken = default);
}

public interface IUserService
{
    Task<UserDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<UserDto?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<PaginatedResponse<UserDto>> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateAsync(UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ValidateCredentialsAsync(string username, string password, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(int userId, ChangePasswordDto dto, CancellationToken cancellationToken = default);
    Task LockUserAsync(int id, CancellationToken cancellationToken = default);
    Task UnlockUserAsync(int id, CancellationToken cancellationToken = default);
}

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<LoginResponseDto?> RefreshTokenAsync(int userId, CancellationToken cancellationToken = default);
    Task LogoutAsync(int userId, CancellationToken cancellationToken = default);
    string GenerateJwtToken(UserDto user);
}

/// <summary>
/// Provides access to the current authenticated user's context
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user's ID, or null if not authenticated
    /// </summary>
    int? UserId { get; }

    /// <summary>
    /// Gets the current user's username, or null if not authenticated
    /// </summary>
    string? Username { get; }

    /// <summary>
    /// Gets whether the current user is authenticated
    /// </summary>
    bool IsAuthenticated { get; }
}
