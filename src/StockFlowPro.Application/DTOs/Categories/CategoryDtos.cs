namespace StockFlowPro.Application.DTOs.Categories;

public class CategoryDto
{
    public int CategoryId { get; set; }
    public int? ParentCategoryId { get; set; }
    public string CategoryCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? FullPath { get; set; }
    public int Level { get; set; }
    public int DisplayOrder { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
}

public class CategoryTreeDto : CategoryDto
{
    public List<CategoryTreeDto> Children { get; set; } = new();
}

public class CreateCategoryDto
{
    public int? ParentCategoryId { get; set; }
    public string CategoryCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public string? ImageUrl { get; set; }
}

public class UpdateCategoryDto
{
    public int CategoryId { get; set; }
    public int? ParentCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}
