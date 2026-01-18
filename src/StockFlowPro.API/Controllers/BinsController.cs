using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Zones;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BinsController : BaseApiController
{
    private readonly IBinService _binService;

    public BinsController(IBinService binService)
    {
        _binService = binService;
    }

    /// <summary>
    /// Get bins by zone
    /// </summary>
    [HttpGet("zone/{zoneId:int}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BinListDto>>>> GetBinsByZone(
        int zoneId,
        CancellationToken cancellationToken)
    {
        var bins = await _binService.GetByZoneAsync(zoneId, cancellationToken);
        return OkResponse(bins);
    }

    /// <summary>
    /// Get bins by warehouse
    /// </summary>
    [HttpGet("warehouse/{warehouseId:int}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BinListDto>>>> GetBinsByWarehouse(
        int warehouseId,
        CancellationToken cancellationToken)
    {
        var bins = await _binService.GetByWarehouseAsync(warehouseId, cancellationToken);
        return OkResponse(bins);
    }

    /// <summary>
    /// Get bin by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<BinDto>>> GetBin(int id, CancellationToken cancellationToken)
    {
        var bin = await _binService.GetByIdAsync(id, cancellationToken);
        if (bin == null)
        {
            return NotFoundResponse<BinDto>($"Bin with ID {id} not found.");
        }
        return OkResponse(bin);
    }

    /// <summary>
    /// Get bin contents
    /// </summary>
    [HttpGet("{id:int}/contents")]
    public async Task<ActionResult<ApiResponse<BinContentsDto>>> GetBinContents(int id, CancellationToken cancellationToken)
    {
        var contents = await _binService.GetContentsAsync(id, cancellationToken);
        return OkResponse(contents);
    }

    /// <summary>
    /// Create a new bin
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<BinDto>>> CreateBin(
        [FromBody] CreateBinDto dto,
        CancellationToken cancellationToken)
    {
        var bin = await _binService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(bin, nameof(GetBin), new { id = bin.BinId });
    }

    /// <summary>
    /// Bulk create bins
    /// </summary>
    [HttpPost("bulk")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BinDto>>>> BulkCreateBins(
        [FromBody] BulkCreateBinsDto dto,
        CancellationToken cancellationToken)
    {
        var bins = await _binService.BulkCreateAsync(dto, cancellationToken);
        return OkResponse(bins, $"Created {bins.Count} bins successfully.");
    }

    /// <summary>
    /// Update a bin
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<BinDto>>> UpdateBin(
        int id,
        [FromBody] UpdateBinDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.BinId)
        {
            return BadRequestResponse<BinDto>("ID mismatch between route and body.");
        }

        var bin = await _binService.UpdateAsync(dto, cancellationToken);
        return OkResponse(bin, "Bin updated successfully.");
    }

    /// <summary>
    /// Delete a bin
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBin(int id, CancellationToken cancellationToken)
    {
        await _binService.DeleteAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Bin deleted successfully.");
    }
}
