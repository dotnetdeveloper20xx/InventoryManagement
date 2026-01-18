using Microsoft.EntityFrameworkCore;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Infrastructure.Repositories.Interfaces;

namespace StockFlowPro.Infrastructure.Repositories.Implementations;

public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
{
    public CategoryRepository(StockFlowDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Category>> GetRootCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(c => c.ParentCategoryId == null).OrderBy(c => c.DisplayOrder).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetWithChildrenAsync(int? parentId = null, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.ParentCategoryId == parentId)
            .Include(c => c.ChildCategories)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(c => c.CategoryCode == code, cancellationToken);
    }
}

public class BrandRepository : GenericRepository<Brand>, IBrandRepository
{
    public BrandRepository(StockFlowDbContext context) : base(context) { }

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(b => b.BrandCode == code, cancellationToken);
    }
}

public class WarehouseRepository : GenericRepository<Warehouse>, IWarehouseRepository
{
    public WarehouseRepository(StockFlowDbContext context) : base(context) { }

    public async Task<Warehouse?> GetWithZonesAndBinsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(w => w.Zones)
                .ThenInclude(z => z.Bins)
            .FirstOrDefaultAsync(w => w.WarehouseId == id, cancellationToken);
    }

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(w => w.WarehouseCode == code, cancellationToken);
    }

    public async Task<IReadOnlyList<Warehouse>> GetActiveWarehousesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(w => w.IsActive && w.Status == WarehouseStatus.Active).OrderBy(w => w.Name).ToListAsync(cancellationToken);
    }
}

public class SupplierRepository : GenericRepository<Supplier>, ISupplierRepository
{
    public SupplierRepository(StockFlowDbContext context) : base(context) { }

    public async Task<Supplier?> GetWithContactsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Include(s => s.Contacts).FirstOrDefaultAsync(s => s.SupplierId == id, cancellationToken);
    }

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(s => s.SupplierCode == code, cancellationToken);
    }

    public async Task<IReadOnlyList<Supplier>> GetActiveSuppliersByTypeAsync(SupplierType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(s => s.Status == SupplierStatus.Active && s.Type == type).OrderBy(s => s.CompanyName).ToListAsync(cancellationToken);
    }
}

public class StockLevelRepository : GenericRepository<StockLevel>, IStockLevelRepository
{
    public StockLevelRepository(StockFlowDbContext context) : base(context) { }

    public async Task<StockLevel?> GetByProductAndLocationAsync(int productId, int warehouseId, int? binId = null, int? batchId = null, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseId == warehouseId && s.BinId == binId && s.BatchId == batchId, cancellationToken);
    }

    public async Task<IReadOnlyList<StockLevel>> GetByWarehouseAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(s => s.WarehouseId == warehouseId).Include(s => s.Product).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockLevel>> GetByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(s => s.ProductId == productId).Include(s => s.Warehouse).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockLevel>> GetLowStockItemsAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(s => s.WarehouseId == warehouseId && (s.Status == StockStatus.Low || s.Status == StockStatus.Critical || s.Status == StockStatus.OutOfStock))
            .Include(s => s.Product).ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalQuantityAsync(int productId, int? warehouseId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(s => s.ProductId == productId);
        if (warehouseId.HasValue)
            query = query.Where(s => s.WarehouseId == warehouseId.Value);
        return await query.SumAsync(s => s.QuantityOnHand, cancellationToken);
    }
}

public class StockMovementRepository : GenericRepository<StockMovement>, IStockMovementRepository
{
    public StockMovementRepository(StockFlowDbContext context) : base(context) { }

    public async Task<IReadOnlyList<StockMovement>> GetByProductAsync(int productId, DateTime? fromDate = null, DateTime? toDate = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(m => m.ProductId == productId);
        if (fromDate.HasValue) query = query.Where(m => m.MovementDate >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(m => m.MovementDate <= toDate.Value);
        return await query.OrderByDescending(m => m.MovementDate).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StockMovement>> GetByReferenceAsync(ReferenceType referenceType, int referenceId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(m => m.ReferenceType == referenceType && m.ReferenceId == referenceId).ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateMovementNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        var count = await _dbSet.CountAsync(m => m.MovementDate.Date == today, cancellationToken);
        return $"MOV-{today:yyyyMMdd}-{(count + 1):D6}";
    }
}

public class PurchaseOrderRepository : GenericRepository<PurchaseOrder>, IPurchaseOrderRepository
{
    public PurchaseOrderRepository(StockFlowDbContext context) : base(context) { }

    public async Task<PurchaseOrder?> GetWithLinesAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Include(p => p.Lines).ThenInclude(l => l.Product).Include(p => p.Supplier).Include(p => p.Warehouse).FirstOrDefaultAsync(p => p.PurchaseOrderId == id, cancellationToken);
    }

    public async Task<string> GeneratePONumberAsync(CancellationToken cancellationToken = default)
    {
        var year = DateTime.Now.Year;
        var count = await _dbSet.CountAsync(p => p.OrderDate.Year == year, cancellationToken);
        return $"PO-{year}-{(count + 1):D5}";
    }

    public async Task<IReadOnlyList<PurchaseOrder>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(p => p.SupplierId == supplierId).Include(p => p.Supplier).OrderByDescending(p => p.OrderDate).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PurchaseOrder>> GetPendingReceiptsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(p => p.Status == PurchaseOrderStatus.SentToSupplier || p.Status == PurchaseOrderStatus.PartiallyReceived).Include(p => p.Supplier).ToListAsync(cancellationToken);
    }
}

public class TransferRepository : GenericRepository<Transfer>, ITransferRepository
{
    public TransferRepository(StockFlowDbContext context) : base(context) { }

    public async Task<Transfer?> GetWithLinesAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Include(t => t.Lines).ThenInclude(l => l.Product).Include(t => t.FromWarehouse).Include(t => t.ToWarehouse).FirstOrDefaultAsync(t => t.TransferId == id, cancellationToken);
    }

    public async Task<string> GenerateTransferNumberAsync(CancellationToken cancellationToken = default)
    {
        var year = DateTime.Now.Year;
        var count = await _dbSet.CountAsync(t => t.RequestedDate.Year == year, cancellationToken);
        return $"TRF-{year}-{(count + 1):D5}";
    }

    public async Task<IReadOnlyList<Transfer>> GetPendingTransfersAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(t => (t.FromWarehouseId == warehouseId || t.ToWarehouseId == warehouseId) && t.Status != TransferStatus.Completed && t.Status != TransferStatus.Cancelled).ToListAsync(cancellationToken);
    }
}

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(StockFlowDbContext context) : base(context) { }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<bool> ExistsByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.Username == username, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.Email == email, cancellationToken);
    }
}
