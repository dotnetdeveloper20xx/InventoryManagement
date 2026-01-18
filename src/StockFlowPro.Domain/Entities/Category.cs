using StockFlowPro.Domain.Common;

namespace StockFlowPro.Domain.Entities;

public class Category : BaseEntity, IAuditableEntity
{
    public int CategoryId { get; set; }
    public int? ParentCategoryId { get; set; }
    public string CategoryCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Path { get; set; }
    public string? FullPath { get; set; }
    public int Level { get; set; }
    public int DisplayOrder { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Category? ParentCategory { get; set; }
    public ICollection<Category> ChildCategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
