using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class ReportService : IReportService
{
    private readonly StockFlowDbContext _context;

    public ReportService(StockFlowDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(int? warehouseId = null, CancellationToken ct = default)
    {
        var stockLevelsQuery = _context.StockLevels.AsQueryable();
        if (warehouseId.HasValue)
            stockLevelsQuery = stockLevelsQuery.Where(s => s.WarehouseId == warehouseId.Value);

        var stockLevels = await stockLevelsQuery
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .ToListAsync(ct);

        var products = await _context.Products.Where(p => p.Status == Domain.Enums.ProductStatus.Active).ToListAsync(ct);
        var warehouses = await _context.Warehouses.Where(w => w.IsActive).ToListAsync(ct);
        var pendingPOs = await _context.PurchaseOrders.CountAsync(p => p.Status == Domain.Enums.PurchaseOrderStatus.Submitted || p.Status == Domain.Enums.PurchaseOrderStatus.Approved, ct);
        var alerts = await _context.Alerts.Where(a => !a.IsDismissed).ToListAsync(ct);

        var today = DateTime.UtcNow.Date;
        var todayMovements = await _context.StockMovements
            .Where(m => m.MovementDate.Date == today)
            .ToListAsync(ct);

        var last7Days = Enumerable.Range(0, 7)
            .Select(i => today.AddDays(-i))
            .Reverse()
            .ToList();

        var movementTrend = new List<MovementTrendDto>();
        foreach (var date in last7Days)
        {
            var dayMovements = await _context.StockMovements
                .Where(m => m.MovementDate.Date == date)
                .ToListAsync(ct);

            movementTrend.Add(new MovementTrendDto
            {
                Date = date,
                Inbound = dayMovements.Where(m => m.ToWarehouseId.HasValue && !m.FromWarehouseId.HasValue).Sum(m => m.Quantity),
                Outbound = dayMovements.Where(m => m.FromWarehouseId.HasValue && !m.ToWarehouseId.HasValue).Sum(m => m.Quantity)
            });
        }

        var inStock = stockLevels.Count(s => s.QuantityAvailable > s.Product.ReorderPoint);
        var lowStock = stockLevels.Count(s => s.QuantityAvailable > 0 && s.QuantityAvailable <= s.Product.ReorderPoint);
        var outOfStock = stockLevels.Count(s => s.QuantityAvailable <= 0);
        var overstocked = stockLevels.Count(s => s.QuantityAvailable > s.Product.MaxStockLevel);
        var total = Math.Max(inStock + lowStock + outOfStock + overstocked, 1);

        return new DashboardStatsDto
        {
            TotalInventoryValue = stockLevels.Sum(s => s.QuantityOnHand * (s.Product?.AverageCost ?? 0)),
            TotalProducts = products.Count,
            ActiveProducts = products.Count(p => p.Status == Domain.Enums.ProductStatus.Active),
            LowStockItems = lowStock,
            OutOfStockItems = outOfStock,
            OverstockedItems = overstocked,
            TotalWarehouses = warehouses.Count,
            PendingPurchaseOrders = pendingPOs,
            CriticalAlerts = alerts.Count(a => a.Severity == Domain.Enums.AlertSeverity.Critical),
            WarningAlerts = alerts.Count(a => a.Severity == Domain.Enums.AlertSeverity.Warning),
            InfoAlerts = alerts.Count(a => a.Severity == Domain.Enums.AlertSeverity.Info),
            TodayInboundQty = todayMovements.Where(m => m.ToWarehouseId.HasValue).Sum(m => m.Quantity),
            TodayOutboundQty = todayMovements.Where(m => m.FromWarehouseId.HasValue).Sum(m => m.Quantity),
            MovementTrend = movementTrend,
            StockHealth = new StockHealthDto
            {
                InStock = inStock,
                LowStock = lowStock,
                OutOfStock = outOfStock,
                Overstocked = overstocked,
                InStockPercent = (decimal)inStock / total * 100,
                LowStockPercent = (decimal)lowStock / total * 100,
                OutOfStockPercent = (decimal)outOfStock / total * 100,
                OverstockedPercent = (decimal)overstocked / total * 100
            },
            WarehouseUtilization = warehouses.Select(w => new WarehouseUtilizationDto
            {
                WarehouseId = w.WarehouseId,
                WarehouseName = w.Name,
                Capacity = w.TotalPalletPositions,
                Used = stockLevels.Where(s => s.WarehouseId == w.WarehouseId).Sum(s => s.QuantityOnHand),
                UtilizationPercent = w.TotalPalletPositions > 0
                    ? stockLevels.Where(s => s.WarehouseId == w.WarehouseId).Sum(s => s.QuantityOnHand) / w.TotalPalletPositions * 100
                    : 0
            }).ToList(),
            TopMovingProducts = await _context.StockMovements
                .Where(m => m.MovementDate >= today.AddDays(-30))
                .GroupBy(m => m.ProductId)
                .Select(g => new TopMovingProductDto
                {
                    ProductId = g.Key,
                    SKU = g.First().Product.SKU,
                    ProductName = g.First().Product.Name,
                    TotalMovement = g.Sum(m => Math.Abs(m.Quantity))
                })
                .OrderByDescending(p => p.TotalMovement)
                .Take(10)
                .ToListAsync(ct)
        };
    }

    public async Task<InventoryValuationReportDto> GetInventoryValuationAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var query = _context.StockLevels
            .Include(s => s.Product).ThenInclude(p => p.Category)
            .Include(s => s.Warehouse)
            .AsQueryable();

        if (filter.WarehouseId.HasValue)
            query = query.Where(s => s.WarehouseId == filter.WarehouseId.Value);
        if (filter.CategoryId.HasValue)
            query = query.Where(s => s.Product.CategoryId == filter.CategoryId.Value);
        if (!filter.IncludeZeroStock)
            query = query.Where(s => s.QuantityOnHand > 0);

        var items = await query.ToListAsync(ct);

        var totalValue = items.Sum(i => i.QuantityOnHand * (i.Product?.AverageCost ?? 0));

        return new InventoryValuationReportDto
        {
            ReportDate = DateTime.UtcNow,
            ValuationMethod = filter.ValuationMethod ?? "Average",
            TotalValue = totalValue,
            TotalProducts = items.Select(i => i.ProductId).Distinct().Count(),
            TotalWarehouses = items.Select(i => i.WarehouseId).Distinct().Count(),
            Items = items.Select(i => new InventoryValuationItemDto
            {
                ProductId = i.ProductId,
                SKU = i.Product?.SKU ?? "",
                ProductName = i.Product?.Name ?? "",
                CategoryName = i.Product?.Category?.Name ?? "",
                WarehouseName = i.Warehouse?.Name ?? "",
                QuantityOnHand = i.QuantityOnHand,
                UnitCost = i.Product?.AverageCost ?? 0,
                TotalValue = i.QuantityOnHand * (i.Product?.AverageCost ?? 0),
                LastPurchasePrice = i.Product?.LastPurchasePrice ?? 0,
                AverageCost = i.Product?.AverageCost ?? 0
            }).ToList(),
            ByWarehouse = items.GroupBy(i => i.Warehouse).Select(g => new ValuationByWarehouseDto
            {
                WarehouseId = g.Key?.WarehouseId ?? 0,
                WarehouseName = g.Key?.Name ?? "",
                TotalValue = g.Sum(i => i.QuantityOnHand * (i.Product?.AverageCost ?? 0)),
                ProductCount = g.Select(i => i.ProductId).Distinct().Count(),
                Percentage = totalValue > 0 ? g.Sum(i => i.QuantityOnHand * (i.Product?.AverageCost ?? 0)) / totalValue * 100 : 0
            }).ToList(),
            ByCategory = items.GroupBy(i => i.Product?.Category).Select(g => new ValuationByCategoryDto
            {
                CategoryId = g.Key?.CategoryId ?? 0,
                CategoryName = g.Key?.Name ?? "",
                TotalValue = g.Sum(i => i.QuantityOnHand * (i.Product?.AverageCost ?? 0)),
                ProductCount = g.Select(i => i.ProductId).Distinct().Count(),
                Percentage = totalValue > 0 ? g.Sum(i => i.QuantityOnHand * (i.Product?.AverageCost ?? 0)) / totalValue * 100 : 0
            }).ToList()
        };
    }

    public async Task<StockMovementReportDto> GetStockMovementReportAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var fromDate = filter.FromDate ?? DateTime.UtcNow.AddDays(-30);
        var toDate = filter.ToDate ?? DateTime.UtcNow;

        var query = _context.StockMovements
            .Include(m => m.Product)
            .Include(m => m.FromWarehouse)
            .Include(m => m.ToWarehouse)
            .Include(m => m.UOM)
            .Include(m => m.ReasonCode)
            .Include(m => m.CreatedBy)
            .Where(m => m.MovementDate >= fromDate && m.MovementDate <= toDate);

        if (filter.WarehouseId.HasValue)
            query = query.Where(m => m.FromWarehouseId == filter.WarehouseId || m.ToWarehouseId == filter.WarehouseId);
        if (filter.ProductId.HasValue)
            query = query.Where(m => m.ProductId == filter.ProductId.Value);

        var movements = await query.OrderByDescending(m => m.MovementDate).ToListAsync(ct);

        return new StockMovementReportDto
        {
            FromDate = fromDate,
            ToDate = toDate,
            TotalMovements = movements.Count,
            TotalInboundQty = movements.Where(m => m.ToWarehouseId.HasValue).Sum(m => m.Quantity),
            TotalOutboundQty = movements.Where(m => m.FromWarehouseId.HasValue).Sum(m => m.Quantity),
            TotalInboundValue = movements.Where(m => m.ToWarehouseId.HasValue).Sum(m => m.TotalCost),
            TotalOutboundValue = movements.Where(m => m.FromWarehouseId.HasValue).Sum(m => m.TotalCost),
            Movements = movements.Select(m => new StockMovementItemDto
            {
                MovementId = m.StockMovementId,
                MovementNumber = m.MovementNumber,
                MovementDate = m.MovementDate,
                MovementType = m.MovementType.ToString(),
                ProductSKU = m.Product?.SKU ?? "",
                ProductName = m.Product?.Name ?? "",
                FromWarehouse = m.FromWarehouse?.Name,
                ToWarehouse = m.ToWarehouse?.Name,
                Quantity = m.Quantity,
                UOM = m.UOM?.Symbol ?? "",
                UnitCost = m.UnitCost,
                TotalCost = m.TotalCost,
                ReferenceNumber = m.ReferenceNumber,
                ReasonCode = m.ReasonCode?.Name,
                CreatedBy = m.CreatedBy?.Username ?? ""
            }).ToList(),
            ByType = movements.GroupBy(m => m.MovementType).Select(g => new MovementByTypeDto
            {
                MovementType = g.Key.ToString(),
                Count = g.Count(),
                TotalQuantity = g.Sum(m => m.Quantity),
                TotalValue = g.Sum(m => m.TotalCost)
            }).ToList(),
            ByDate = movements.GroupBy(m => m.MovementDate.Date).Select(g => new MovementByDateDto
            {
                Date = g.Key,
                InboundQty = g.Where(m => m.ToWarehouseId.HasValue).Sum(m => m.Quantity),
                OutboundQty = g.Where(m => m.FromWarehouseId.HasValue).Sum(m => m.Quantity),
                InboundValue = g.Where(m => m.ToWarehouseId.HasValue).Sum(m => m.TotalCost),
                OutboundValue = g.Where(m => m.FromWarehouseId.HasValue).Sum(m => m.TotalCost)
            }).OrderBy(d => d.Date).ToList()
        };
    }

    public async Task<ReorderReportDto> GetReorderReportAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var query = _context.StockLevels
            .Include(s => s.Product).ThenInclude(p => p.Category)
            .Include(s => s.Product).ThenInclude(p => p.PreferredSupplier)
            .Include(s => s.Warehouse)
            .AsQueryable();

        if (filter.WarehouseId.HasValue)
            query = query.Where(s => s.WarehouseId == filter.WarehouseId.Value);

        var stockLevels = await query.ToListAsync(ct);

        var belowReorder = stockLevels
            .Where(s => s.QuantityAvailable <= s.Product.ReorderPoint)
            .GroupBy(s => s.ProductId)
            .Select(g => new
            {
                Product = g.First().Product,
                TotalAvailable = g.Sum(s => s.QuantityAvailable),
                StockLevel = g.First()
            })
            .Where(x => x.TotalAvailable <= x.Product.ReorderPoint)
            .ToList();

        var onOrder = await _context.PurchaseOrderLines
            .Include(l => l.PurchaseOrder)
            .Where(l => l.PurchaseOrder.Status == Domain.Enums.PurchaseOrderStatus.Approved || l.PurchaseOrder.Status == Domain.Enums.PurchaseOrderStatus.Submitted)
            .GroupBy(l => l.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(l => l.QuantityOrdered - l.QuantityReceived) })
            .ToDictionaryAsync(x => x.ProductId, x => x.Quantity, ct);

        var items = belowReorder.Select(x => new ReorderItemDto
        {
            ProductId = x.Product.ProductId,
            SKU = x.Product.SKU,
            ProductName = x.Product.Name,
            CategoryName = x.Product.Category?.Name ?? "",
            PreferredSupplier = x.Product.PreferredSupplier?.CompanyName,
            CurrentStock = x.TotalAvailable,
            ReorderPoint = x.Product.ReorderPoint,
            BelowReorderBy = x.Product.ReorderPoint - x.TotalAvailable,
            SafetyStock = x.Product.SafetyStock,
            ReorderQuantity = x.Product.ReorderQuantity,
            OnOrderQuantity = onOrder.GetValueOrDefault(x.Product.ProductId, 0),
            LeadTimeDays = x.Product.LeadTimeDays,
            SuggestedOrderQty = Math.Max(x.Product.ReorderQuantity, x.Product.ReorderPoint - x.TotalAvailable + x.Product.SafetyStock),
            EstimatedOrderValue = Math.Max(x.Product.ReorderQuantity, x.Product.ReorderPoint - x.TotalAvailable + x.Product.SafetyStock) * x.Product.LastPurchasePrice,
            Priority = x.TotalAvailable <= 0 ? "Critical" : x.TotalAvailable <= x.Product.SafetyStock ? "High" : "Normal"
        }).OrderByDescending(i => i.Priority == "Critical").ThenByDescending(i => i.Priority == "High").ToList();

        return new ReorderReportDto
        {
            ReportDate = DateTime.UtcNow,
            TotalItemsBelowReorderPoint = items.Count,
            TotalSuggestedOrderValue = items.Sum(i => i.EstimatedOrderValue),
            Items = items
        };
    }

    public async Task<ABCAnalysisReportDto> GetABCAnalysisAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var fromDate = filter.FromDate ?? DateTime.UtcNow.AddYears(-1);
        var toDate = filter.ToDate ?? DateTime.UtcNow;

        var movements = await _context.StockMovements
            .Include(m => m.Product).ThenInclude(p => p.Category)
            .Where(m => m.MovementDate >= fromDate && m.MovementDate <= toDate)
            .ToListAsync(ct);

        var productValues = movements
            .GroupBy(m => m.Product)
            .Select(g => new
            {
                Product = g.Key,
                AnnualValue = g.Sum(m => Math.Abs(m.TotalCost))
            })
            .OrderByDescending(x => x.AnnualValue)
            .ToList();

        var totalValue = productValues.Sum(x => x.AnnualValue);
        var runningTotal = 0m;

        var items = productValues.Select(x =>
        {
            runningTotal += x.AnnualValue;
            var cumPercent = totalValue > 0 ? runningTotal / totalValue * 100 : 0;
            var classification = cumPercent <= 80 ? "A" : cumPercent <= 95 ? "B" : "C";

            return new ABCItemDto
            {
                ProductId = x.Product.ProductId,
                SKU = x.Product.SKU,
                ProductName = x.Product.Name,
                CategoryName = x.Product.Category?.Name ?? "",
                AnnualValue = x.AnnualValue,
                CumulativePercentage = cumPercent,
                Classification = classification,
                CurrentClassification = x.Product.ABCClassification ?? "",
                NeedsReclassification = x.Product.ABCClassification != classification
            };
        }).ToList();

        var classA = items.Where(i => i.Classification == "A").ToList();
        var classB = items.Where(i => i.Classification == "B").ToList();
        var classC = items.Where(i => i.Classification == "C").ToList();

        return new ABCAnalysisReportDto
        {
            ReportDate = DateTime.UtcNow,
            AnalysisCriteria = "Value",
            TotalProducts = items.Count,
            TotalValue = totalValue,
            ClassA = new ABCClassSummaryDto
            {
                Classification = "A",
                ProductCount = classA.Count,
                ProductPercentage = items.Count > 0 ? (decimal)classA.Count / items.Count * 100 : 0,
                TotalValue = classA.Sum(i => i.AnnualValue),
                ValuePercentage = totalValue > 0 ? classA.Sum(i => i.AnnualValue) / totalValue * 100 : 0
            },
            ClassB = new ABCClassSummaryDto
            {
                Classification = "B",
                ProductCount = classB.Count,
                ProductPercentage = items.Count > 0 ? (decimal)classB.Count / items.Count * 100 : 0,
                TotalValue = classB.Sum(i => i.AnnualValue),
                ValuePercentage = totalValue > 0 ? classB.Sum(i => i.AnnualValue) / totalValue * 100 : 0
            },
            ClassC = new ABCClassSummaryDto
            {
                Classification = "C",
                ProductCount = classC.Count,
                ProductPercentage = items.Count > 0 ? (decimal)classC.Count / items.Count * 100 : 0,
                TotalValue = classC.Sum(i => i.AnnualValue),
                ValuePercentage = totalValue > 0 ? classC.Sum(i => i.AnnualValue) / totalValue * 100 : 0
            },
            Items = items
        };
    }

    public async Task<SupplierPerformanceReportDto> GetSupplierPerformanceAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var fromDate = filter.FromDate ?? DateTime.UtcNow.AddMonths(-12);
        var toDate = filter.ToDate ?? DateTime.UtcNow;

        var suppliers = await _context.Suppliers
            .Where(s => s.Status == Domain.Enums.SupplierStatus.Active)
            .ToListAsync(ct);

        var pos = await _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Where(p => p.OrderDate >= fromDate && p.OrderDate <= toDate)
            .ToListAsync(ct);

        var grns = await _context.GoodsReceipts
            .Include(g => g.PurchaseOrder)
            .Where(g => g.ReceiptDate >= fromDate && g.ReceiptDate <= toDate)
            .ToListAsync(ct);

        var items = suppliers.Select((s, index) =>
        {
            var supplierPOs = pos.Where(p => p.SupplierId == s.SupplierId).ToList();
            var supplierGRNs = grns.Where(g => g.PurchaseOrder?.SupplierId == s.SupplierId).ToList();

            var onTimeCount = supplierPOs.Count(p => p.ActualDeliveryDate.HasValue && p.ExpectedDeliveryDate.HasValue && p.ActualDeliveryDate <= p.ExpectedDeliveryDate);
            var deliveredCount = supplierPOs.Count(p => p.ActualDeliveryDate.HasValue);

            return new SupplierPerformanceItemDto
            {
                SupplierId = s.SupplierId,
                SupplierCode = s.SupplierCode,
                SupplierName = s.CompanyName,
                TotalOrders = supplierPOs.Count,
                TotalValue = supplierPOs.Sum(p => p.TotalAmount),
                OnTimeDeliveryRate = deliveredCount > 0 ? (decimal)onTimeCount / deliveredCount * 100 : 100,
                QualityAcceptanceRate = 98, // Placeholder
                AverageLeadTimeDays = s.DefaultLeadTimeDays,
                OverallScore = 85 + index, // Placeholder calculation
                Ranking = index + 1
            };
        })
        .OrderByDescending(s => s.OverallScore)
        .ToList();

        for (int i = 0; i < items.Count; i++)
            items[i].Ranking = i + 1;

        return new SupplierPerformanceReportDto
        {
            FromDate = fromDate,
            ToDate = toDate,
            TotalSuppliers = items.Count,
            Suppliers = items
        };
    }

    public async Task<AgingAnalysisReportDto> GetAgingAnalysisAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var stockLevels = await _context.StockLevels
            .Include(s => s.Product)
            .Where(s => s.QuantityOnHand > 0)
            .ToListAsync(ct);

        var today = DateTime.UtcNow;

        var items = stockLevels.Select(s =>
        {
            var daysSince = (int)(today - s.LastMovementDate).TotalDays;
            var bucket = daysSince <= 30 ? "0-30" : daysSince <= 60 ? "31-60" : daysSince <= 90 ? "61-90" : daysSince <= 180 ? "91-180" : daysSince <= 365 ? "181-365" : "Over 365";
            var risk = daysSince > 365 ? "High" : daysSince > 180 ? "Medium" : "Low";

            return new AgingItemDto
            {
                ProductId = s.ProductId,
                SKU = s.Product?.SKU ?? "",
                ProductName = s.Product?.Name ?? "",
                QuantityOnHand = s.QuantityOnHand,
                TotalValue = s.QuantityOnHand * (s.Product?.AverageCost ?? 0),
                LastMovementDate = s.LastMovementDate,
                DaysSinceLastMovement = daysSince,
                AgingBucket = bucket,
                ObsolescenceRisk = risk
            };
        }).ToList();

        var totalValue = items.Sum(i => i.TotalValue);

        AgingBucketSummaryDto CreateBucket(string name, Func<AgingItemDto, bool> predicate)
        {
            var bucketItems = items.Where(predicate).ToList();
            return new AgingBucketSummaryDto
            {
                BucketName = name,
                ProductCount = bucketItems.Count,
                TotalQuantity = bucketItems.Sum(i => i.QuantityOnHand),
                TotalValue = bucketItems.Sum(i => i.TotalValue),
                Percentage = totalValue > 0 ? bucketItems.Sum(i => i.TotalValue) / totalValue * 100 : 0
            };
        }

        return new AgingAnalysisReportDto
        {
            ReportDate = DateTime.UtcNow,
            TotalInventoryValue = totalValue,
            Bucket0To30 = CreateBucket("0-30 Days", i => i.DaysSinceLastMovement <= 30),
            Bucket31To60 = CreateBucket("31-60 Days", i => i.DaysSinceLastMovement > 30 && i.DaysSinceLastMovement <= 60),
            Bucket61To90 = CreateBucket("61-90 Days", i => i.DaysSinceLastMovement > 60 && i.DaysSinceLastMovement <= 90),
            Bucket91To180 = CreateBucket("91-180 Days", i => i.DaysSinceLastMovement > 90 && i.DaysSinceLastMovement <= 180),
            Bucket181To365 = CreateBucket("181-365 Days", i => i.DaysSinceLastMovement > 180 && i.DaysSinceLastMovement <= 365),
            BucketOver365 = CreateBucket("Over 365 Days", i => i.DaysSinceLastMovement > 365),
            Items = items.OrderByDescending(i => i.DaysSinceLastMovement).ToList()
        };
    }

    public async Task<StockOnHandReportDto> GetStockOnHandAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var query = _context.StockLevels
            .Include(s => s.Product).ThenInclude(p => p.Category)
            .Include(s => s.Warehouse)
            .AsQueryable();

        if (filter.WarehouseId.HasValue)
            query = query.Where(s => s.WarehouseId == filter.WarehouseId.Value);
        if (filter.CategoryId.HasValue)
            query = query.Where(s => s.Product.CategoryId == filter.CategoryId.Value);
        if (!filter.IncludeZeroStock)
            query = query.Where(s => s.QuantityOnHand > 0);

        var stockLevels = await query.ToListAsync(ct);

        var items = stockLevels.Select(s =>
        {
            var status = s.QuantityAvailable <= 0 ? "Out of Stock" :
                         s.QuantityAvailable <= s.Product.ReorderPoint ? "Low Stock" :
                         s.QuantityAvailable > s.Product.MaxStockLevel ? "Overstocked" : "In Stock";

            return new StockOnHandItemDto
            {
                ProductId = s.ProductId,
                SKU = s.Product?.SKU ?? "",
                ProductName = s.Product?.Name ?? "",
                CategoryName = s.Product?.Category?.Name ?? "",
                WarehouseName = s.Warehouse?.Name ?? "",
                QuantityOnHand = s.QuantityOnHand,
                QuantityReserved = s.QuantityReserved,
                QuantityAvailable = s.QuantityAvailable,
                UnitCost = s.Product?.AverageCost ?? 0,
                TotalValue = s.QuantityOnHand * (s.Product?.AverageCost ?? 0),
                StockStatus = status
            };
        }).ToList();

        return new StockOnHandReportDto
        {
            ReportDate = DateTime.UtcNow,
            TotalProducts = items.Select(i => i.ProductId).Distinct().Count(),
            TotalQuantity = items.Sum(i => i.QuantityOnHand),
            TotalValue = items.Sum(i => i.TotalValue),
            Items = items
        };
    }
}
