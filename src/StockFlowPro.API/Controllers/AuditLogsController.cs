using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.AuditLog;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditLogsController : BaseApiController
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// Get paginated list of audit logs
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<AuditLogListDto>>>> GetAuditLogs(
        [FromQuery] AuditLogFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _auditLogService.GetPagedAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get audit log by ID
    /// </summary>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiResponse<AuditLogDetailDto>>> GetAuditLog(long id, CancellationToken cancellationToken)
    {
        var log = await _auditLogService.GetByIdAsync(id, cancellationToken);
        if (log == null)
        {
            return NotFoundResponse<AuditLogDetailDto>($"Audit log with ID {id} not found.");
        }
        return OkResponse(log);
    }

    /// <summary>
    /// Get audit history for a specific entity
    /// </summary>
    [HttpGet("entity/{entityType}/{entityId:int}")]
    public async Task<ActionResult<ApiResponse<EntityAuditHistoryDto>>> GetEntityHistory(
        string entityType,
        int entityId,
        CancellationToken cancellationToken)
    {
        var history = await _auditLogService.GetEntityHistoryAsync(entityType, entityId, cancellationToken);
        return OkResponse(history);
    }

    /// <summary>
    /// Get audit summary for a date range
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<AuditSummaryDto>>> GetAuditSummary(
        [FromQuery] DateTime fromDate,
        [FromQuery] DateTime toDate,
        CancellationToken cancellationToken)
    {
        var summary = await _auditLogService.GetSummaryAsync(fromDate, toDate, cancellationToken);
        return OkResponse(summary);
    }
}
