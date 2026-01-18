using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.StockCount;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class StockCountService : IStockCountService
{
    private readonly StockFlowDbContext _context;

    public StockCountService(StockFlowDbContext context)
    {
        _context = context;
    }

    public async Task<StockCountDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var count = await _context.StockCounts
            .Include(c => c.Warehouse)
            .Include(c => c.Lines).ThenInclude(l => l.Product)
            .Include(c => c.Lines).ThenInclude(l => l.Bin)
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.StockCountId == id, ct);

        if (count == null) return null;

        return MapToDto(count);
    }

    public async Task<PaginatedResponse<StockCountListDto>> GetPagedAsync(int pageNumber, int pageSize, int? warehouseId, string? status, CancellationToken ct = default)
    {
        var query = _context.StockCounts
            .Include(c => c.Warehouse)
            .Include(c => c.Lines)
            .Include(c => c.CreatedBy)
            .AsQueryable();

        if (warehouseId.HasValue)
            query = query.Where(c => c.WarehouseId == warehouseId.Value);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<StockCountStatus>(status, out var statusEnum))
            query = query.Where(c => c.Status == statusEnum);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.ScheduledDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new StockCountListDto
            {
                StockCountId = c.StockCountId,
                CountNumber = c.CountNumber,
                CountType = c.Type.ToString(),
                WarehouseName = c.Warehouse.Name,
                CountDate = c.ScheduledDate,
                Status = c.Status.ToString(),
                TotalLines = c.Lines.Count,
                CountedLines = c.Lines.Count(l => l.FinalCountQty.HasValue),
                VarianceLines = c.Lines.Count(l => l.Variance != 0),
                TotalVarianceValue = c.Lines.Sum(l => l.VarianceValue),
                CreatedBy = c.CreatedBy != null ? c.CreatedBy.Username : null
            })
            .ToListAsync(ct);

        return new PaginatedResponse<StockCountListDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<StockCountDto> CreateAsync(CreateStockCountDto dto, CancellationToken ct = default)
    {
        var countNumber = await GenerateCountNumberAsync(ct);

        var count = new Domain.Entities.StockCount
        {
            CountNumber = countNumber,
            Type = Enum.TryParse<StockCountType>(dto.CountType, out var type) ? type : StockCountType.Full,
            WarehouseId = dto.WarehouseId,
            ScheduledDate = dto.CountDate,
            BlindCount = dto.BlindCount,
            Status = StockCountStatus.Scheduled,
            Notes = dto.Notes,
            CreatedDate = DateTime.UtcNow
        };

        // Get products to count
        var stockLevelsQuery = _context.StockLevels
            .Include(s => s.Product)
            .Where(s => s.WarehouseId == dto.WarehouseId);

        if (dto.CategoryId.HasValue)
            stockLevelsQuery = stockLevelsQuery.Where(s => s.Product.CategoryId == dto.CategoryId.Value);
        if (dto.ProductIds != null && dto.ProductIds.Any())
            stockLevelsQuery = stockLevelsQuery.Where(s => dto.ProductIds.Contains(s.ProductId));

        var stockLevels = await stockLevelsQuery.ToListAsync(ct);

        foreach (var sl in stockLevels)
        {
            count.Lines.Add(new StockCountLine
            {
                ProductId = sl.ProductId,
                BinId = sl.BinId,
                SystemQty = sl.QuantityOnHand,
                Status = StockCountLineStatus.Pending,
                UOMId = 1 // Default UOM
            });
        }

        _context.StockCounts.Add(count);
        await _context.SaveChangesAsync(ct);

        return (await GetByIdAsync(count.StockCountId, ct))!;
    }

    public async Task UpdateLineAsync(UpdateStockCountLineDto dto, CancellationToken ct = default)
    {
        var line = await _context.StockCountLines
            .Include(l => l.StockCount)
            .FirstOrDefaultAsync(l => l.StockCountLineId == dto.StockCountLineId, ct);

        if (line == null)
            throw new NotFoundException("StockCountLine", dto.StockCountLineId);

        if (line.StockCount.Status == StockCountStatus.Posted)
            throw new BusinessRuleException("COUNT_COMPLETED", "Cannot update lines on a completed count.");

        if (dto.IsSecondCount)
        {
            line.CountQty2 = dto.CountQuantity;
            // If both counts match, set final
            if (line.CountQty1 == dto.CountQuantity)
            {
                line.FinalCountQty = dto.CountQuantity;
                line.RecountRequired = false;
            }
            else
            {
                line.RecountRequired = true;
            }
        }
        else
        {
            line.CountQty1 = dto.CountQuantity;
            line.FinalCountQty = dto.CountQuantity;
        }

        line.Variance = (line.FinalCountQty ?? 0) - line.SystemQty;
        line.VariancePercent = line.SystemQty != 0 ? line.Variance / line.SystemQty * 100 : 0;

        // Get product cost for variance value
        var product = await _context.Products.FindAsync(new object[] { line.ProductId }, ct);
        line.VarianceValue = line.Variance * (product?.AverageCost ?? 0);

        line.Status = line.FinalCountQty.HasValue ? StockCountLineStatus.Counted : StockCountLineStatus.Pending;
        line.Notes = dto.Notes;

        // Update count status
        line.StockCount.Status = StockCountStatus.InProgress;
        line.StockCount.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task<StockCountSummaryDto> GetSummaryAsync(int id, CancellationToken ct = default)
    {
        var count = await _context.StockCounts
            .Include(c => c.Lines)
            .FirstOrDefaultAsync(c => c.StockCountId == id, ct);

        if (count == null)
            throw new NotFoundException("StockCount", id);

        var lines = count.Lines.ToList();

        return new StockCountSummaryDto
        {
            StockCountId = count.StockCountId,
            CountNumber = count.CountNumber,
            TotalLines = lines.Count,
            CountedLines = lines.Count(l => l.FinalCountQty.HasValue),
            MatchedLines = lines.Count(l => l.Variance == 0),
            PositiveVarianceLines = lines.Count(l => l.Variance > 0),
            NegativeVarianceLines = lines.Count(l => l.Variance < 0),
            TotalPositiveVariance = lines.Where(l => l.Variance > 0).Sum(l => l.Variance),
            TotalNegativeVariance = lines.Where(l => l.Variance < 0).Sum(l => l.Variance),
            NetVariance = lines.Sum(l => l.Variance),
            TotalPositiveVarianceValue = lines.Where(l => l.VarianceValue > 0).Sum(l => l.VarianceValue),
            TotalNegativeVarianceValue = lines.Where(l => l.VarianceValue < 0).Sum(l => l.VarianceValue),
            NetVarianceValue = lines.Sum(l => l.VarianceValue)
        };
    }

    public async Task PostAsync(PostStockCountDto dto, CancellationToken ct = default)
    {
        var count = await _context.StockCounts
            .Include(c => c.Lines)
            .FirstOrDefaultAsync(c => c.StockCountId == dto.StockCountId, ct);

        if (count == null)
            throw new NotFoundException("StockCount", dto.StockCountId);

        if (count.Status == StockCountStatus.Posted)
            throw new BusinessRuleException("ALREADY_POSTED", "This count has already been posted.");

        var uncountedLines = count.Lines.Count(l => !l.FinalCountQty.HasValue);
        if (uncountedLines > 0)
            throw new BusinessRuleException("INCOMPLETE_COUNT", $"{uncountedLines} lines have not been counted.");

        // Create adjustments for variances
        foreach (var line in count.Lines.Where(l => l.Variance != 0))
        {
            var stockLevel = await _context.StockLevels
                .FirstOrDefaultAsync(s => s.ProductId == line.ProductId && s.WarehouseId == count.WarehouseId, ct);

            if (stockLevel != null)
            {
                stockLevel.QuantityOnHand = line.FinalCountQty ?? 0;
                stockLevel.QuantityAvailable = (line.FinalCountQty ?? 0) - stockLevel.QuantityReserved;
                stockLevel.LastCountDate = DateTime.UtcNow;
                stockLevel.LastMovementDate = DateTime.UtcNow;
            }

            // Create movement record
            var movement = new StockMovement
            {
                MovementNumber = $"MOV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                MovementType = line.Variance > 0 ? MovementType.PositiveAdjustment : MovementType.NegativeAdjustment,
                MovementDate = DateTime.UtcNow,
                ProductId = line.ProductId,
                ToWarehouseId = line.Variance > 0 ? count.WarehouseId : null,
                FromWarehouseId = line.Variance < 0 ? count.WarehouseId : null,
                ToBinId = line.Variance > 0 ? line.BinId : null,
                FromBinId = line.Variance < 0 ? line.BinId : null,
                Quantity = Math.Abs(line.Variance),
                UOMId = line.UOMId,
                QuantityInBaseUOM = Math.Abs(line.Variance),
                UnitCost = Math.Abs(line.VarianceValue) / Math.Max(Math.Abs(line.Variance), 1),
                TotalCost = Math.Abs(line.VarianceValue),
                ReferenceType = ReferenceType.StockCount,
                ReferenceId = count.StockCountId,
                ReferenceNumber = count.CountNumber,
                ReasonCodeId = dto.ReasonCodeId,
                Notes = $"Stock count adjustment: {dto.Notes}",
                Status = MovementStatus.Completed,
                CreatedDate = DateTime.UtcNow
            };
            _context.StockMovements.Add(movement);

            line.Status = StockCountLineStatus.Adjusted;
        }

        count.Status = StockCountStatus.Posted;
        count.CompletedDate = DateTime.UtcNow;
        count.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task CancelAsync(int id, CancellationToken ct = default)
    {
        var count = await _context.StockCounts.FindAsync(new object[] { id }, ct);

        if (count == null)
            throw new NotFoundException("StockCount", id);

        if (count.Status == StockCountStatus.Posted)
            throw new BusinessRuleException("CANNOT_CANCEL", "Cannot cancel a completed count.");

        count.Status = StockCountStatus.Cancelled;
        count.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    private StockCountDto MapToDto(Domain.Entities.StockCount count)
    {
        return new StockCountDto
        {
            StockCountId = count.StockCountId,
            CountNumber = count.CountNumber,
            CountType = count.Type.ToString(),
            WarehouseId = count.WarehouseId,
            WarehouseName = count.Warehouse?.Name ?? "",
            CountDate = count.ScheduledDate,
            Status = count.Status.ToString(),
            BlindCount = count.BlindCount,
            Notes = count.Notes,
            TotalLines = count.Lines.Count,
            CountedLines = count.Lines.Count(l => l.FinalCountQty.HasValue),
            VarianceLines = count.Lines.Count(l => l.Variance != 0),
            TotalVarianceValue = count.Lines.Sum(l => l.VarianceValue),
            Lines = count.Lines.Select(l => new StockCountLineDto
            {
                StockCountLineId = l.StockCountLineId,
                ProductId = l.ProductId,
                ProductSKU = l.Product?.SKU ?? "",
                ProductName = l.Product?.Name ?? "",
                BinId = l.BinId,
                BinCode = l.Bin?.BinCode,
                BatchNumber = l.Batch?.BatchNumber,
                SystemQuantity = l.SystemQty,
                CountQuantity1 = l.CountQty1,
                CountQuantity2 = l.CountQty2,
                FinalCountQuantity = l.FinalCountQty,
                Variance = l.Variance,
                VariancePercent = l.VariancePercent,
                VarianceValue = l.VarianceValue,
                RecountRequired = l.RecountRequired,
                Notes = l.Notes,
                Status = l.Status.ToString()
            }).ToList(),
            CreatedBy = count.CreatedBy?.Username,
            CreatedDate = count.CreatedDate,
            CompletedBy = null,
            CompletedDate = count.CompletedDate
        };
    }

    private async Task<string> GenerateCountNumberAsync(CancellationToken ct)
    {
        var year = DateTime.UtcNow.Year;
        var last = await _context.StockCounts
            .Where(c => c.CountNumber.StartsWith($"CNT-{year}"))
            .OrderByDescending(c => c.CountNumber)
            .FirstOrDefaultAsync(ct);

        var nextNumber = 1;
        if (last != null)
        {
            var parts = last.CountNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"CNT-{year}-{nextNumber:D5}";
    }
}
