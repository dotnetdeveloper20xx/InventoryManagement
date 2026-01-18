using AutoMapper;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Products;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Repositories.Interfaces;

namespace StockFlowPro.Application.Services.Implementations;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProductDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetWithDetailsAsync(id, cancellationToken);
        return product == null ? null : _mapper.Map<ProductDetailDto>(product);
    }

    public async Task<ProductDto?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetBySkuAsync(sku, cancellationToken);
        return product == null ? null : _mapper.Map<ProductDto>(product);
    }

    public async Task<PaginatedResponse<ProductListDto>> GetPagedAsync(ProductFilterDto filter, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _unitOfWork.Products.GetPagedAsync(
            filter.PageNumber,
            filter.PageSize,
            filter.CategoryId,
            filter.BrandId,
            filter.Search,
            filter.IsActive,
            cancellationToken);

        var dtos = _mapper.Map<IReadOnlyList<ProductListDto>>(items);
        return new PaginatedResponse<ProductListDto>(dtos, totalCount, filter.PageNumber, filter.PageSize);
    }

    public async Task<IReadOnlyList<ProductListDto>> GetByCategoryAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        var products = await _unitOfWork.Products.GetByCategoryAsync(categoryId, cancellationToken);
        return _mapper.Map<IReadOnlyList<ProductListDto>>(products);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        if (await _unitOfWork.Products.ExistsBySkuAsync(dto.SKU, cancellationToken))
        {
            throw new ValidationException("SKU", "A product with this SKU already exists.");
        }

        var product = _mapper.Map<Product>(dto);
        product.CreatedDate = DateTime.UtcNow;

        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _unitOfWork.Products.GetWithDetailsAsync(product.ProductId, cancellationToken);
        return _mapper.Map<ProductDto>(created);
    }

    public async Task<ProductDto> UpdateAsync(UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(dto.ProductId, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException("Product", dto.ProductId);
        }

        _mapper.Map(dto, product);
        product.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _unitOfWork.Products.GetWithDetailsAsync(product.ProductId, cancellationToken);
        return _mapper.Map<ProductDto>(updated);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException("Product", id);
        }

        // Check if product has stock
        var hasStock = await _unitOfWork.StockLevels.AnyAsync(s => s.ProductId == id && s.QuantityOnHand > 0, cancellationToken);
        if (hasStock)
        {
            throw new BusinessRuleException("PRODUCT_HAS_STOCK", "Cannot delete a product that has stock on hand.");
        }

        _unitOfWork.Products.Remove(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsBySkuAsync(string sku, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Products.ExistsBySkuAsync(sku, cancellationToken);
    }

    public async Task<IReadOnlyList<LookupDto>> GetLookupAsync(CancellationToken cancellationToken = default)
    {
        var products = await _unitOfWork.Products.GetAllAsync(cancellationToken);
        return products.Select(p => new LookupDto
        {
            Id = p.ProductId,
            Name = p.Name,
            Code = p.SKU
        }).ToList();
    }
}
