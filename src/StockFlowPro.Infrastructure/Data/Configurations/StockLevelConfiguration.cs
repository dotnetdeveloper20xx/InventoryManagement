using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Data.Configurations;

public class StockLevelConfiguration : IEntityTypeConfiguration<StockLevel>
{
    public void Configure(EntityTypeBuilder<StockLevel> builder)
    {
        builder.ToTable("StockLevels");

        builder.HasKey(s => s.StockLevelId);

        // Unique constraint for product + warehouse + bin + batch combination
        builder.HasIndex(s => new { s.ProductId, s.WarehouseId, s.BinId, s.BatchId })
            .IsUnique();

        builder.Property(s => s.QuantityOnHand)
            .HasPrecision(18, 4);

        builder.Property(s => s.QuantityReserved)
            .HasPrecision(18, 4);

        builder.Property(s => s.QuantityAvailable)
            .HasPrecision(18, 4);

        builder.Property(s => s.QuantityOnOrder)
            .HasPrecision(18, 4);

        builder.Property(s => s.QuantityInTransit)
            .HasPrecision(18, 4);

        builder.Property(s => s.QuantityQuarantine)
            .HasPrecision(18, 4);

        builder.Property(s => s.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(s => s.TotalValue)
            .HasPrecision(18, 4);

        builder.Property(s => s.RowVersion)
            .IsRowVersion();

        // Relationships
        builder.HasOne(s => s.Product)
            .WithMany(p => p.StockLevels)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Warehouse)
            .WithMany(w => w.StockLevels)
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Bin)
            .WithMany(b => b.StockLevels)
            .HasForeignKey(s => s.BinId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.Batch)
            .WithMany(b => b.StockLevels)
            .HasForeignKey(s => s.BatchId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
