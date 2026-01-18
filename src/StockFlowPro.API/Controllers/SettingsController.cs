using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Settings;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : BaseApiController
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    /// <summary>
    /// Get all system settings
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<SystemSettingsDto>>> GetAllSettings(CancellationToken cancellationToken)
    {
        var settings = await _settingsService.GetAllSettingsAsync(cancellationToken);
        return OkResponse(settings);
    }

    /// <summary>
    /// Get company settings
    /// </summary>
    [HttpGet("company")]
    public async Task<ActionResult<ApiResponse<CompanySettingsDto>>> GetCompanySettings(CancellationToken cancellationToken)
    {
        var settings = await _settingsService.GetCompanySettingsAsync(cancellationToken);
        return OkResponse(settings);
    }

    /// <summary>
    /// Get inventory settings
    /// </summary>
    [HttpGet("inventory")]
    public async Task<ActionResult<ApiResponse<InventorySettingsDto>>> GetInventorySettings(CancellationToken cancellationToken)
    {
        var settings = await _settingsService.GetInventorySettingsAsync(cancellationToken);
        return OkResponse(settings);
    }

    /// <summary>
    /// Get alert settings
    /// </summary>
    [HttpGet("alerts")]
    public async Task<ActionResult<ApiResponse<AlertSettingsDto>>> GetAlertSettings(CancellationToken cancellationToken)
    {
        var settings = await _settingsService.GetAlertSettingsAsync(cancellationToken);
        return OkResponse(settings);
    }

    /// <summary>
    /// Update company settings
    /// </summary>
    [HttpPut("company")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateCompanySettings(
        [FromBody] UpdateCompanySettingsDto dto,
        CancellationToken cancellationToken)
    {
        await _settingsService.UpdateCompanySettingsAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Company settings updated successfully.");
    }

    /// <summary>
    /// Update inventory settings
    /// </summary>
    [HttpPut("inventory")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateInventorySettings(
        [FromBody] UpdateInventorySettingsDto dto,
        CancellationToken cancellationToken)
    {
        await _settingsService.UpdateInventorySettingsAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Inventory settings updated successfully.");
    }

    /// <summary>
    /// Update alert settings
    /// </summary>
    [HttpPut("alerts")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateAlertSettings(
        [FromBody] UpdateAlertSettingsDto dto,
        CancellationToken cancellationToken)
    {
        await _settingsService.UpdateAlertSettingsAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Alert settings updated successfully.");
    }

    /// <summary>
    /// Generate next number in series
    /// </summary>
    [HttpPost("number-series/{seriesType}")]
    public async Task<ActionResult<ApiResponse<string>>> GenerateNextNumber(
        string seriesType,
        CancellationToken cancellationToken)
    {
        var number = await _settingsService.GenerateNextNumberAsync(seriesType, cancellationToken);
        return OkResponse(number);
    }
}
