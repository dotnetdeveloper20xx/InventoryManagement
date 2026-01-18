using AutoMapper;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Categories;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Repositories.Interfaces;

namespace StockFlowPro.Application.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<IReadOnlyList<CategoryTreeDto>> GetTreeAsync(CancellationToken cancellationToken = default)
    {
        var rootCategories = await _unitOfWork.Categories.GetWithChildrenAsync(null, cancellationToken);
        return _mapper.Map<IReadOnlyList<CategoryTreeDto>>(rootCategories);
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        if (await _unitOfWork.Categories.ExistsByCodeAsync(dto.CategoryCode, cancellationToken))
        {
            throw new ValidationException("CategoryCode", "A category with this code already exists.");
        }

        var category = _mapper.Map<Category>(dto);
        category.CreatedDate = DateTime.UtcNow;
        category.IsActive = true;

        // Build path
        if (dto.ParentCategoryId.HasValue)
        {
            var parent = await _unitOfWork.Categories.GetByIdAsync(dto.ParentCategoryId.Value, cancellationToken);
            if (parent != null)
            {
                category.Path = $"{parent.Path}/{category.CategoryCode}";
                category.FullPath = $"{parent.FullPath} > {category.Name}";
                category.Level = parent.Level + 1;
            }
        }
        else
        {
            category.Path = category.CategoryCode;
            category.FullPath = category.Name;
            category.Level = 0;
        }

        await _unitOfWork.Categories.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> UpdateAsync(UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(dto.CategoryId, cancellationToken);
        if (category == null)
        {
            throw new NotFoundException("Category", dto.CategoryId);
        }

        _mapper.Map(dto, category);
        category.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Categories.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            throw new NotFoundException("Category", id);
        }

        // Check for child categories
        var hasChildren = await _unitOfWork.Categories.AnyAsync(c => c.ParentCategoryId == id, cancellationToken);
        if (hasChildren)
        {
            throw new BusinessRuleException("CATEGORY_HAS_CHILDREN", "Cannot delete a category that has child categories.");
        }

        // Check for products
        var hasProducts = await _unitOfWork.Products.AnyAsync(p => p.CategoryId == id, cancellationToken);
        if (hasProducts)
        {
            throw new BusinessRuleException("CATEGORY_HAS_PRODUCTS", "Cannot delete a category that has products.");
        }

        _unitOfWork.Categories.Remove(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LookupDto>> GetLookupAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
        return categories.Select(c => new LookupDto
        {
            Id = c.CategoryId,
            Name = c.FullPath ?? c.Name,
            Code = c.CategoryCode
        }).ToList();
    }
}
