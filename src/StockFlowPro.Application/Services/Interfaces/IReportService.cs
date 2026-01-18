using StockFlowPro.Application.DTOs.Reports;

namespace StockFlowPro.Application.Services.Interfaces;

public interface IReportService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync(int? warehouseId = null, CancellationToken ct = default);
    Task<InventoryValuationReportDto> GetInventoryValuationAsync(ReportFilterDto filter, CancellationToken ct = default);
    Task<StockMovementReportDto> GetStockMovementReportAsync(ReportFilterDto filter, CancellationToken ct = default);
    Task<ReorderReportDto> GetReorderReportAsync(ReportFilterDto filter, CancellationToken ct = default);
    Task<ABCAnalysisReportDto> GetABCAnalysisAsync(ReportFilterDto filter, CancellationToken ct = default);
    Task<SupplierPerformanceReportDto> GetSupplierPerformanceAsync(ReportFilterDto filter, CancellationToken ct = default);
    Task<AgingAnalysisReportDto> GetAgingAnalysisAsync(ReportFilterDto filter, CancellationToken ct = default);
    Task<StockOnHandReportDto> GetStockOnHandAsync(ReportFilterDto filter, CancellationToken ct = default);
}

public interface IGoodsReceiptService
{
    Task<DTOs.GoodsReceipt.GoodsReceiptDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<DTOs.Common.PaginatedResponse<DTOs.GoodsReceipt.GoodsReceiptListDto>> GetPagedAsync(int pageNumber, int pageSize, int? poId, int? supplierId, DateTime? fromDate, DateTime? toDate, CancellationToken ct = default);
    Task<IReadOnlyList<DTOs.GoodsReceipt.PendingReceiptDto>> GetPendingReceiptsAsync(int? supplierId, CancellationToken ct = default);
    Task<DTOs.GoodsReceipt.GoodsReceiptDto> CreateAsync(DTOs.GoodsReceipt.CreateGoodsReceiptDto dto, CancellationToken ct = default);
    Task PostAsync(int id, CancellationToken ct = default);
}

public interface IStockCountService
{
    Task<DTOs.StockCount.StockCountDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<DTOs.Common.PaginatedResponse<DTOs.StockCount.StockCountListDto>> GetPagedAsync(int pageNumber, int pageSize, int? warehouseId, string? status, CancellationToken ct = default);
    Task<DTOs.StockCount.StockCountDto> CreateAsync(DTOs.StockCount.CreateStockCountDto dto, CancellationToken ct = default);
    Task UpdateLineAsync(DTOs.StockCount.UpdateStockCountLineDto dto, CancellationToken ct = default);
    Task<DTOs.StockCount.StockCountSummaryDto> GetSummaryAsync(int id, CancellationToken ct = default);
    Task PostAsync(DTOs.StockCount.PostStockCountDto dto, CancellationToken ct = default);
    Task CancelAsync(int id, CancellationToken ct = default);
}

public interface ITransferService
{
    Task<DTOs.Transfer.TransferDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<DTOs.Common.PaginatedResponse<DTOs.Transfer.TransferListDto>> GetPagedAsync(int pageNumber, int pageSize, int? sourceWarehouseId, int? destWarehouseId, string? status, CancellationToken ct = default);
    Task<DTOs.Transfer.TransferDto> CreateAsync(DTOs.Transfer.CreateTransferDto dto, CancellationToken ct = default);
    Task ApproveAsync(DTOs.Transfer.ApproveTransferDto dto, CancellationToken ct = default);
    Task RejectAsync(int id, string? reason, CancellationToken ct = default);
    Task ShipAsync(DTOs.Transfer.ShipTransferDto dto, CancellationToken ct = default);
    Task ReceiveAsync(DTOs.Transfer.ReceiveTransferDto dto, CancellationToken ct = default);
    Task CancelAsync(int id, string? reason, CancellationToken ct = default);
}

