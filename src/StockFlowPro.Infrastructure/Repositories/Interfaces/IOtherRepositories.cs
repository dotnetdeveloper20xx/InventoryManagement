using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;

namespace StockFlowPro.Infrastructure.Repositories.Interfaces;

public interface ICategoryRepository : IGenericRepository<Category>
{
    Task<IReadOnlyList<Category>> GetRootCategoriesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Category>> GetWithChildrenAsync(int? parentId = null, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
}

public interface IBrandRepository : IGenericRepository<Brand>
{
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
}

public interface IWarehouseRepository : IGenericRepository<Warehouse>
{
    Task<Warehouse?> GetWithZonesAndBinsAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Warehouse>> GetActiveWarehousesAsync(CancellationToken cancellationToken = default);
}

public interface ISupplierRepository : IGenericRepository<Supplier>
{
    Task<Supplier?> GetWithContactsAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Supplier>> GetActiveSuppliersByTypeAsync(SupplierType type, CancellationToken cancellationToken = default);
}

public interface IStockLevelRepository : IGenericRepository<StockLevel>
{
    Task<StockLevel?> GetByProductAndLocationAsync(int productId, int warehouseId, int? binId = null, int? batchId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockLevel>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockLevel>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockLevel>> GetLowStockItemsAsync(int warehouseId, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalQuantityAsync(int productId, int? warehouseId = null, CancellationToken cancellationToken = default);
}

public interface IStockMovementRepository : IGenericRepository<StockMovement>
{
    Task<IReadOnlyList<StockMovement>> GetByProductAsync(int productId, DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<StockMovement>> GetByReferenceAsync(ReferenceType referenceType, int referenceId, CancellationToken cancellationToken = default);
    Task<string> GenerateMovementNumberAsync(CancellationToken cancellationToken = default);
}

public interface IPurchaseOrderRepository : IGenericRepository<PurchaseOrder>
{
    Task<PurchaseOrder?> GetWithLinesAsync(int id, CancellationToken cancellationToken = default);
    Task<string> GeneratePONumberAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PurchaseOrder>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PurchaseOrder>> GetPendingReceiptsAsync(CancellationToken cancellationToken = default);
}

public interface ITransferRepository : IGenericRepository<Transfer>
{
    Task<Transfer?> GetWithLinesAsync(int id, CancellationToken cancellationToken = default);
    Task<string> GenerateTransferNumberAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Transfer>> GetPendingTransfersAsync(int warehouseId, CancellationToken cancellationToken = default);
}

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}
