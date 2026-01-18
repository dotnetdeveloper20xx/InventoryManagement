using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Categories;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : BaseApiController
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Get all categories
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CategoryDto>>>> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetAllAsync(cancellationToken);
        return OkResponse(categories);
    }

    /// <summary>
    /// Get categories as tree structure
    /// </summary>
    [HttpGet("tree")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CategoryTreeDto>>>> GetCategoryTree(CancellationToken cancellationToken)
    {
        var tree = await _categoryService.GetTreeAsync(cancellationToken);
        return OkResponse(tree);
    }

    /// <summary>
    /// Get category by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategory(int id, CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            return NotFoundResponse<CategoryDto>($"Category with ID {id} not found.");
        }
        return OkResponse(category);
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(
        [FromBody] CreateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var category = await _categoryService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(category, nameof(GetCategory), new { id = category.CategoryId });
    }

    /// <summary>
    /// Update an existing category
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(
        int id,
        [FromBody] UpdateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.CategoryId)
        {
            return BadRequestResponse<CategoryDto>("ID mismatch between route and body.");
        }

        var category = await _categoryService.UpdateAsync(dto, cancellationToken);
        return OkResponse(category, "Category updated successfully.");
    }

    /// <summary>
    /// Delete a category
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCategory(int id, CancellationToken cancellationToken)
    {
        await _categoryService.DeleteAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Category deleted successfully.");
    }

    /// <summary>
    /// Get categories lookup
    /// </summary>
    [HttpGet("lookup")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<LookupDto>>>> GetCategoriesLookup(CancellationToken cancellationToken)
    {
        var lookup = await _categoryService.GetLookupAsync(cancellationToken);
        return OkResponse(lookup);
    }
}
