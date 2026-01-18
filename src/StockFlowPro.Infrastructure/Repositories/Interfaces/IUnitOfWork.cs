namespace StockFlowPro.Infrastructure.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    ICategoryRepository Categories { get; }
    IBrandRepository Brands { get; }
    IWarehouseRepository Warehouses { get; }
    ISupplierRepository Suppliers { get; }
    IStockLevelRepository StockLevels { get; }
    IStockMovementRepository StockMovements { get; }
    IPurchaseOrderRepository PurchaseOrders { get; }
    ITransferRepository Transfers { get; }
    IUserRepository Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
