using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Zones;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ZonesController : BaseApiController
{
    private readonly IZoneService _zoneService;

    public ZonesController(IZoneService zoneService)
    {
        _zoneService = zoneService;
    }

    /// <summary>
    /// Get zones by warehouse
    /// </summary>
    [HttpGet("warehouse/{warehouseId:int}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ZoneListDto>>>> GetZonesByWarehouse(
        int warehouseId,
        CancellationToken cancellationToken)
    {
        var zones = await _zoneService.GetByWarehouseAsync(warehouseId, cancellationToken);
        return OkResponse(zones);
    }

    /// <summary>
    /// Get zone by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ZoneDto>>> GetZone(int id, CancellationToken cancellationToken)
    {
        var zone = await _zoneService.GetByIdAsync(id, cancellationToken);
        if (zone == null)
        {
            return NotFoundResponse<ZoneDto>($"Zone with ID {id} not found.");
        }
        return OkResponse(zone);
    }

    /// <summary>
    /// Create a new zone
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ZoneDto>>> CreateZone(
        [FromBody] CreateZoneDto dto,
        CancellationToken cancellationToken)
    {
        var zone = await _zoneService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(zone, nameof(GetZone), new { id = zone.ZoneId });
    }

    /// <summary>
    /// Update a zone
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ZoneDto>>> UpdateZone(
        int id,
        [FromBody] UpdateZoneDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.ZoneId)
        {
            return BadRequestResponse<ZoneDto>("ID mismatch between route and body.");
        }

        var zone = await _zoneService.UpdateAsync(dto, cancellationToken);
        return OkResponse(zone, "Zone updated successfully.");
    }

    /// <summary>
    /// Delete a zone
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteZone(int id, CancellationToken cancellationToken)
    {
        await _zoneService.DeleteAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Zone deleted successfully.");
    }
}
