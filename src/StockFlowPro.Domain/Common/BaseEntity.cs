namespace StockFlowPro.Domain.Common;

public abstract class BaseEntity
{
    public DateTime CreatedDate { get; set; }
    public int? CreatedByUserId { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public int? ModifiedByUserId { get; set; }
}

public abstract class BaseEntity<TKey> : BaseEntity
{
    public TKey Id { get; set; } = default!;
}

public interface IAuditableEntity
{
    DateTime CreatedDate { get; set; }
    int? CreatedByUserId { get; set; }
    DateTime? ModifiedDate { get; set; }
    int? ModifiedByUserId { get; set; }
}

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTime? DeletedDate { get; set; }
    int? DeletedByUserId { get; set; }
}

public interface IHasRowVersion
{
    byte[] RowVersion { get; set; }
}
