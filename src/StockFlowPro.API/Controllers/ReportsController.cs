using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Reports;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : BaseApiController
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetDashboardStats(
        [FromQuery] int? warehouseId,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetDashboardStatsAsync(warehouseId, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get inventory valuation report
    /// </summary>
    [HttpGet("inventory-valuation")]
    public async Task<ActionResult<ApiResponse<InventoryValuationReportDto>>> GetInventoryValuation(
        [FromQuery] ReportFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetInventoryValuationAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get stock movement report
    /// </summary>
    [HttpGet("stock-movement")]
    public async Task<ActionResult<ApiResponse<StockMovementReportDto>>> GetStockMovement(
        [FromQuery] ReportFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetStockMovementReportAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get reorder report
    /// </summary>
    [HttpGet("reorder")]
    public async Task<ActionResult<ApiResponse<ReorderReportDto>>> GetReorderReport(
        [FromQuery] ReportFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetReorderReportAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get ABC analysis report
    /// </summary>
    [HttpGet("abc-analysis")]
    public async Task<ActionResult<ApiResponse<ABCAnalysisReportDto>>> GetABCAnalysis(
        [FromQuery] ReportFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetABCAnalysisAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get supplier performance report
    /// </summary>
    [HttpGet("supplier-performance")]
    public async Task<ActionResult<ApiResponse<SupplierPerformanceReportDto>>> GetSupplierPerformance(
        [FromQuery] ReportFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetSupplierPerformanceAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get aging analysis report
    /// </summary>
    [HttpGet("aging-analysis")]
    public async Task<ActionResult<ApiResponse<AgingAnalysisReportDto>>> GetAgingAnalysis(
        [FromQuery] ReportFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetAgingAnalysisAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get stock on hand report
    /// </summary>
    [HttpGet("stock-on-hand")]
    public async Task<ActionResult<ApiResponse<StockOnHandReportDto>>> GetStockOnHand(
        [FromQuery] ReportFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _reportService.GetStockOnHandAsync(filter, cancellationToken);
        return OkResponse(result);
    }
}
