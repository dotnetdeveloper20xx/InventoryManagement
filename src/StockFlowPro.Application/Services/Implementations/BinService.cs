using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Zones;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class BinService : IBinService
{
    private readonly StockFlowDbContext _context;

    public BinService(StockFlowDbContext context)
    {
        _context = context;
    }

    public async Task<BinDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var bin = await _context.Bins
            .Include(b => b.Zone).ThenInclude(z => z.Warehouse)
            .Include(b => b.StockLevels)
            .FirstOrDefaultAsync(b => b.BinId == id, ct);

        if (bin == null) return null;

        return MapToDto(bin);
    }

    public async Task<IReadOnlyList<BinListDto>> GetByZoneAsync(int zoneId, CancellationToken ct = default)
    {
        var bins = await _context.Bins
            .Include(b => b.Zone).ThenInclude(z => z.Warehouse)
            .Include(b => b.StockLevels)
            .Where(b => b.ZoneId == zoneId)
            .OrderBy(b => b.BinCode)
            .ToListAsync(ct);

        return bins.Select(MapToListDto).ToList();
    }

    public async Task<IReadOnlyList<BinListDto>> GetByWarehouseAsync(int warehouseId, CancellationToken ct = default)
    {
        var bins = await _context.Bins
            .Include(b => b.Zone).ThenInclude(z => z.Warehouse)
            .Include(b => b.StockLevels)
            .Where(b => b.Zone.WarehouseId == warehouseId)
            .OrderBy(b => b.Zone.ZoneCode)
            .ThenBy(b => b.BinCode)
            .ToListAsync(ct);

        return bins.Select(MapToListDto).ToList();
    }

    public async Task<BinContentsDto> GetContentsAsync(int id, CancellationToken ct = default)
    {
        var bin = await _context.Bins
            .Include(b => b.StockLevels).ThenInclude(s => s.Product)
            .FirstOrDefaultAsync(b => b.BinId == id, ct);

        if (bin == null)
            throw new NotFoundException("Bin", id);

        var contents = bin.StockLevels
            .Where(s => s.QuantityOnHand > 0)
            .Select(s => new BinContentItemDto
            {
                ProductId = s.ProductId,
                SKU = s.Product?.SKU ?? "",
                ProductName = s.Product?.Name ?? "",
                BatchNumber = null,
                ExpiryDate = null,
                Quantity = s.QuantityOnHand,
                UOM = "EA",
                LastMovementDate = s.LastMovementDate
            }).ToList();

        return new BinContentsDto
        {
            BinId = bin.BinId,
            BinCode = bin.BinCode,
            FullLocationCode = GetFullLocationCode(bin),
            Items = contents
        };
    }

    public async Task<BinDto> CreateAsync(CreateBinDto dto, CancellationToken ct = default)
    {
        var zone = await _context.Zones
            .Include(z => z.Warehouse)
            .FirstOrDefaultAsync(z => z.ZoneId == dto.ZoneId, ct);

        if (zone == null)
            throw new NotFoundException("Zone", dto.ZoneId);

        var existingBin = await _context.Bins
            .FirstOrDefaultAsync(b => b.BinCode == dto.BinCode && b.ZoneId == dto.ZoneId, ct);

        if (existingBin != null)
            throw new BusinessRuleException("DUPLICATE_CODE", "A bin with this code already exists in the zone.");

        var bin = new Bin
        {
            BinCode = dto.BinCode,
            ZoneId = dto.ZoneId,
            Type = Enum.TryParse<BinType>(dto.BinType, out var type) ? type : BinType.Storage,
            Aisle = dto.Aisle,
            Rack = dto.Rack,
            Level = dto.Level,
            Position = dto.Position,
            MaxWeight = dto.MaxWeight ?? 0,
            MaxVolume = dto.MaxVolume ?? 0,
            Status = BinStatus.Available,
            IsActive = dto.IsActive,
            CreatedDate = DateTime.UtcNow
        };

        _context.Bins.Add(bin);

        zone.TotalBins++;
        zone.AvailableBins++;

        await _context.SaveChangesAsync(ct);

        return (await GetByIdAsync(bin.BinId, ct))!;
    }

    public async Task<IReadOnlyList<BinDto>> BulkCreateAsync(BulkCreateBinsDto dto, CancellationToken ct = default)
    {
        var zone = await _context.Zones
            .Include(z => z.Warehouse)
            .FirstOrDefaultAsync(z => z.ZoneId == dto.ZoneId, ct);

        if (zone == null)
            throw new NotFoundException("Zone", dto.ZoneId);

        var createdBins = new List<Bin>();

        for (int aisle = dto.AisleStart; aisle <= dto.AisleEnd; aisle++)
        {
            for (int rack = dto.RackStart; rack <= dto.RackEnd; rack++)
            {
                for (int level = dto.LevelStart; level <= dto.LevelEnd; level++)
                {
                    for (int pos = 1; pos <= dto.PositionsPerLevel; pos++)
                    {
                        var aisleCode = $"{dto.AislePrefix}{aisle:D2}";
                        var rackCode = $"{rack:D2}";
                        var levelCode = $"{level:D2}";
                        var posCode = $"{pos:D2}";
                        var binCode = $"{aisleCode}-{rackCode}-{levelCode}-{posCode}";

                        var existingBin = await _context.Bins
                            .FirstOrDefaultAsync(b => b.BinCode == binCode && b.ZoneId == dto.ZoneId, ct);

                        if (existingBin != null) continue;

                        var bin = new Bin
                        {
                            BinCode = binCode,
                            ZoneId = dto.ZoneId,
                            Type = Enum.TryParse<BinType>(dto.BinType, out var type) ? type : BinType.Storage,
                            Aisle = aisleCode,
                            Rack = rackCode,
                            Level = levelCode,
                            Position = posCode,
                            MaxWeight = dto.MaxWeight ?? 0,
                            MaxVolume = dto.MaxVolume ?? 0,
                            Status = BinStatus.Available,
                            IsActive = true,
                            CreatedDate = DateTime.UtcNow
                        };

                        _context.Bins.Add(bin);
                        createdBins.Add(bin);

                        zone.TotalBins++;
                        zone.AvailableBins++;
                    }
                }
            }
        }

        await _context.SaveChangesAsync(ct);

        var result = new List<BinDto>();
        foreach (var bin in createdBins)
        {
            var fullBin = await GetByIdAsync(bin.BinId, ct);
            if (fullBin != null) result.Add(fullBin);
        }

        return result;
    }

    public async Task<BinDto> UpdateAsync(UpdateBinDto dto, CancellationToken ct = default)
    {
        var bin = await _context.Bins
            .Include(b => b.Zone)
            .FirstOrDefaultAsync(b => b.BinId == dto.BinId, ct);

        if (bin == null)
            throw new NotFoundException("Bin", dto.BinId);

        var duplicateBin = await _context.Bins
            .FirstOrDefaultAsync(b => b.BinCode == dto.BinCode && b.ZoneId == bin.ZoneId && b.BinId != dto.BinId, ct);

        if (duplicateBin != null)
            throw new BusinessRuleException("DUPLICATE_CODE", "A bin with this code already exists in the zone.");

        bin.BinCode = dto.BinCode;
        bin.Type = Enum.TryParse<BinType>(dto.BinType, out var type) ? type : bin.Type;
        bin.Aisle = dto.Aisle;
        bin.Rack = dto.Rack;
        bin.Level = dto.Level;
        bin.Position = dto.Position;
        bin.MaxWeight = dto.MaxWeight ?? bin.MaxWeight;
        bin.MaxVolume = dto.MaxVolume ?? bin.MaxVolume;
        bin.Status = Enum.TryParse<BinStatus>(dto.Status, out var status) ? status : bin.Status;
        bin.IsActive = dto.IsActive;
        bin.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return (await GetByIdAsync(bin.BinId, ct))!;
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var bin = await _context.Bins
            .Include(b => b.Zone)
            .Include(b => b.StockLevels)
            .FirstOrDefaultAsync(b => b.BinId == id, ct);

        if (bin == null)
            throw new NotFoundException("Bin", id);

        if (bin.StockLevels.Any(s => s.QuantityOnHand > 0))
            throw new BusinessRuleException("HAS_STOCK", "Cannot delete a bin that contains stock.");

        var zone = bin.Zone;
        zone.TotalBins--;
        if (bin.Status == BinStatus.Available)
            zone.AvailableBins--;

        _context.Bins.Remove(bin);
        await _context.SaveChangesAsync(ct);
    }

    private BinDto MapToDto(Bin bin)
    {
        return new BinDto
        {
            BinId = bin.BinId,
            BinCode = bin.BinCode,
            BinName = bin.BinCode,
            ZoneId = bin.ZoneId,
            ZoneName = bin.Zone?.Name ?? "",
            WarehouseId = bin.Zone?.WarehouseId ?? 0,
            WarehouseName = bin.Zone?.Warehouse?.Name ?? "",
            BinType = bin.Type.ToString(),
            Aisle = bin.Aisle,
            Rack = bin.Rack,
            Level = bin.Level,
            Position = bin.Position,
            FullLocationCode = GetFullLocationCode(bin),
            MaxWeight = bin.MaxWeight,
            MaxVolume = bin.MaxVolume,
            CurrentWeight = bin.CurrentWeight,
            CurrentVolume = bin.CurrentVolume,
            Status = bin.Status.ToString(),
            ProductCount = bin.StockLevels?.Count(s => s.QuantityOnHand > 0) ?? 0,
            TotalQuantity = bin.StockLevels?.Sum(s => s.QuantityOnHand) ?? 0,
            IsActive = bin.IsActive,
            CreatedDate = bin.CreatedDate
        };
    }

    private BinListDto MapToListDto(Bin bin)
    {
        return new BinListDto
        {
            BinId = bin.BinId,
            BinCode = bin.BinCode,
            ZoneName = bin.Zone?.Name ?? "",
            WarehouseName = bin.Zone?.Warehouse?.Name ?? "",
            BinType = bin.Type.ToString(),
            FullLocationCode = GetFullLocationCode(bin),
            Status = bin.Status.ToString(),
            ProductCount = bin.StockLevels?.Count(s => s.QuantityOnHand > 0) ?? 0,
            TotalQuantity = bin.StockLevels?.Sum(s => s.QuantityOnHand) ?? 0,
            IsActive = bin.IsActive
        };
    }

    private static string GetFullLocationCode(Bin bin)
    {
        var parts = new List<string>();
        if (!string.IsNullOrEmpty(bin.Aisle)) parts.Add(bin.Aisle);
        if (!string.IsNullOrEmpty(bin.Rack)) parts.Add(bin.Rack);
        if (!string.IsNullOrEmpty(bin.Level)) parts.Add(bin.Level);
        if (!string.IsNullOrEmpty(bin.Position)) parts.Add(bin.Position);
        return parts.Count > 0 ? string.Join("-", parts) : bin.BinCode;
    }
}
