using AutoMapper;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.PurchaseOrders;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Repositories.Interfaces;

namespace StockFlowPro.Application.Services.Implementations;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PurchaseOrderService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PurchaseOrderDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var purchaseOrder = await _unitOfWork.PurchaseOrders.GetWithLinesAsync(id, cancellationToken);
        return purchaseOrder == null ? null : _mapper.Map<PurchaseOrderDetailDto>(purchaseOrder);
    }

    public async Task<PaginatedResponse<PurchaseOrderDto>> GetPagedAsync(int pageNumber, int pageSize, int? supplierId = null, CancellationToken cancellationToken = default)
    {
        var allOrders = supplierId.HasValue
            ? await _unitOfWork.PurchaseOrders.GetBySupplierAsync(supplierId.Value, cancellationToken)
            : await _unitOfWork.PurchaseOrders.GetAllAsync(cancellationToken);

        var query = allOrders.AsQueryable();
        var totalCount = query.Count();

        var items = query
            .OrderByDescending(po => po.OrderDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PaginatedResponse<PurchaseOrderDto>(
            _mapper.Map<List<PurchaseOrderDto>>(items),
            totalCount,
            pageNumber,
            pageSize
        );
    }

    public async Task<PurchaseOrderDto> CreateAsync(CreatePurchaseOrderDto dto, CancellationToken cancellationToken = default)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(dto.SupplierId, cancellationToken);
        if (supplier == null)
        {
            throw new NotFoundException("Supplier", dto.SupplierId);
        }

        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(dto.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            throw new NotFoundException("Warehouse", dto.WarehouseId);
        }

        var poNumber = await _unitOfWork.PurchaseOrders.GeneratePONumberAsync(cancellationToken);

        var purchaseOrder = new PurchaseOrder
        {
            PONumber = poNumber,
            SupplierId = dto.SupplierId,
            WarehouseId = dto.WarehouseId,
            OrderDate = DateTime.UtcNow,
            Status = PurchaseOrderStatus.Draft,
            Priority = dto.Priority,
            ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
            PaymentTerms = dto.PaymentTerms,
            ShippingTerms = dto.ShippingTerms,
            Currency = dto.Currency,
            DiscountPercent = dto.DiscountPercent,
            TaxPercent = dto.TaxPercent,
            ShippingCost = dto.ShippingCost,
            Notes = dto.Notes,
            CreatedDate = DateTime.UtcNow,
            CreatedByUserId = 1 // TODO: Get from current user
        };

        decimal subtotal = 0;
        int lineNumber = 1;
        foreach (var lineDto in dto.Lines)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(lineDto.ProductId, cancellationToken);
            if (product == null)
            {
                throw new NotFoundException("Product", lineDto.ProductId);
            }

            var line = new PurchaseOrderLine
            {
                LineNumber = lineNumber++,
                ProductId = lineDto.ProductId,
                QuantityOrdered = lineDto.QuantityOrdered,
                UOMId = lineDto.UOMId,
                UnitPrice = lineDto.UnitPrice,
                DiscountPercent = lineDto.DiscountPercent,
                TaxPercent = lineDto.TaxPercent,
                Description = lineDto.Description,
                ExpectedDate = lineDto.ExpectedDate,
                Status = PurchaseOrderLineStatus.Open
            };

            var lineSubtotal = line.QuantityOrdered * line.UnitPrice;
            line.DiscountAmount = lineSubtotal * (line.DiscountPercent / 100);
            var lineAfterDiscount = lineSubtotal - line.DiscountAmount;
            line.TaxAmount = lineAfterDiscount * (line.TaxPercent / 100);
            line.LineTotal = lineAfterDiscount + line.TaxAmount;

            subtotal += lineSubtotal;
            purchaseOrder.Lines.Add(line);
        }

        purchaseOrder.Subtotal = subtotal;
        purchaseOrder.DiscountAmount = subtotal * (purchaseOrder.DiscountPercent / 100);
        var afterDiscount = subtotal - purchaseOrder.DiscountAmount;
        purchaseOrder.TaxAmount = afterDiscount * (purchaseOrder.TaxPercent / 100);
        purchaseOrder.TotalAmount = afterDiscount + purchaseOrder.TaxAmount + purchaseOrder.ShippingCost;

        await _unitOfWork.PurchaseOrders.AddAsync(purchaseOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<PurchaseOrderDto>(purchaseOrder);
    }

    public async Task<PurchaseOrderDto> SubmitAsync(int id, CancellationToken cancellationToken = default)
    {
        var purchaseOrder = await _unitOfWork.PurchaseOrders.GetByIdAsync(id, cancellationToken);
        if (purchaseOrder == null)
        {
            throw new NotFoundException("PurchaseOrder", id);
        }

        if (purchaseOrder.Status != PurchaseOrderStatus.Draft)
        {
            throw new BusinessRuleException("INVALID_STATUS", "Only draft purchase orders can be submitted.");
        }

        purchaseOrder.Status = PurchaseOrderStatus.Submitted;
        purchaseOrder.ApprovalStatus = ApprovalStatus.Pending;
        purchaseOrder.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.PurchaseOrders.Update(purchaseOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<PurchaseOrderDto>(purchaseOrder);
    }

    public async Task<PurchaseOrderDto> ApproveAsync(int id, string? notes = null, CancellationToken cancellationToken = default)
    {
        var purchaseOrder = await _unitOfWork.PurchaseOrders.GetByIdAsync(id, cancellationToken);
        if (purchaseOrder == null)
        {
            throw new NotFoundException("PurchaseOrder", id);
        }

        if (purchaseOrder.Status != PurchaseOrderStatus.Submitted)
        {
            throw new BusinessRuleException("INVALID_STATUS", "Only submitted purchase orders can be approved.");
        }

        purchaseOrder.Status = PurchaseOrderStatus.Approved;
        purchaseOrder.ApprovalStatus = ApprovalStatus.Approved;
        purchaseOrder.ApprovedDate = DateTime.UtcNow;
        purchaseOrder.ApprovedByUserId = 1; // TODO: Get from current user
        purchaseOrder.ApprovalNotes = notes;
        purchaseOrder.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.PurchaseOrders.Update(purchaseOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<PurchaseOrderDto>(purchaseOrder);
    }

    public async Task<PurchaseOrderDto> RejectAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        var purchaseOrder = await _unitOfWork.PurchaseOrders.GetByIdAsync(id, cancellationToken);
        if (purchaseOrder == null)
        {
            throw new NotFoundException("PurchaseOrder", id);
        }

        if (purchaseOrder.Status != PurchaseOrderStatus.Submitted)
        {
            throw new BusinessRuleException("INVALID_STATUS", "Only submitted purchase orders can be rejected.");
        }

        purchaseOrder.Status = PurchaseOrderStatus.Draft; // Return to draft for revision
        purchaseOrder.ApprovalStatus = ApprovalStatus.Rejected;
        purchaseOrder.ApprovalNotes = reason;
        purchaseOrder.RevisionNumber++;
        purchaseOrder.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.PurchaseOrders.Update(purchaseOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<PurchaseOrderDto>(purchaseOrder);
    }

    public async Task ReceiveGoodsAsync(ReceiveGoodsDto dto, CancellationToken cancellationToken = default)
    {
        var purchaseOrder = await _unitOfWork.PurchaseOrders.GetWithLinesAsync(dto.PurchaseOrderId, cancellationToken);
        if (purchaseOrder == null)
        {
            throw new NotFoundException("PurchaseOrder", dto.PurchaseOrderId);
        }

        if (purchaseOrder.Status != PurchaseOrderStatus.Approved &&
            purchaseOrder.Status != PurchaseOrderStatus.SentToSupplier &&
            purchaseOrder.Status != PurchaseOrderStatus.Acknowledged &&
            purchaseOrder.Status != PurchaseOrderStatus.PartiallyReceived)
        {
            throw new BusinessRuleException("INVALID_STATUS", "Purchase order must be in a receivable status.");
        }

        foreach (var lineDto in dto.Lines)
        {
            var poLine = purchaseOrder.Lines.FirstOrDefault(l => l.PurchaseOrderLineId == lineDto.PurchaseOrderLineId);
            if (poLine == null)
            {
                throw new NotFoundException("PurchaseOrderLine", lineDto.PurchaseOrderLineId);
            }

            var acceptedQuantity = lineDto.QuantityReceived - lineDto.QuantityRejected;
            poLine.QuantityReceived += acceptedQuantity;
            poLine.QuantityRejected += lineDto.QuantityRejected;
            poLine.QuantityPending = poLine.QuantityOrdered - poLine.QuantityReceived - poLine.QuantityRejected;

            poLine.Status = poLine.QuantityReceived >= poLine.QuantityOrdered
                ? PurchaseOrderLineStatus.FullyReceived
                : poLine.QuantityReceived > 0
                    ? PurchaseOrderLineStatus.PartiallyReceived
                    : PurchaseOrderLineStatus.Open;

            // Update stock level
            var stockLevel = await _unitOfWork.StockLevels.GetByProductAndLocationAsync(
                poLine.ProductId, purchaseOrder.WarehouseId, lineDto.BinId, null, cancellationToken);

            if (stockLevel == null)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(poLine.ProductId, cancellationToken);
                stockLevel = new StockLevel
                {
                    ProductId = poLine.ProductId,
                    WarehouseId = purchaseOrder.WarehouseId,
                    BinId = lineDto.BinId,
                    QuantityOnHand = 0,
                    QuantityReserved = 0,
                    QuantityAvailable = 0,
                    UnitCost = poLine.UnitPrice,
                    Status = StockStatus.OutOfStock,
                    LastMovementDate = DateTime.UtcNow
                };
                await _unitOfWork.StockLevels.AddAsync(stockLevel, cancellationToken);
            }

            var previousQuantity = stockLevel.QuantityOnHand;
            stockLevel.QuantityOnHand += acceptedQuantity;
            stockLevel.QuantityAvailable = stockLevel.QuantityOnHand - stockLevel.QuantityReserved;
            stockLevel.Status = stockLevel.QuantityOnHand > 0 ? StockStatus.OK : StockStatus.OutOfStock;
            stockLevel.LastMovementDate = DateTime.UtcNow;

            // Record stock movement
            var movementNumber = await _unitOfWork.StockMovements.GenerateMovementNumberAsync(cancellationToken);
            var movement = new StockMovement
            {
                MovementNumber = movementNumber,
                MovementType = MovementType.PurchaseReceipt,
                MovementDate = DateTime.UtcNow,
                ProductId = poLine.ProductId,
                ToWarehouseId = purchaseOrder.WarehouseId,
                ToBinId = lineDto.BinId,
                Quantity = acceptedQuantity,
                UOMId = poLine.UOMId,
                QuantityInBaseUOM = acceptedQuantity,
                UnitCost = poLine.UnitPrice,
                TotalCost = acceptedQuantity * poLine.UnitPrice,
                RunningBalance = stockLevel.QuantityOnHand,
                ReferenceType = ReferenceType.PurchaseOrder,
                ReferenceId = purchaseOrder.PurchaseOrderId,
                ReferenceNumber = purchaseOrder.PONumber,
                Status = MovementStatus.Completed,
                CreatedDate = DateTime.UtcNow,
                CreatedByUserId = 1 // TODO: Get from current user
            };
            await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);
        }

        // Update PO status
        var allLinesReceived = purchaseOrder.Lines.All(l => l.Status == PurchaseOrderLineStatus.FullyReceived);
        var anyLinesReceived = purchaseOrder.Lines.Any(l => l.QuantityReceived > 0);

        purchaseOrder.Status = allLinesReceived
            ? PurchaseOrderStatus.FullyReceived
            : anyLinesReceived
                ? PurchaseOrderStatus.PartiallyReceived
                : purchaseOrder.Status;

        if (allLinesReceived)
        {
            purchaseOrder.ActualDeliveryDate = DateTime.UtcNow;
        }

        purchaseOrder.ModifiedDate = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task CancelAsync(int id, CancellationToken cancellationToken = default)
    {
        var purchaseOrder = await _unitOfWork.PurchaseOrders.GetByIdAsync(id, cancellationToken);
        if (purchaseOrder == null)
        {
            throw new NotFoundException("PurchaseOrder", id);
        }

        if (purchaseOrder.Status == PurchaseOrderStatus.FullyReceived ||
            purchaseOrder.Status == PurchaseOrderStatus.Closed ||
            purchaseOrder.Status == PurchaseOrderStatus.Cancelled)
        {
            throw new BusinessRuleException("INVALID_STATUS", "Cannot cancel a received, closed, or already cancelled purchase order.");
        }

        purchaseOrder.Status = PurchaseOrderStatus.Cancelled;
        purchaseOrder.ModifiedDate = DateTime.UtcNow;

        // Cancel all open lines
        foreach (var line in purchaseOrder.Lines.Where(l => l.Status == PurchaseOrderLineStatus.Open || l.Status == PurchaseOrderLineStatus.PartiallyReceived))
        {
            line.Status = PurchaseOrderLineStatus.Cancelled;
        }

        _unitOfWork.PurchaseOrders.Update(purchaseOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PurchaseOrderDto>> GetPendingReceiptsAsync(CancellationToken cancellationToken = default)
    {
        var purchaseOrders = await _unitOfWork.PurchaseOrders.GetPendingReceiptsAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<PurchaseOrderDto>>(purchaseOrders);
    }
}
