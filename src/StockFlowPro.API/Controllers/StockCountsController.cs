using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.StockCount;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockCountsController : BaseApiController
{
    private readonly IStockCountService _stockCountService;

    public StockCountsController(IStockCountService stockCountService)
    {
        _stockCountService = stockCountService;
    }

    /// <summary>
    /// Get paginated list of stock counts
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<StockCountListDto>>>> GetStockCounts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? warehouseId = null,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _stockCountService.GetPagedAsync(pageNumber, pageSize, warehouseId, status, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get stock count by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<StockCountDto>>> GetStockCount(int id, CancellationToken cancellationToken)
    {
        var count = await _stockCountService.GetByIdAsync(id, cancellationToken);
        if (count == null)
        {
            return NotFoundResponse<StockCountDto>($"Stock Count with ID {id} not found.");
        }
        return OkResponse(count);
    }

    /// <summary>
    /// Get stock count summary
    /// </summary>
    [HttpGet("{id:int}/summary")]
    public async Task<ActionResult<ApiResponse<StockCountSummaryDto>>> GetStockCountSummary(int id, CancellationToken cancellationToken)
    {
        var summary = await _stockCountService.GetSummaryAsync(id, cancellationToken);
        return OkResponse(summary);
    }

    /// <summary>
    /// Create a new stock count
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<StockCountDto>>> CreateStockCount(
        [FromBody] CreateStockCountDto dto,
        CancellationToken cancellationToken)
    {
        var count = await _stockCountService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(count, nameof(GetStockCount), new { id = count.StockCountId });
    }

    /// <summary>
    /// Update a stock count line (record count)
    /// </summary>
    [HttpPut("lines/{lineId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateStockCountLine(
        int lineId,
        [FromBody] UpdateStockCountLineDto dto,
        CancellationToken cancellationToken)
    {
        if (lineId != dto.StockCountLineId)
        {
            return BadRequestResponse<object>("ID mismatch between route and body.");
        }

        await _stockCountService.UpdateLineAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Stock count line updated successfully.");
    }

    /// <summary>
    /// Post a stock count (finalize and create adjustments)
    /// </summary>
    [HttpPost("{id:int}/post")]
    public async Task<ActionResult<ApiResponse<object>>> PostStockCount(
        int id,
        [FromBody] PostStockCountDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.StockCountId)
        {
            return BadRequestResponse<object>("ID mismatch between route and body.");
        }

        await _stockCountService.PostAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Stock count posted successfully. Stock adjustments have been created.");
    }

    /// <summary>
    /// Cancel a stock count
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ApiResponse<object>>> CancelStockCount(int id, CancellationToken cancellationToken)
    {
        await _stockCountService.CancelAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Stock count cancelled successfully.");
    }
}
