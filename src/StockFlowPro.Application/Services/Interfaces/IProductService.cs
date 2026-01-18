using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Products;

namespace StockFlowPro.Application.Services.Interfaces;

public interface IProductService
{
    Task<ProductDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDto?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default);
    Task<PaginatedResponse<ProductListDto>> GetPagedAsync(ProductFilterDto filter, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductListDto>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateAsync(UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySkuAsync(string sku, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LookupDto>> GetLookupAsync(CancellationToken cancellationToken = default);
}
