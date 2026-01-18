using Microsoft.EntityFrameworkCore.Storage;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Infrastructure.Repositories.Interfaces;

namespace StockFlowPro.Infrastructure.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly StockFlowDbContext _context;
    private IDbContextTransaction? _transaction;

    private IProductRepository? _products;
    private ICategoryRepository? _categories;
    private IBrandRepository? _brands;
    private IWarehouseRepository? _warehouses;
    private ISupplierRepository? _suppliers;
    private IStockLevelRepository? _stockLevels;
    private IStockMovementRepository? _stockMovements;
    private IPurchaseOrderRepository? _purchaseOrders;
    private ITransferRepository? _transfers;
    private IUserRepository? _users;

    public UnitOfWork(StockFlowDbContext context)
    {
        _context = context;
    }

    public IProductRepository Products => _products ??= new ProductRepository(_context);
    public ICategoryRepository Categories => _categories ??= new CategoryRepository(_context);
    public IBrandRepository Brands => _brands ??= new BrandRepository(_context);
    public IWarehouseRepository Warehouses => _warehouses ??= new WarehouseRepository(_context);
    public ISupplierRepository Suppliers => _suppliers ??= new SupplierRepository(_context);
    public IStockLevelRepository StockLevels => _stockLevels ??= new StockLevelRepository(_context);
    public IStockMovementRepository StockMovements => _stockMovements ??= new StockMovementRepository(_context);
    public IPurchaseOrderRepository PurchaseOrders => _purchaseOrders ??= new PurchaseOrderRepository(_context);
    public ITransferRepository Transfers => _transfers ??= new TransferRepository(_context);
    public IUserRepository Users => _users ??= new UserRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
