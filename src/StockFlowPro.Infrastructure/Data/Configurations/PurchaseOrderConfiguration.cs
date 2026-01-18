using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Data.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("PurchaseOrders");

        builder.HasKey(p => p.PurchaseOrderId);

        builder.Property(p => p.PONumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => p.PONumber)
            .IsUnique();

        builder.Property(p => p.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(p => p.ExchangeRate)
            .HasPrecision(18, 6)
            .HasDefaultValue(1);

        builder.Property(p => p.Subtotal)
            .HasPrecision(18, 2);

        builder.Property(p => p.DiscountPercent)
            .HasPrecision(5, 2);

        builder.Property(p => p.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(p => p.TaxPercent)
            .HasPrecision(5, 2);

        builder.Property(p => p.TaxAmount)
            .HasPrecision(18, 2);

        builder.Property(p => p.ShippingCost)
            .HasPrecision(18, 2);

        builder.Property(p => p.TotalAmount)
            .HasPrecision(18, 2);

        builder.Property(p => p.RowVersion)
            .IsRowVersion();

        // Relationships
        builder.HasOne(p => p.Supplier)
            .WithMany(s => s.PurchaseOrders)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Warehouse)
            .WithMany()
            .HasForeignKey(p => p.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class PurchaseOrderLineConfiguration : IEntityTypeConfiguration<PurchaseOrderLine>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderLine> builder)
    {
        builder.ToTable("PurchaseOrderLines");

        builder.HasKey(p => p.PurchaseOrderLineId);

        builder.Property(p => p.QuantityOrdered)
            .HasPrecision(18, 4);

        builder.Property(p => p.QuantityReceived)
            .HasPrecision(18, 4);

        builder.Property(p => p.QuantityPending)
            .HasPrecision(18, 4);

        builder.Property(p => p.QuantityRejected)
            .HasPrecision(18, 4);

        builder.Property(p => p.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(p => p.DiscountPercent)
            .HasPrecision(5, 2);

        builder.Property(p => p.DiscountAmount)
            .HasPrecision(18, 4);

        builder.Property(p => p.TaxPercent)
            .HasPrecision(5, 2);

        builder.Property(p => p.TaxAmount)
            .HasPrecision(18, 4);

        builder.Property(p => p.LineTotal)
            .HasPrecision(18, 4);

        // Relationships
        builder.HasOne(p => p.PurchaseOrder)
            .WithMany(po => po.Lines)
            .HasForeignKey(p => p.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Product)
            .WithMany()
            .HasForeignKey(p => p.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.UOM)
            .WithMany()
            .HasForeignKey(p => p.UOMId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
