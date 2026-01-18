using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Data.Configurations;

public class TransferConfiguration : IEntityTypeConfiguration<Transfer>
{
    public void Configure(EntityTypeBuilder<Transfer> builder)
    {
        builder.ToTable("Transfers");

        builder.HasKey(t => t.TransferId);

        builder.Property(t => t.TransferNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(t => t.TransferNumber)
            .IsUnique();

        builder.Property(t => t.ShippingCost)
            .HasPrecision(18, 2);

        builder.Property(t => t.RowVersion)
            .IsRowVersion();

        // Relationships
        builder.HasOne(t => t.FromWarehouse)
            .WithMany()
            .HasForeignKey(t => t.FromWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.ToWarehouse)
            .WithMany()
            .HasForeignKey(t => t.ToWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.RequestedBy)
            .WithMany()
            .HasForeignKey(t => t.RequestedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class TransferLineConfiguration : IEntityTypeConfiguration<TransferLine>
{
    public void Configure(EntityTypeBuilder<TransferLine> builder)
    {
        builder.ToTable("TransferLines");

        builder.HasKey(t => t.TransferLineId);

        builder.Property(t => t.RequestedQty)
            .HasPrecision(18, 4);

        builder.Property(t => t.ApprovedQty)
            .HasPrecision(18, 4);

        builder.Property(t => t.ShippedQty)
            .HasPrecision(18, 4);

        builder.Property(t => t.ReceivedQty)
            .HasPrecision(18, 4);

        builder.Property(t => t.VarianceQty)
            .HasPrecision(18, 4);

        builder.Property(t => t.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(t => t.TotalCost)
            .HasPrecision(18, 4);

        // Relationships
        builder.HasOne(t => t.Transfer)
            .WithMany(tr => tr.Lines)
            .HasForeignKey(t => t.TransferId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Product)
            .WithMany()
            .HasForeignKey(t => t.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
