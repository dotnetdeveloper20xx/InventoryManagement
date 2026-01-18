using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Alerts;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : BaseApiController
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    /// <summary>
    /// Get paginated list of alerts
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<AlertListDto>>>> GetAlerts(
        [FromQuery] AlertFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _alertService.GetPagedAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get alert by ID
    /// </summary>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiResponse<AlertDto>>> GetAlert(long id, CancellationToken cancellationToken)
    {
        var alert = await _alertService.GetByIdAsync(id, cancellationToken);
        if (alert == null)
        {
            return NotFoundResponse<AlertDto>($"Alert with ID {id} not found.");
        }
        return OkResponse(alert);
    }

    /// <summary>
    /// Get alert summary (counts by type, severity, etc.)
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<AlertSummaryDto>>> GetAlertSummary(CancellationToken cancellationToken)
    {
        var summary = await _alertService.GetSummaryAsync(cancellationToken);
        return OkResponse(summary);
    }

    /// <summary>
    /// Acknowledge an alert
    /// </summary>
    [HttpPost("{id:long}/acknowledge")]
    public async Task<ActionResult<ApiResponse<object>>> AcknowledgeAlert(
        long id,
        [FromBody] AcknowledgeAlertDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.AlertId)
        {
            return BadRequestResponse<object>("ID mismatch between route and body.");
        }

        await _alertService.AcknowledgeAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Alert acknowledged successfully.");
    }

    /// <summary>
    /// Dismiss an alert
    /// </summary>
    [HttpPost("{id:long}/dismiss")]
    public async Task<ActionResult<ApiResponse<object>>> DismissAlert(long id, CancellationToken cancellationToken)
    {
        await _alertService.DismissAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Alert dismissed successfully.");
    }

    /// <summary>
    /// Snooze an alert
    /// </summary>
    [HttpPost("{id:long}/snooze")]
    public async Task<ActionResult<ApiResponse<object>>> SnoozeAlert(
        long id,
        [FromBody] SnoozeAlertDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.AlertId)
        {
            return BadRequestResponse<object>("ID mismatch between route and body.");
        }

        await _alertService.SnoozeAsync(dto, cancellationToken);
        return OkResponse<object>(null!, $"Alert snoozed for {dto.SnoozeMinutes} minutes.");
    }

    /// <summary>
    /// Mark an alert as read
    /// </summary>
    [HttpPost("{id:long}/read")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsRead(long id, CancellationToken cancellationToken)
    {
        await _alertService.MarkAsReadAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Alert marked as read.");
    }

    /// <summary>
    /// Perform bulk action on alerts
    /// </summary>
    [HttpPost("bulk")]
    public async Task<ActionResult<ApiResponse<object>>> BulkAction(
        [FromBody] BulkAlertActionDto dto,
        CancellationToken cancellationToken)
    {
        await _alertService.BulkActionAsync(dto, cancellationToken);
        return OkResponse<object>(null!, $"Bulk action '{dto.Action}' applied to {dto.AlertIds.Count} alerts.");
    }

    /// <summary>
    /// Generate alerts (trigger alert generation process)
    /// </summary>
    [HttpPost("generate")]
    public async Task<ActionResult<ApiResponse<object>>> GenerateAlerts(CancellationToken cancellationToken)
    {
        await _alertService.GenerateAlertsAsync(cancellationToken);
        return OkResponse<object>(null!, "Alert generation completed.");
    }
}