public interface IAlertService
{
    Task<DTOs.Alerts.AlertDto?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<DTOs.Common.PaginatedResponse<DTOs.Alerts.AlertListDto>> GetPagedAsync(DTOs.Alerts.AlertFilterDto filter, CancellationToken ct = default);
    Task<DTOs.Alerts.AlertSummaryDto> GetSummaryAsync(CancellationToken ct = default);
    Task AcknowledgeAsync(DTOs.Alerts.AcknowledgeAlertDto dto, CancellationToken ct = default);
    Task DismissAsync(long id, CancellationToken ct = default);
    Task SnoozeAsync(DTOs.Alerts.SnoozeAlertDto dto, CancellationToken ct = default);
    Task MarkAsReadAsync(long id, CancellationToken ct = default);
    Task BulkActionAsync(DTOs.Alerts.BulkAlertActionDto dto, CancellationToken ct = default);
    Task GenerateAlertsAsync(CancellationToken ct = default);
}

public interface IZoneService
{
    Task<DTOs.Zones.ZoneDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<DTOs.Zones.ZoneListDto>> GetByWarehouseAsync(int warehouseId, CancellationToken ct = default);
    Task<DTOs.Zones.ZoneDto> CreateAsync(DTOs.Zones.CreateZoneDto dto, CancellationToken ct = default);
    Task<DTOs.Zones.ZoneDto> UpdateAsync(DTOs.Zones.UpdateZoneDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}

public interface IBinService
{
    Task<DTOs.Zones.BinDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<DTOs.Zones.BinListDto>> GetByZoneAsync(int zoneId, CancellationToken ct = default);
    Task<IReadOnlyList<DTOs.Zones.BinListDto>> GetByWarehouseAsync(int warehouseId, CancellationToken ct = default);
    Task<DTOs.Zones.BinContentsDto> GetContentsAsync(int id, CancellationToken ct = default);
    Task<DTOs.Zones.BinDto> CreateAsync(DTOs.Zones.CreateBinDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<DTOs.Zones.BinDto>> BulkCreateAsync(DTOs.Zones.BulkCreateBinsDto dto, CancellationToken ct = default);
    Task<DTOs.Zones.BinDto> UpdateAsync(DTOs.Zones.UpdateBinDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}

public interface ISettingsService
{
    Task<DTOs.Settings.SystemSettingsDto> GetAllSettingsAsync(CancellationToken ct = default);
    Task<DTOs.Settings.CompanySettingsDto> GetCompanySettingsAsync(CancellationToken ct = default);
    Task<DTOs.Settings.InventorySettingsDto> GetInventorySettingsAsync(CancellationToken ct = default);
    Task<DTOs.Settings.AlertSettingsDto> GetAlertSettingsAsync(CancellationToken ct = default);
    Task UpdateCompanySettingsAsync(DTOs.Settings.UpdateCompanySettingsDto dto, CancellationToken ct = default);
    Task UpdateInventorySettingsAsync(DTOs.Settings.UpdateInventorySettingsDto dto, CancellationToken ct = default);
    Task UpdateAlertSettingsAsync(DTOs.Settings.UpdateAlertSettingsDto dto, CancellationToken ct = default);
    Task<string> GenerateNextNumberAsync(string seriesType, CancellationToken ct = default);
}

public interface IAuditLogService
{
    Task<DTOs.AuditLog.AuditLogDetailDto?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<DTOs.Common.PaginatedResponse<DTOs.AuditLog.AuditLogListDto>> GetPagedAsync(DTOs.AuditLog.AuditLogFilterDto filter, CancellationToken ct = default);
    Task<DTOs.AuditLog.EntityAuditHistoryDto> GetEntityHistoryAsync(string entityType, int entityId, CancellationToken ct = default);
    Task<DTOs.AuditLog.AuditSummaryDto> GetSummaryAsync(DateTime fromDate, DateTime toDate, CancellationToken ct = default);
    Task LogAsync(string entityType, int entityId, string action, object? oldValues, object? newValues, CancellationToken ct = default);
}
