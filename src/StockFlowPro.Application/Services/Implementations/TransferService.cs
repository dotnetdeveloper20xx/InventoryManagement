using AutoMapper;
using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Transfer;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class TransferService : ITransferService
{
    private readonly StockFlowDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public TransferService(StockFlowDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<TransferDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var transfer = await _context.Transfers
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Lines).ThenInclude(l => l.Product)
            .Include(t => t.Lines).ThenInclude(l => l.FromBin)
            .Include(t => t.Lines).ThenInclude(l => l.ToBin)
            .Include(t => t.RequestedBy)
            .Include(t => t.ApprovedBy)
            .FirstOrDefaultAsync(t => t.TransferId == id, ct);

        if (transfer == null) return null;

        return MapToDto(transfer);
    }

    public async Task<PaginatedResponse<TransferListDto>> GetPagedAsync(int pageNumber, int pageSize, int? sourceWarehouseId, int? destWarehouseId, string? status, CancellationToken ct = default)
    {
        var query = _context.Transfers
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Lines)
            .Include(t => t.RequestedBy)
            .AsQueryable();

        if (sourceWarehouseId.HasValue)
            query = query.Where(t => t.FromWarehouseId == sourceWarehouseId.Value);
        if (destWarehouseId.HasValue)
            query = query.Where(t => t.ToWarehouseId == destWarehouseId.Value);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<TransferStatus>(status, out var statusEnum))
            query = query.Where(t => t.Status == statusEnum);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(t => t.RequestedDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TransferListDto
            {
                TransferId = t.TransferId,
                TransferNumber = t.TransferNumber,
                SourceWarehouseName = t.FromWarehouse.Name,
                DestinationWarehouseName = t.ToWarehouse.Name,
                RequestDate = t.RequestedDate,
                RequiredDate = t.RequiredDate,
                Status = t.Status.ToString(),
                Priority = t.Priority.ToString(),
                LineCount = t.Lines.Count,
                TotalQuantity = t.Lines.Sum(l => l.RequestedQty),
                RequestedBy = t.RequestedBy != null ? t.RequestedBy.Username : null
            })
            .ToListAsync(ct);

        return new PaginatedResponse<TransferListDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<TransferDto> CreateAsync(CreateTransferDto dto, CancellationToken ct = default)
    {
        if (dto.SourceWarehouseId == dto.DestinationWarehouseId)
            throw new BusinessRuleException("SAME_WAREHOUSE", "Source and destination warehouses cannot be the same.");

        var transferNumber = await GenerateTransferNumberAsync(ct);

        var transfer = new Transfer
        {
            TransferNumber = transferNumber,
            FromWarehouseId = dto.SourceWarehouseId,
            ToWarehouseId = dto.DestinationWarehouseId,
            RequestedDate = DateTime.UtcNow,
            RequiredDate = dto.RequiredDate,
            Priority = Enum.TryParse<TransferPriority>(dto.Priority, out var priority) ? priority : TransferPriority.Normal,
            Status = TransferStatus.Draft,
            Notes = dto.Notes,
            RequestedByUserId = _currentUserService.UserId ?? 1,
            CreatedDate = DateTime.UtcNow
        };

        foreach (var lineDto in dto.Lines)
        {
            // Validate stock availability
            var stockLevel = await _context.StockLevels
                .FirstOrDefaultAsync(s => s.ProductId == lineDto.ProductId && s.WarehouseId == dto.SourceWarehouseId, ct);

            if (stockLevel == null || stockLevel.QuantityAvailable < lineDto.RequestedQuantity)
                throw new BusinessRuleException("INSUFFICIENT_STOCK", $"Insufficient stock for product {lineDto.ProductId}.");

            transfer.Lines.Add(new TransferLine
            {
                ProductId = lineDto.ProductId,
                FromBinId = lineDto.SourceBinId,
                ToBinId = lineDto.DestinationBinId,
                RequestedQty = lineDto.RequestedQuantity,
                ApprovedQty = lineDto.RequestedQuantity,
                UOMId = 1 // Default UOM
            });
        }

        _context.Transfers.Add(transfer);
        await _context.SaveChangesAsync(ct);

        return (await GetByIdAsync(transfer.TransferId, ct))!;
    }

    public async Task ApproveAsync(ApproveTransferDto dto, CancellationToken ct = default)
    {
        var transfer = await _context.Transfers
            .Include(t => t.Lines)
            .FirstOrDefaultAsync(t => t.TransferId == dto.TransferId, ct);

        if (transfer == null)
            throw new NotFoundException("Transfer", dto.TransferId);

        if (transfer.Status != TransferStatus.Draft && transfer.Status != TransferStatus.Submitted)
            throw new BusinessRuleException("INVALID_STATUS", "Only draft or submitted transfers can be approved.");

        if (dto.Lines != null)
        {
            foreach (var lineDto in dto.Lines)
            {
                var line = transfer.Lines.FirstOrDefault(l => l.TransferLineId == lineDto.TransferLineId);
                if (line != null)
                    line.ApprovedQty = lineDto.ApprovedQuantity;
            }
        }

        transfer.Status = TransferStatus.Approved;
        transfer.ApprovedDate = DateTime.UtcNow;
        transfer.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task RejectAsync(int id, string? reason, CancellationToken ct = default)
    {
        var transfer = await _context.Transfers.FindAsync(new object[] { id }, ct);

        if (transfer == null)
            throw new NotFoundException("Transfer", id);

        transfer.Status = TransferStatus.Rejected;
        transfer.Notes = string.IsNullOrEmpty(transfer.Notes) ? reason : $"{transfer.Notes}\nRejection reason: {reason}";
        transfer.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task ShipAsync(ShipTransferDto dto, CancellationToken ct = default)
    {
        var transfer = await _context.Transfers
            .Include(t => t.Lines)
            .FirstOrDefaultAsync(t => t.TransferId == dto.TransferId, ct);

        if (transfer == null)
            throw new NotFoundException("Transfer", dto.TransferId);

        if (transfer.Status != TransferStatus.Approved)
            throw new BusinessRuleException("INVALID_STATUS", "Only approved transfers can be shipped.");

        // Reserve/deduct stock from source
        foreach (var line in transfer.Lines)
        {
            var stockLevel = await _context.StockLevels
                .FirstOrDefaultAsync(s => s.ProductId == line.ProductId && s.WarehouseId == transfer.FromWarehouseId, ct);

            if (stockLevel == null || stockLevel.QuantityAvailable < line.ApprovedQty)
                throw new BusinessRuleException("INSUFFICIENT_STOCK", $"Insufficient stock for product {line.ProductId}.");

            var shippedQty = dto.Lines?.FirstOrDefault(l => l.TransferLineId == line.TransferLineId)?.ShippedQuantity ?? line.ApprovedQty;
            line.ShippedQty = shippedQty;

            stockLevel.QuantityOnHand -= shippedQty;
            stockLevel.QuantityAvailable -= shippedQty;
            stockLevel.LastMovementDate = DateTime.UtcNow;

            // Create outbound movement
            var movement = new StockMovement
            {
                MovementNumber = $"MOV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                MovementType = MovementType.TransferOut,
                MovementDate = dto.ShippedDate,
                ProductId = line.ProductId,
                FromWarehouseId = transfer.FromWarehouseId,
                FromBinId = line.FromBinId,
                Quantity = shippedQty,
                UOMId = line.UOMId,
                QuantityInBaseUOM = shippedQty,
                ReferenceType = ReferenceType.Transfer,
                ReferenceId = transfer.TransferId,
                ReferenceNumber = transfer.TransferNumber,
                Status = MovementStatus.Completed,
                CreatedDate = DateTime.UtcNow
            };
            _context.StockMovements.Add(movement);
        }

        transfer.Status = TransferStatus.Shipped;
        transfer.ShippedDate = dto.ShippedDate;
        transfer.TrackingNumber = dto.TrackingNumber;
        transfer.Carrier = dto.Carrier;
        transfer.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task ReceiveAsync(ReceiveTransferDto dto, CancellationToken ct = default)
    {
        var transfer = await _context.Transfers
            .Include(t => t.Lines)
            .FirstOrDefaultAsync(t => t.TransferId == dto.TransferId, ct);

        if (transfer == null)
            throw new NotFoundException("Transfer", dto.TransferId);

        if (transfer.Status != TransferStatus.Shipped)
            throw new BusinessRuleException("INVALID_STATUS", "Only shipped transfers can be received.");

        foreach (var lineDto in dto.Lines)
        {
            var line = transfer.Lines.FirstOrDefault(l => l.TransferLineId == lineDto.TransferLineId);
            if (line == null) continue;

            line.ReceivedQty = lineDto.ReceivedQuantity;
            line.VarianceQty = line.ShippedQty - lineDto.ReceivedQuantity;
            if (lineDto.DestinationBinId.HasValue)
                line.ToBinId = lineDto.DestinationBinId;

            // Add stock to destination
            var stockLevel = await _context.StockLevels
                .FirstOrDefaultAsync(s => s.ProductId == line.ProductId && s.WarehouseId == transfer.ToWarehouseId, ct);

            if (stockLevel == null)
            {
                stockLevel = new StockLevel
                {
                    ProductId = line.ProductId,
                    WarehouseId = transfer.ToWarehouseId,
                    QuantityOnHand = 0,
                    QuantityReserved = 0,
                    QuantityAvailable = 0,
                    LastMovementDate = DateTime.UtcNow,
                    CreatedDate = DateTime.UtcNow
                };
                _context.StockLevels.Add(stockLevel);
            }

            stockLevel.QuantityOnHand += lineDto.ReceivedQuantity;
            stockLevel.QuantityAvailable += lineDto.ReceivedQuantity;
            stockLevel.LastMovementDate = DateTime.UtcNow;

            // Create inbound movement
            var movement = new StockMovement
            {
                MovementNumber = $"MOV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                MovementType = MovementType.TransferIn,
                MovementDate = dto.ReceivedDate,
                ProductId = line.ProductId,
                ToWarehouseId = transfer.ToWarehouseId,
                ToBinId = line.ToBinId,
                Quantity = lineDto.ReceivedQuantity,
                UOMId = line.UOMId,
                QuantityInBaseUOM = lineDto.ReceivedQuantity,
                ReferenceType = ReferenceType.Transfer,
                ReferenceId = transfer.TransferId,
                ReferenceNumber = transfer.TransferNumber,
                Status = MovementStatus.Completed,
                CreatedDate = DateTime.UtcNow
            };
            _context.StockMovements.Add(movement);
        }

        transfer.Status = TransferStatus.Received;
        transfer.ReceivedDate = dto.ReceivedDate;
        transfer.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task CancelAsync(int id, string? reason, CancellationToken ct = default)
    {
        var transfer = await _context.Transfers.FindAsync(new object[] { id }, ct);

        if (transfer == null)
            throw new NotFoundException("Transfer", id);

        if (transfer.Status == TransferStatus.Shipped || transfer.Status == TransferStatus.Received)
            throw new BusinessRuleException("CANNOT_CANCEL", "Cannot cancel a shipped or received transfer.");

        transfer.Status = TransferStatus.Cancelled;
        transfer.Notes = string.IsNullOrEmpty(transfer.Notes) ? reason : $"{transfer.Notes}\nCancellation reason: {reason}";
        transfer.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    private TransferDto MapToDto(Transfer transfer)
    {
        return new TransferDto
        {
            TransferId = transfer.TransferId,
            TransferNumber = transfer.TransferNumber,
            SourceWarehouseId = transfer.FromWarehouseId,
            SourceWarehouseName = transfer.FromWarehouse?.Name ?? "",
            DestinationWarehouseId = transfer.ToWarehouseId,
            DestinationWarehouseName = transfer.ToWarehouse?.Name ?? "",
            RequestDate = transfer.RequestedDate,
            RequiredDate = transfer.RequiredDate,
            ShippedDate = transfer.ShippedDate,
            ReceivedDate = transfer.ReceivedDate,
            Status = transfer.Status.ToString(),
            Priority = transfer.Priority.ToString(),
            TrackingNumber = transfer.TrackingNumber,
            Carrier = transfer.Carrier,
            Notes = transfer.Notes,
            Lines = transfer.Lines.Select(l => new TransferLineDto
            {
                TransferLineId = l.TransferLineId,
                ProductId = l.ProductId,
                ProductSKU = l.Product?.SKU ?? "",
                ProductName = l.Product?.Name ?? "",
                SourceBinId = l.FromBinId,
                SourceBinCode = l.FromBin?.BinCode,
                DestinationBinId = l.ToBinId,
                DestinationBinCode = l.ToBin?.BinCode,
                BatchNumber = l.Batch?.BatchNumber,
                RequestedQuantity = l.RequestedQty,
                ApprovedQuantity = l.ApprovedQty,
                ShippedQuantity = l.ShippedQty,
                ReceivedQuantity = l.ReceivedQty,
                VarianceQuantity = l.VarianceQty,
                UOM = l.UOM?.Symbol ?? "EA"
            }).ToList(),
            RequestedBy = transfer.RequestedBy?.Username,
            ApprovedBy = transfer.ApprovedBy?.Username,
            ApprovedDate = transfer.ApprovedDate,
            CreatedDate = transfer.CreatedDate
        };
    }

    private async Task<string> GenerateTransferNumberAsync(CancellationToken ct)
    {
        var year = DateTime.UtcNow.Year;
        var last = await _context.Transfers
            .Where(t => t.TransferNumber.StartsWith($"TRF-{year}"))
            .OrderByDescending(t => t.TransferNumber)
            .FirstOrDefaultAsync(ct);

        var nextNumber = 1;
        if (last != null)
        {
            var parts = last.TransferNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"TRF-{year}-{nextNumber:D5}";
    }
}
