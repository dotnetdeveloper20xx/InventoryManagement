using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Warehouses;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WarehousesController : BaseApiController
{
    private readonly IWarehouseService _warehouseService;

    public WarehousesController(IWarehouseService warehouseService)
    {
        _warehouseService = warehouseService;
    }

    /// <summary>
    /// Get all warehouses
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<WarehouseDto>>>> GetWarehouses(CancellationToken cancellationToken)
    {
        var warehouses = await _warehouseService.GetAllAsync(cancellationToken);
        return OkResponse(warehouses);
    }

    /// <summary>
    /// Get active warehouses
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<WarehouseDto>>>> GetActiveWarehouses(CancellationToken cancellationToken)
    {
        var warehouses = await _warehouseService.GetActiveAsync(cancellationToken);
        return OkResponse(warehouses);
    }

    /// <summary>
    /// Get warehouse by ID with zones and bins
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<WarehouseDetailDto>>> GetWarehouse(int id, CancellationToken cancellationToken)
    {
        var warehouse = await _warehouseService.GetByIdAsync(id, cancellationToken);
        if (warehouse == null)
        {
            return NotFoundResponse<WarehouseDetailDto>($"Warehouse with ID {id} not found.");
        }
        return OkResponse(warehouse);
    }

    /// <summary>
    /// Create a new warehouse
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> CreateWarehouse(
        [FromBody] CreateWarehouseDto dto,
        CancellationToken cancellationToken)
    {
        var warehouse = await _warehouseService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(warehouse, nameof(GetWarehouse), new { id = warehouse.WarehouseId });
    }

    /// <summary>
    /// Update an existing warehouse
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> UpdateWarehouse(
        int id,
        [FromBody] UpdateWarehouseDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.WarehouseId)
        {
            return BadRequestResponse<WarehouseDto>("ID mismatch between route and body.");
        }

        var warehouse = await _warehouseService.UpdateAsync(dto, cancellationToken);
        return OkResponse(warehouse, "Warehouse updated successfully.");
    }

    /// <summary>
    /// Delete a warehouse
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteWarehouse(int id, CancellationToken cancellationToken)
    {
        await _warehouseService.DeleteAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Warehouse deleted successfully.");
    }

    /// <summary>
    /// Get warehouses lookup
    /// </summary>
    [HttpGet("lookup")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<LookupDto>>>> GetWarehousesLookup(CancellationToken cancellationToken)
    {
        var lookup = await _warehouseService.GetLookupAsync(cancellationToken);
        return OkResponse(lookup);
    }
}
