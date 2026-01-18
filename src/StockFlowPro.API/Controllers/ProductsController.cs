using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Products;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : BaseApiController
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// Get paginated list of products
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<ProductListDto>>>> GetProducts(
        [FromQuery] ProductFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _productService.GetPagedAsync(filter, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get product by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProductDetailDto>>> GetProduct(int id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        if (product == null)
        {
            return NotFoundResponse<ProductDetailDto>($"Product with ID {id} not found.");
        }
        return OkResponse(product);
    }

    /// <summary>
    /// Get product by SKU
    /// </summary>
    [HttpGet("sku/{sku}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductBySku(string sku, CancellationToken cancellationToken)
    {
        var product = await _productService.GetBySkuAsync(sku, cancellationToken);
        if (product == null)
        {
            return NotFoundResponse<ProductDto>($"Product with SKU '{sku}' not found.");
        }
        return OkResponse(product);
    }

    /// <summary>
    /// Get products by category
    /// </summary>
    [HttpGet("category/{categoryId:int}")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProductListDto>>>> GetProductsByCategory(
        int categoryId,
        CancellationToken cancellationToken)
    {
        var products = await _productService.GetByCategoryAsync(categoryId, cancellationToken);
        return OkResponse(products);
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct(
        [FromBody] CreateProductDto dto,
        CancellationToken cancellationToken)
    {
        var product = await _productService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(product, nameof(GetProduct), new { id = product.ProductId });
    }

    /// <summary>
    /// Update an existing product
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(
        int id,
        [FromBody] UpdateProductDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.ProductId)
        {
            return BadRequestResponse<ProductDto>("ID mismatch between route and body.");
        }

        var product = await _productService.UpdateAsync(dto, cancellationToken);
        return OkResponse(product, "Product updated successfully.");
    }

    /// <summary>
    /// Delete a product
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteProduct(int id, CancellationToken cancellationToken)
    {
        await _productService.DeleteAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Product deleted successfully.");
    }

    /// <summary>
    /// Get products lookup for dropdowns
    /// </summary>
    [HttpGet("lookup")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<LookupDto>>>> GetProductsLookup(CancellationToken cancellationToken)
    {
        var lookup = await _productService.GetLookupAsync(cancellationToken);
        return OkResponse(lookup);
    }

    /// <summary>
    /// Check if SKU exists
    /// </summary>
    [HttpGet("check-sku/{sku}")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckSkuExists(string sku, CancellationToken cancellationToken)
    {
        var exists = await _productService.ExistsBySkuAsync(sku, cancellationToken);
        return OkResponse(exists);
    }
}
