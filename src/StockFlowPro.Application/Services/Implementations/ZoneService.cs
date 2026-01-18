using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Zones;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class ZoneService : IZoneService
{
    private readonly StockFlowDbContext _context;

    public ZoneService(StockFlowDbContext context)
    {
        _context = context;
    }

    public async Task<ZoneDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var zone = await _context.Zones
            .Include(z => z.Warehouse)
            .Include(z => z.Bins)
            .FirstOrDefaultAsync(z => z.ZoneId == id, ct);

        if (zone == null) return null;

        return MapToDto(zone);
    }

    public async Task<IReadOnlyList<ZoneListDto>> GetByWarehouseAsync(int warehouseId, CancellationToken ct = default)
    {
        var zones = await _context.Zones
            .Include(z => z.Warehouse)
            .Include(z => z.Bins)
            .Where(z => z.WarehouseId == warehouseId)
            .OrderBy(z => z.DisplayOrder)
            .ThenBy(z => z.ZoneCode)
            .ToListAsync(ct);

        return zones.Select(z => new ZoneListDto
        {
            ZoneId = z.ZoneId,
            ZoneCode = z.ZoneCode,
            ZoneName = z.Name,
            WarehouseName = z.Warehouse?.Name ?? "",
            ZoneType = z.Type.ToString(),
            BinCount = z.Bins.Count,
            UtilizationPercent = z.TotalBins > 0 ? (decimal)(z.TotalBins - z.AvailableBins) / z.TotalBins * 100 : 0,
            IsActive = z.IsActive
        }).ToList();
    }

    public async Task<ZoneDto> CreateAsync(CreateZoneDto dto, CancellationToken ct = default)
    {
        var existingZone = await _context.Zones
            .FirstOrDefaultAsync(z => z.ZoneCode == dto.ZoneCode && z.WarehouseId == dto.WarehouseId, ct);

        if (existingZone != null)
            throw new BusinessRuleException("DUPLICATE_CODE", "A zone with this code already exists in the warehouse.");

        var zone = new Zone
        {
            ZoneCode = dto.ZoneCode,
            Name = dto.ZoneName,
            WarehouseId = dto.WarehouseId,
            Type = Enum.TryParse<ZoneType>(dto.ZoneType, out var type) ? type : ZoneType.Storage,
            MinTemperature = dto.MinTemperature,
            MaxTemperature = dto.MaxTemperature,
            MaxHumidity = dto.MaxHumidity,
            AreaSqFt = dto.Capacity ?? 0,
            IsActive = dto.IsActive,
            CreatedDate = DateTime.UtcNow
        };

        _context.Zones.Add(zone);
        await _context.SaveChangesAsync(ct);

        return (await GetByIdAsync(zone.ZoneId, ct))!;
    }

    public async Task<ZoneDto> UpdateAsync(UpdateZoneDto dto, CancellationToken ct = default)
    {
        var zone = await _context.Zones.FindAsync(new object[] { dto.ZoneId }, ct);

        if (zone == null)
            throw new NotFoundException("Zone", dto.ZoneId);

        var duplicateZone = await _context.Zones
            .FirstOrDefaultAsync(z => z.ZoneCode == dto.ZoneCode && z.WarehouseId == zone.WarehouseId && z.ZoneId != dto.ZoneId, ct);

        if (duplicateZone != null)
            throw new BusinessRuleException("DUPLICATE_CODE", "A zone with this code already exists in the warehouse.");

        zone.ZoneCode = dto.ZoneCode;
        zone.Name = dto.ZoneName;
        zone.Type = Enum.TryParse<ZoneType>(dto.ZoneType, out var type) ? type : ZoneType.Storage;
        zone.MinTemperature = dto.MinTemperature;
        zone.MaxTemperature = dto.MaxTemperature;
        zone.MaxHumidity = dto.MaxHumidity;
        zone.AreaSqFt = dto.Capacity ?? zone.AreaSqFt;
        zone.IsActive = dto.IsActive;
        zone.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return (await GetByIdAsync(zone.ZoneId, ct))!;
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var zone = await _context.Zones
            .Include(z => z.Bins)
            .FirstOrDefaultAsync(z => z.ZoneId == id, ct);

        if (zone == null)
            throw new NotFoundException("Zone", id);

        if (zone.Bins.Any())
            throw new BusinessRuleException("HAS_BINS", "Cannot delete a zone that contains bins. Remove all bins first.");

        _context.Zones.Remove(zone);
        await _context.SaveChangesAsync(ct);
    }

    private ZoneDto MapToDto(Zone zone)
    {
        var usedBins = zone.TotalBins - zone.AvailableBins;
        return new ZoneDto
        {
            ZoneId = zone.ZoneId,
            ZoneCode = zone.ZoneCode,
            ZoneName = zone.Name,
            WarehouseId = zone.WarehouseId,
            WarehouseName = zone.Warehouse?.Name ?? "",
            ZoneType = zone.Type.ToString(),
            Description = null,
            MinTemperature = zone.MinTemperature,
            MaxTemperature = zone.MaxTemperature,
            MaxHumidity = zone.MaxHumidity,
            Capacity = zone.AreaSqFt,
            UsedCapacity = usedBins,
            UtilizationPercent = zone.TotalBins > 0 ? (decimal)usedBins / zone.TotalBins * 100 : 0,
            BinCount = zone.Bins.Count,
            IsActive = zone.IsActive,
            CreatedDate = zone.CreatedDate
        };
    }
}
