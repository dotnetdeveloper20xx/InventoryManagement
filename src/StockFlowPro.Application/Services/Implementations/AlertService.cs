using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Alerts;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class AlertService : IAlertService
{
    private readonly StockFlowDbContext _context;

    public AlertService(StockFlowDbContext context)
    {
        _context = context;
    }

    public async Task<AlertDto?> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var alert = await _context.Alerts
            .Include(a => a.Warehouse)
            .Include(a => a.Product)
            .Include(a => a.ReadBy)
            .FirstOrDefaultAsync(a => a.AlertId == id, ct);

        if (alert == null) return null;

        return MapToDto(alert);
    }

    public async Task<PaginatedResponse<AlertListDto>> GetPagedAsync(AlertFilterDto filter, CancellationToken ct = default)
    {
        var query = _context.Alerts.AsQueryable();

        if (!string.IsNullOrEmpty(filter.Severity) && Enum.TryParse<AlertSeverity>(filter.Severity, out var severity))
            query = query.Where(a => a.Severity == severity);
        if (!string.IsNullOrEmpty(filter.AlertType) && Enum.TryParse<AlertType>(filter.AlertType, out var alertType))
            query = query.Where(a => a.Type == alertType);
        if (filter.WarehouseId.HasValue)
            query = query.Where(a => a.WarehouseId == filter.WarehouseId);
        if (filter.IsRead.HasValue)
            query = query.Where(a => a.IsRead == filter.IsRead.Value);
        if (!filter.IncludeDismissed)
            query = query.Where(a => !a.IsDismissed);
        if (filter.FromDate.HasValue)
            query = query.Where(a => a.CreatedDate >= filter.FromDate.Value);
        if (filter.ToDate.HasValue)
            query = query.Where(a => a.CreatedDate <= filter.ToDate.Value);

        // Exclude snoozed alerts
        query = query.Where(a => !a.SnoozeUntil.HasValue || a.SnoozeUntil <= DateTime.UtcNow);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(a => a.Severity)
            .ThenByDescending(a => a.CreatedDate)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new AlertListDto
            {
                AlertId = a.AlertId,
                AlertType = a.Type.ToString(),
                Severity = a.Severity.ToString(),
                Title = a.Title,
                Message = a.Message,
                EntityReference = a.EntityType + "-" + a.EntityId,
                IsRead = a.IsRead,
                CreatedDate = a.CreatedDate
            })
            .ToListAsync(ct);

        return new PaginatedResponse<AlertListDto>(items, totalCount, filter.PageNumber, filter.PageSize);
    }

    public async Task<AlertSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var alerts = await _context.Alerts
            .Where(a => !a.IsDismissed)
            .Where(a => !a.SnoozeUntil.HasValue || a.SnoozeUntil <= DateTime.UtcNow)
            .ToListAsync(ct);

        return new AlertSummaryDto
        {
            TotalAlerts = alerts.Count,
            UnreadAlerts = alerts.Count(a => !a.IsRead),
            CriticalCount = alerts.Count(a => a.Severity == AlertSeverity.Critical),
            WarningCount = alerts.Count(a => a.Severity == AlertSeverity.Warning),
            InfoCount = alerts.Count(a => a.Severity == AlertSeverity.Info),
            ByType = alerts.GroupBy(a => a.Type).Select(g => new AlertCountByTypeDto
            {
                AlertType = g.Key.ToString(),
                Count = g.Count()
            }).ToList()
        };
    }

    public async Task AcknowledgeAsync(AcknowledgeAlertDto dto, CancellationToken ct = default)
    {
        var alert = await _context.Alerts.FindAsync(new object[] { dto.AlertId }, ct);

        if (alert == null)
            throw new NotFoundException("Alert", dto.AlertId);

        alert.IsRead = true;
        alert.ReadDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task DismissAsync(long id, CancellationToken ct = default)
    {
        var alert = await _context.Alerts.FindAsync(new object[] { id }, ct);

        if (alert == null)
            throw new NotFoundException("Alert", id);

        alert.IsDismissed = true;
        alert.DismissedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task SnoozeAsync(SnoozeAlertDto dto, CancellationToken ct = default)
    {
        var alert = await _context.Alerts.FindAsync(new object[] { dto.AlertId }, ct);

        if (alert == null)
            throw new NotFoundException("Alert", dto.AlertId);

        alert.IsSnoozed = true;
        alert.SnoozeUntil = DateTime.UtcNow.AddMinutes(dto.SnoozeMinutes);

        await _context.SaveChangesAsync(ct);
    }

    public async Task MarkAsReadAsync(long id, CancellationToken ct = default)
    {
        var alert = await _context.Alerts.FindAsync(new object[] { id }, ct);

        if (alert == null)
            throw new NotFoundException("Alert", id);

        alert.IsRead = true;
        alert.ReadDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task BulkActionAsync(BulkAlertActionDto dto, CancellationToken ct = default)
    {
        var alerts = await _context.Alerts
            .Where(a => dto.AlertIds.Contains(a.AlertId))
            .ToListAsync(ct);

        foreach (var alert in alerts)
        {
            switch (dto.Action.ToLower())
            {
                case "markread":
                case "acknowledge":
                    alert.IsRead = true;
                    alert.ReadDate = DateTime.UtcNow;
                    break;
                case "dismiss":
                    alert.IsDismissed = true;
                    alert.DismissedDate = DateTime.UtcNow;
                    break;
                case "snooze":
                    alert.IsSnoozed = true;
                    alert.SnoozeUntil = DateTime.UtcNow.AddMinutes(dto.SnoozeMinutes ?? 60);
                    break;
            }
        }

        await _context.SaveChangesAsync(ct);
    }

    public async Task GenerateAlertsAsync(CancellationToken ct = default)
    {
        // Generate low stock alerts
        var lowStockItems = await _context.StockLevels
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => s.QuantityAvailable <= s.Product.ReorderPoint && s.QuantityAvailable > 0)
            .ToListAsync(ct);

        foreach (var item in lowStockItems)
        {
            var existingAlert = await _context.Alerts
                .FirstOrDefaultAsync(a =>
                    a.Type == AlertType.LowStock &&
                    a.EntityType == "Product" &&
                    a.EntityId == item.ProductId &&
                    a.WarehouseId == item.WarehouseId &&
                    !a.IsDismissed, ct);

            if (existingAlert == null)
            {
                _context.Alerts.Add(new Alert
                {
                    Type = AlertType.LowStock,
                    Severity = item.QuantityAvailable <= item.Product.SafetyStock ? AlertSeverity.Critical : AlertSeverity.Warning,
                    Title = "Low Stock Alert",
                    Message = $"{item.Product.Name} ({item.Product.SKU}) is below reorder point. Current: {item.QuantityAvailable}, Reorder Point: {item.Product.ReorderPoint}",
                    EntityType = "Product",
                    EntityId = item.ProductId,
                    ProductId = item.ProductId,
                    WarehouseId = item.WarehouseId,
                    CreatedDate = DateTime.UtcNow
                });
            }
        }

        // Generate out of stock alerts
        var outOfStockItems = await _context.StockLevels
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => s.QuantityAvailable <= 0)
            .ToListAsync(ct);

        foreach (var item in outOfStockItems)
        {
            var existingAlert = await _context.Alerts
                .FirstOrDefaultAsync(a =>
                    a.Type == AlertType.OutOfStock &&
                    a.EntityType == "Product" &&
                    a.EntityId == item.ProductId &&
                    a.WarehouseId == item.WarehouseId &&
                    !a.IsDismissed, ct);

            if (existingAlert == null)
            {
                _context.Alerts.Add(new Alert
                {
                    Type = AlertType.OutOfStock,
                    Severity = AlertSeverity.Critical,
                    Title = "Out of Stock",
                    Message = $"{item.Product.Name} ({item.Product.SKU}) is out of stock in {item.Warehouse.Name}",
                    EntityType = "Product",
                    EntityId = item.ProductId,
                    ProductId = item.ProductId,
                    WarehouseId = item.WarehouseId,
                    CreatedDate = DateTime.UtcNow
                });
            }
        }

        // Generate expiring soon alerts
        var expiringItems = await _context.Batches
            .Include(b => b.Product)
            .Where(b => b.ExpiryDate.HasValue && b.ExpiryDate <= DateTime.UtcNow.AddDays(30) && b.ExpiryDate > DateTime.UtcNow)
            .ToListAsync(ct);

        foreach (var item in expiringItems)
        {
            var daysToExpiry = (item.ExpiryDate!.Value - DateTime.UtcNow).Days;

            var existingAlert = await _context.Alerts
                .FirstOrDefaultAsync(a =>
                    a.Type == AlertType.ExpiryWarning &&
                    a.EntityType == "Batch" &&
                    a.EntityId == item.BatchId &&
                    !a.IsDismissed, ct);

            if (existingAlert == null)
            {
                _context.Alerts.Add(new Alert
                {
                    Type = AlertType.ExpiryWarning,
                    Severity = daysToExpiry <= 7 ? AlertSeverity.Critical : AlertSeverity.Warning,
                    Title = "Stock Expiring Soon",
                    Message = $"Batch {item.BatchNumber} of {item.Product?.Name} expires in {daysToExpiry} days",
                    EntityType = "Batch",
                    EntityId = item.BatchId,
                    ProductId = item.ProductId,
                    CreatedDate = DateTime.UtcNow
                });
            }
        }

        // Generate overdue PO alerts
        var overduePOs = await _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Where(p =>
                (p.Status == PurchaseOrderStatus.Approved || p.Status == PurchaseOrderStatus.PartiallyReceived) &&
                p.ExpectedDeliveryDate.HasValue &&
                p.ExpectedDeliveryDate < DateTime.UtcNow)
            .ToListAsync(ct);

        foreach (var po in overduePOs)
        {
            var daysOverdue = (DateTime.UtcNow - po.ExpectedDeliveryDate!.Value).Days;

            var existingAlert = await _context.Alerts
                .FirstOrDefaultAsync(a =>
                    a.Type == AlertType.POOverdue &&
                    a.EntityType == "PurchaseOrder" &&
                    a.EntityId == po.PurchaseOrderId &&
                    !a.IsDismissed, ct);

            if (existingAlert == null)
            {
                _context.Alerts.Add(new Alert
                {
                    Type = AlertType.POOverdue,
                    Severity = daysOverdue > 7 ? AlertSeverity.Critical : AlertSeverity.Warning,
                    Title = "Overdue Purchase Order",
                    Message = $"PO {po.PONumber} from {po.Supplier?.CompanyName} is {daysOverdue} days overdue",
                    EntityType = "PurchaseOrder",
                    EntityId = po.PurchaseOrderId,
                    SupplierId = po.SupplierId,
                    CreatedDate = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync(ct);
    }

    private AlertDto MapToDto(Alert alert)
    {
        return new AlertDto
        {
            AlertId = alert.AlertId,
            AlertType = alert.Type.ToString(),
            Severity = alert.Severity.ToString(),
            Title = alert.Title,
            Message = alert.Message,
            EntityType = alert.EntityType,
            EntityId = alert.EntityId,
            EntityReference = alert.EntityType + "-" + alert.EntityId,
            WarehouseId = alert.WarehouseId,
            WarehouseName = alert.Warehouse?.Name,
            IsRead = alert.IsRead,
            IsDismissed = alert.IsDismissed,
            SnoozedUntil = alert.SnoozeUntil,
            CreatedDate = alert.CreatedDate,
            AcknowledgedDate = alert.ReadDate,
            AcknowledgedBy = alert.ReadBy?.Username
        };
    }
}
