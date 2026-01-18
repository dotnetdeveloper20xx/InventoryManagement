using AutoMapper;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Inventory;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Repositories.Interfaces;

namespace StockFlowPro.Application.Services.Implementations;

public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public InventoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<StockLevelDto?> GetStockLevelAsync(int productId, int warehouseId, CancellationToken cancellationToken = default)
    {
        var stockLevel = await _unitOfWork.StockLevels.GetByProductAndLocationAsync(productId, warehouseId, null, null, cancellationToken);
        return stockLevel == null ? null : _mapper.Map<StockLevelDto>(stockLevel);
    }

    public async Task<PaginatedResponse<StockLevelDto>> GetStockLevelsAsync(StockLevelFilterDto filter, CancellationToken cancellationToken = default)
    {
        var allStockLevels = await _unitOfWork.StockLevels.GetAllAsync(cancellationToken);
        var query = allStockLevels.AsQueryable();

        if (filter.WarehouseId.HasValue)
        {
            query = query.Where(s => s.WarehouseId == filter.WarehouseId.Value);
        }

        if (filter.ProductId.HasValue)
        {
            query = query.Where(s => s.ProductId == filter.ProductId.Value);
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(s => s.Product != null && s.Product.CategoryId == filter.CategoryId.Value);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(s => s.Status == filter.Status.Value);
        }

        if (filter.LowStockOnly == true)
        {
            query = query.Where(s => s.Product != null && s.QuantityOnHand <= s.Product.ReorderPoint);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();
            query = query.Where(s => s.Product != null &&
                (s.Product.Name.ToLower().Contains(search) || s.Product.SKU.ToLower().Contains(search)));
        }

        var totalCount = query.Count();
        var items = query
            .OrderBy(s => s.Product != null ? s.Product.Name : string.Empty)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        return new PaginatedResponse<StockLevelDto>(
            _mapper.Map<List<StockLevelDto>>(items),
            totalCount,
            filter.PageNumber,
            filter.PageSize
        );
    }

    public async Task<IReadOnlyList<StockLevelSummaryDto>> GetStockSummaryByProductAsync(int productId, CancellationToken cancellationToken = default)
    {
        var stockLevels = await _unitOfWork.StockLevels.GetByProductAsync(productId, cancellationToken);
        var product = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken);

        if (product == null)
        {
            return new List<StockLevelSummaryDto>();
        }

        var totalOnHand = stockLevels.Sum(s => s.QuantityOnHand);
        var totalAvailable = stockLevels.Sum(s => s.QuantityAvailable);
        var totalValue = stockLevels.Sum(s => s.QuantityOnHand * s.UnitCost);

        return new List<StockLevelSummaryDto>
        {
            new StockLevelSummaryDto
            {
                ProductId = product.ProductId,
                ProductSKU = product.SKU,
                ProductName = product.Name,
                TotalQuantityOnHand = totalOnHand,
                TotalQuantityAvailable = totalAvailable,
                TotalValue = totalValue,
                ReorderPoint = product.ReorderPoint,
                OverallStatus = totalOnHand <= 0 ? StockStatus.OutOfStock :
                               totalOnHand <= product.ReorderPoint ? StockStatus.Low :
                               StockStatus.OK,
                WarehouseCount = stockLevels.Count
            }
        };
    }

    public async Task<IReadOnlyList<StockLevelDto>> GetLowStockAsync(int warehouseId, CancellationToken cancellationToken = default)
    {
        var lowStockItems = await _unitOfWork.StockLevels.GetLowStockItemsAsync(warehouseId, cancellationToken);
        return _mapper.Map<IReadOnlyList<StockLevelDto>>(lowStockItems);
    }

    public async Task<IReadOnlyList<StockMovementDto>> GetMovementHistoryAsync(int productId, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var movements = await _unitOfWork.StockMovements.GetByProductAsync(productId, from, to, cancellationToken);
        return _mapper.Map<IReadOnlyList<StockMovementDto>>(movements);
    }

    public async Task AdjustStockAsync(CreateStockAdjustmentDto dto, CancellationToken cancellationToken = default)
    {
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(dto.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            throw new NotFoundException("Warehouse", dto.WarehouseId);
        }

        foreach (var lineDto in dto.Lines)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(lineDto.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException("Product", lineDto.ProductId);
            }

            var stockLevel = await _unitOfWork.StockLevels.GetByProductAndLocationAsync(
                lineDto.ProductId, dto.WarehouseId, lineDto.BinId, lineDto.BatchId, cancellationToken);

            decimal previousQuantity = stockLevel?.QuantityOnHand ?? 0;
            decimal adjustmentQuantity = lineDto.NewQuantity - previousQuantity;

            if (stockLevel == null)
            {
                stockLevel = new StockLevel
                {
                    ProductId = lineDto.ProductId,
                    WarehouseId = dto.WarehouseId,
                    BinId = lineDto.BinId,
                    BatchId = lineDto.BatchId,
                    QuantityOnHand = lineDto.NewQuantity,
                    QuantityReserved = 0,
                    QuantityAvailable = lineDto.NewQuantity,
                    UnitCost = product.StandardCost,
                    Status = lineDto.NewQuantity > 0 ? StockStatus.OK : StockStatus.OutOfStock,
                    LastMovementDate = DateTime.UtcNow
                };
                await _unitOfWork.StockLevels.AddAsync(stockLevel, cancellationToken);
            }
            else
            {
                stockLevel.QuantityOnHand = lineDto.NewQuantity;
                stockLevel.QuantityAvailable = stockLevel.QuantityOnHand - stockLevel.QuantityReserved;
                stockLevel.Status = stockLevel.QuantityOnHand > 0 ? StockStatus.OK : StockStatus.OutOfStock;
                stockLevel.LastMovementDate = DateTime.UtcNow;
                _unitOfWork.StockLevels.Update(stockLevel);
            }

            // Record movement
            var movementNumber = await _unitOfWork.StockMovements.GenerateMovementNumberAsync(cancellationToken);
            var movement = new StockMovement
            {
                MovementNumber = movementNumber,
                MovementType = adjustmentQuantity > 0 ? MovementType.PositiveAdjustment : MovementType.NegativeAdjustment,
                MovementDate = DateTime.UtcNow,
                ProductId = lineDto.ProductId,
                BatchId = lineDto.BatchId,
                ToWarehouseId = adjustmentQuantity > 0 ? dto.WarehouseId : null,
                ToBinId = adjustmentQuantity > 0 ? lineDto.BinId : null,
                FromWarehouseId = adjustmentQuantity < 0 ? dto.WarehouseId : null,
                FromBinId = adjustmentQuantity < 0 ? lineDto.BinId : null,
                Quantity = Math.Abs(adjustmentQuantity),
                UOMId = lineDto.UOMId,
                QuantityInBaseUOM = Math.Abs(adjustmentQuantity),
                UnitCost = product.StandardCost,
                TotalCost = Math.Abs(adjustmentQuantity) * product.StandardCost,
                RunningBalance = lineDto.NewQuantity,
                ReasonCodeId = dto.ReasonCodeId,
                ReferenceNumber = dto.Reference,
                Notes = lineDto.Notes ?? dto.Notes,
                Status = MovementStatus.Completed,
                CreatedDate = DateTime.UtcNow,
                CreatedByUserId = 1 // TODO: Get from current user
            };

            await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalQuantityAsync(int productId, int? warehouseId = null, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.StockLevels.GetTotalQuantityAsync(productId, warehouseId, cancellationToken);
    }
}
