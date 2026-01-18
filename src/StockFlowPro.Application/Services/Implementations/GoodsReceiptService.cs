using AutoMapper;
using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.GoodsReceipt;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class GoodsReceiptService : IGoodsReceiptService
{
    private readonly StockFlowDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GoodsReceiptService(StockFlowDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<GoodsReceiptDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var grn = await _context.GoodsReceipts
            .Include(g => g.PurchaseOrder).ThenInclude(p => p.Supplier)
            .Include(g => g.Warehouse)
            .Include(g => g.Lines).ThenInclude(l => l.Product)
            .Include(g => g.ReceivedBy)
            .FirstOrDefaultAsync(g => g.GoodsReceiptId == id, ct);

        if (grn == null) return null;

        return new GoodsReceiptDto
        {
            GoodsReceiptId = grn.GoodsReceiptId,
            GRNNumber = grn.GRNNumber,
            PurchaseOrderId = grn.PurchaseOrderId,
            PONumber = grn.PurchaseOrder?.PONumber ?? "",
            SupplierId = grn.PurchaseOrder?.SupplierId ?? 0,
            SupplierName = grn.PurchaseOrder?.Supplier?.CompanyName ?? "",
            WarehouseId = grn.WarehouseId,
            WarehouseName = grn.Warehouse?.Name ?? "",
            ReceiptDate = grn.ReceiptDate,
            Status = grn.Status.ToString(),
            DeliveryNoteNumber = grn.SupplierDeliveryNote,
            ReceivedBy = grn.ReceivedBy?.Username,
            Notes = grn.Notes,
            TotalValue = grn.Lines.Sum(l => l.QuantityReceived * l.UnitCost),
            Lines = grn.Lines.Select(l => new GoodsReceiptLineDto
            {
                GoodsReceiptLineId = l.GoodsReceiptLineId,
                ProductId = l.ProductId,
                ProductSKU = l.Product?.SKU ?? "",
                ProductName = l.Product?.Name ?? "",
                OrderedQuantity = l.QuantityOrdered,
                ReceivedQuantity = l.QuantityReceived,
                RejectedQuantity = l.QuantityRejected,
                AcceptedQuantity = l.QuantityAccepted,
                BinId = l.BinId,
                BatchNumber = l.BatchNumber,
                ExpiryDate = l.ExpiryDate,
                UnitCost = l.UnitCost,
                TotalCost = l.TotalCost,
                InspectionStatus = l.InspectionStatus.ToString(),
                Notes = l.InspectionNotes
            }).ToList(),
            CreatedDate = grn.CreatedDate
        };
    }

    public async Task<PaginatedResponse<GoodsReceiptListDto>> GetPagedAsync(int pageNumber, int pageSize, int? poId, int? supplierId, DateTime? fromDate, DateTime? toDate, CancellationToken ct = default)
    {
        var query = _context.GoodsReceipts
            .Include(g => g.PurchaseOrder).ThenInclude(p => p.Supplier)
            .Include(g => g.Warehouse)
            .Include(g => g.Lines)
            .Include(g => g.ReceivedBy)
            .AsQueryable();

        if (poId.HasValue)
            query = query.Where(g => g.PurchaseOrderId == poId.Value);
        if (supplierId.HasValue)
            query = query.Where(g => g.PurchaseOrder.SupplierId == supplierId.Value);
        if (fromDate.HasValue)
            query = query.Where(g => g.ReceiptDate >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(g => g.ReceiptDate <= toDate.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(g => g.ReceiptDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(g => new GoodsReceiptListDto
            {
                GoodsReceiptId = g.GoodsReceiptId,
                GRNNumber = g.GRNNumber,
                PONumber = g.PurchaseOrder.PONumber,
                SupplierName = g.PurchaseOrder.Supplier.CompanyName,
                WarehouseName = g.Warehouse.Name,
                ReceiptDate = g.ReceiptDate,
                Status = g.Status.ToString(),
                LineCount = g.Lines.Count,
                TotalValue = g.Lines.Sum(l => l.QuantityReceived * l.UnitCost),
                ReceivedBy = g.ReceivedBy != null ? g.ReceivedBy.Username : null
            })
            .ToListAsync(ct);

        return new PaginatedResponse<GoodsReceiptListDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<IReadOnlyList<PendingReceiptDto>> GetPendingReceiptsAsync(int? supplierId, CancellationToken ct = default)
    {
        var query = _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.Lines).ThenInclude(l => l.Product)
            .Where(p => p.Status == PurchaseOrderStatus.Approved || p.Status == PurchaseOrderStatus.PartiallyReceived);

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierId == supplierId.Value);

        var pos = await query.ToListAsync(ct);

        return pos.Select(p => new PendingReceiptDto
        {
            PurchaseOrderId = p.PurchaseOrderId,
            PONumber = p.PONumber,
            SupplierName = p.Supplier?.CompanyName ?? "",
            OrderDate = p.OrderDate,
            ExpectedDeliveryDate = p.ExpectedDeliveryDate,
            Status = p.Status.ToString(),
            TotalLines = p.Lines.Count,
            LinesFullyReceived = p.Lines.Count(l => l.QuantityReceived >= l.QuantityOrdered),
            LinesPartiallyReceived = p.Lines.Count(l => l.QuantityReceived > 0 && l.QuantityReceived < l.QuantityOrdered),
            LinesPending = p.Lines.Count(l => l.QuantityReceived == 0),
            Lines = p.Lines.Where(l => l.QuantityReceived < l.QuantityOrdered).Select(l => new PendingReceiptLineDto
            {
                PurchaseOrderLineId = l.PurchaseOrderLineId,
                ProductId = l.ProductId,
                ProductSKU = l.Product?.SKU ?? "",
                ProductName = l.Product?.Name ?? "",
                OrderedQuantity = l.QuantityOrdered,
                ReceivedQuantity = l.QuantityReceived,
                PendingQuantity = l.QuantityOrdered - l.QuantityReceived,
                UnitPrice = l.UnitPrice
            }).ToList()
        }).ToList();
    }

    public async Task<GoodsReceiptDto> CreateAsync(CreateGoodsReceiptDto dto, CancellationToken ct = default)
    {
        var po = await _context.PurchaseOrders
            .Include(p => p.Lines)
            .FirstOrDefaultAsync(p => p.PurchaseOrderId == dto.PurchaseOrderId, ct);

        if (po == null)
            throw new NotFoundException("PurchaseOrder", dto.PurchaseOrderId);

        var grnNumber = await GenerateGRNNumberAsync(ct);

        var grn = new GoodsReceipt
        {
            GRNNumber = grnNumber,
            PurchaseOrderId = dto.PurchaseOrderId,
            WarehouseId = dto.WarehouseId,
            ReceiptDate = dto.ReceiptDate,
            SupplierDeliveryNote = dto.DeliveryNoteNumber,
            Notes = dto.Notes,
            Status = GoodsReceiptStatus.Draft,
            ReceivedByUserId = _currentUserService.UserId ?? 1,
            CreatedDate = DateTime.UtcNow
        };

        foreach (var lineDto in dto.Lines)
        {
            var poLine = po.Lines.FirstOrDefault(l => l.PurchaseOrderLineId == lineDto.PurchaseOrderLineId);
            if (poLine == null) continue;

            grn.Lines.Add(new GoodsReceiptLine
            {
                ProductId = lineDto.ProductId,
                PurchaseOrderLineId = lineDto.PurchaseOrderLineId,
                QuantityOrdered = poLine.QuantityOrdered,
                QuantityReceived = lineDto.ReceivedQuantity,
                QuantityRejected = lineDto.RejectedQuantity,
                QuantityAccepted = lineDto.ReceivedQuantity - lineDto.RejectedQuantity,
                BinId = lineDto.BinId,
                BatchNumber = lineDto.BatchNumber,
                ExpiryDate = lineDto.ExpiryDate,
                UnitCost = lineDto.UnitCost,
                TotalCost = lineDto.ReceivedQuantity * lineDto.UnitCost,
                UOMId = poLine.UOMId,
                InspectionStatus = Enum.TryParse<InspectionStatus>(lineDto.InspectionStatus, out var status) ? status : InspectionStatus.NotRequired,
                InspectionNotes = lineDto.Notes
            });
        }

        _context.GoodsReceipts.Add(grn);
        await _context.SaveChangesAsync(ct);

        return (await GetByIdAsync(grn.GoodsReceiptId, ct))!;
    }

    public async Task PostAsync(int id, CancellationToken ct = default)
    {
        var grn = await _context.GoodsReceipts
            .Include(g => g.Lines)
            .Include(g => g.PurchaseOrder).ThenInclude(p => p.Lines)
            .FirstOrDefaultAsync(g => g.GoodsReceiptId == id, ct);

        if (grn == null)
            throw new NotFoundException("GoodsReceipt", id);

        if (grn.Status != GoodsReceiptStatus.Draft)
            throw new BusinessRuleException("INVALID_STATUS", "Only draft goods receipts can be posted.");

        // Update stock levels
        foreach (var line in grn.Lines)
        {
            var stockLevel = await _context.StockLevels
                .FirstOrDefaultAsync(s => s.ProductId == line.ProductId && s.WarehouseId == grn.WarehouseId, ct);

            if (stockLevel == null)
            {
                stockLevel = new StockLevel
                {
                    ProductId = line.ProductId,
                    WarehouseId = grn.WarehouseId,
                    QuantityOnHand = 0,
                    QuantityReserved = 0,
                    QuantityAvailable = 0,
                    CreatedDate = DateTime.UtcNow
                };
                _context.StockLevels.Add(stockLevel);
            }

            var acceptedQty = line.QuantityAccepted;
            stockLevel.QuantityOnHand += acceptedQty;
            stockLevel.QuantityAvailable += acceptedQty;
            stockLevel.LastMovementDate = DateTime.UtcNow;

            // Create stock movement
            var movement = new StockMovement
            {
                MovementNumber = $"MOV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                MovementType = MovementType.PurchaseReceipt,
                MovementDate = grn.ReceiptDate,
                ProductId = line.ProductId,
                ToWarehouseId = grn.WarehouseId,
                ToBinId = line.BinId,
                Quantity = acceptedQty,
                UOMId = line.UOMId,
                QuantityInBaseUOM = acceptedQty,
                UnitCost = line.UnitCost,
                TotalCost = acceptedQty * line.UnitCost,
                ReferenceType = ReferenceType.GoodsReceipt,
                ReferenceId = grn.GoodsReceiptId,
                ReferenceNumber = grn.GRNNumber,
                Status = MovementStatus.Completed,
                CreatedDate = DateTime.UtcNow
            };
            _context.StockMovements.Add(movement);

            // Update PO line
            var poLine = grn.PurchaseOrder?.Lines.FirstOrDefault(l => l.PurchaseOrderLineId == line.PurchaseOrderLineId);
            if (poLine != null)
            {
                poLine.QuantityReceived += acceptedQty;
            }

            // Update product average cost
            var product = await _context.Products.FindAsync(new object[] { line.ProductId }, ct);
            if (product != null)
            {
                product.LastPurchasePrice = line.UnitCost;
                // Simple average cost update
                var totalQty = stockLevel.QuantityOnHand;
                if (totalQty > 0)
                {
                    product.AverageCost = ((product.AverageCost * (totalQty - acceptedQty)) + (line.UnitCost * acceptedQty)) / totalQty;
                }
            }
        }

        // Update PO status
        if (grn.PurchaseOrder != null)
        {
            var allReceived = grn.PurchaseOrder.Lines.All(l => l.QuantityReceived >= l.QuantityOrdered);
            var anyReceived = grn.PurchaseOrder.Lines.Any(l => l.QuantityReceived > 0);

            grn.PurchaseOrder.Status = allReceived ? PurchaseOrderStatus.FullyReceived :
                                       anyReceived ? PurchaseOrderStatus.PartiallyReceived :
                                       grn.PurchaseOrder.Status;

            if (allReceived)
                grn.PurchaseOrder.ActualDeliveryDate = grn.ReceiptDate;
        }

        grn.Status = GoodsReceiptStatus.Posted;
        grn.PostedDate = DateTime.UtcNow;
        grn.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    private async Task<string> GenerateGRNNumberAsync(CancellationToken ct)
    {
        var year = DateTime.UtcNow.Year;
        var lastGRN = await _context.GoodsReceipts
            .Where(g => g.GRNNumber.StartsWith($"GRN-{year}"))
            .OrderByDescending(g => g.GRNNumber)
            .FirstOrDefaultAsync(ct);

        var nextNumber = 1;
        if (lastGRN != null)
        {
            var parts = lastGRN.GRNNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"GRN-{year}-{nextNumber:D5}";
    }
}
