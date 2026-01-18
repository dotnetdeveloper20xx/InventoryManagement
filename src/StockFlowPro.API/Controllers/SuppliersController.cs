using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Suppliers;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : BaseApiController
{
    private readonly ISupplierService _supplierService;

    public SuppliersController(ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    /// <summary>
    /// Get paginated list of suppliers
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<SupplierDto>>>> GetSuppliers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _supplierService.GetPagedAsync(pageNumber, pageSize, search, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get supplier by ID with contacts
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<SupplierDetailDto>>> GetSupplier(int id, CancellationToken cancellationToken)
    {
        var supplier = await _supplierService.GetByIdAsync(id, cancellationToken);
        if (supplier == null)
        {
            return NotFoundResponse<SupplierDetailDto>($"Supplier with ID {id} not found.");
        }
        return OkResponse(supplier);
    }

    /// <summary>
    /// Create a new supplier
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> CreateSupplier(
        [FromBody] CreateSupplierDto dto,
        CancellationToken cancellationToken)
    {
        var supplier = await _supplierService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(supplier, nameof(GetSupplier), new { id = supplier.SupplierId });
    }

    /// <summary>
    /// Update an existing supplier
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> UpdateSupplier(
        int id,
        [FromBody] UpdateSupplierDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.SupplierId)
        {
            return BadRequestResponse<SupplierDto>("ID mismatch between route and body.");
        }

        var supplier = await _supplierService.UpdateAsync(dto, cancellationToken);
        return OkResponse(supplier, "Supplier updated successfully.");
    }

    /// <summary>
    /// Delete a supplier
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteSupplier(int id, CancellationToken cancellationToken)
    {
        await _supplierService.DeleteAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Supplier deleted successfully.");
    }

    /// <summary>
    /// Get suppliers lookup
    /// </summary>
    [HttpGet("lookup")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<LookupDto>>>> GetSuppliersLookup(CancellationToken cancellationToken)
    {
        var lookup = await _supplierService.GetLookupAsync(cancellationToken);
        return OkResponse(lookup);
    }
}
