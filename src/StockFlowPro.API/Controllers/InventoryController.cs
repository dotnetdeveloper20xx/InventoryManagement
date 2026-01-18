using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Inventory;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : BaseApiController
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    /// <summary>
    /// Get paginated stock levels
    /// </summary>
    [HttpGet("stock-levels")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<StockLevelDto>>>> GetStockLevels(
        [FromQuery] StockLevelFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _inventoryService.GetStockLevelsAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get stock level for a specific product and warehouse
    /// </summary>
    [HttpGet("stock-levels/product/{productId:int}/warehouse/{warehouseId:int}")]
    public async Task<ActionResult<ApiResponse<StockLevelDto>>> GetStockLevel(
        int productId,
        int warehouseId,
        CancellationToken cancellationToken)
    {
        var stockLevel = await _inventoryService.GetStockLevelAsync(productId, warehouseId, cancellationToken);
        if (stockLevel == null)
        {
            return NotFoundResponse<StockLevelDto>($"Stock level not found for product {productId} in warehouse {warehouseId}.");
        }
        return OkResponse(stockLevel);
    }

    /// <summary>
    /// Get stock summary for a product across all warehouses
    /// </summary>
    [HttpGet("stock-summary/product/{productId:int}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StockLevelSummaryDto>>>> GetStockSummary(
        int productId,
        CancellationToken cancellationToken)
    {
        var summary = await _inventoryService.GetStockSummaryByProductAsync(productId, cancellationToken);
        return OkResponse(summary);
    }

    /// <summary>
    /// Get low stock items for a warehouse
    /// </summary>
    [HttpGet("low-stock/warehouse/{warehouseId:int}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StockLevelDto>>>> GetLowStockItems(
        int warehouseId,
        CancellationToken cancellationToken)
    {
        var lowStock = await _inventoryService.GetLowStockAsync(warehouseId, cancellationToken);
        return OkResponse(lowStock);
    }

    /// <summary>
    /// Get movement history for a product
    /// </summary>
    [HttpGet("movements/product/{productId:int}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StockMovementDto>>>> GetMovementHistory(
        int productId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var movements = await _inventoryService.GetMovementHistoryAsync(productId, from, to, cancellationToken);
        return OkResponse(movements);
    }

    /// <summary>
    /// Create stock adjustment
    /// </summary>
    [HttpPost("adjustments")]
    public async Task<ActionResult<ApiResponse<object>>> CreateAdjustment(
        [FromBody] CreateStockAdjustmentDto dto,
        CancellationToken cancellationToken)
    {
        await _inventoryService.AdjustStockAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Stock adjustment created successfully.");
    }

    /// <summary>
    /// Get total quantity for a product
    /// </summary>
    [HttpGet("quantity/product/{productId:int}")]
    public async Task<ActionResult<ApiResponse<decimal>>> GetTotalQuantity(
        int productId,
        [FromQuery] int? warehouseId,
        CancellationToken cancellationToken)
    {
        var quantity = await _inventoryService.GetTotalQuantityAsync(productId, warehouseId, cancellationToken);
        return OkResponse(quantity);
    }
}
