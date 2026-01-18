using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.ProductId);

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => p.SKU)
            .IsUnique();

        builder.Property(p => p.Barcode)
            .HasMaxLength(50);

        builder.HasIndex(p => p.Barcode);

        builder.Property(p => p.BarcodeType)
            .HasMaxLength(20);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.ShortDescription)
            .HasMaxLength(500);

        builder.Property(p => p.ModelNumber)
            .HasMaxLength(50);

        builder.Property(p => p.ABCClassification)
            .HasMaxLength(1);

        builder.Property(p => p.ProductType)
            .HasMaxLength(50);

        builder.Property(p => p.Color)
            .HasMaxLength(50);

        builder.Property(p => p.Size)
            .HasMaxLength(50);

        builder.Property(p => p.StandardCost)
            .HasPrecision(18, 4);

        builder.Property(p => p.LastPurchasePrice)
            .HasPrecision(18, 4);

        builder.Property(p => p.AverageCost)
            .HasPrecision(18, 4);

        builder.Property(p => p.MSRP)
            .HasPrecision(18, 4);

        builder.Property(p => p.WholesalePrice)
            .HasPrecision(18, 4);

        builder.Property(p => p.Weight)
            .HasPrecision(18, 4);

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.Property(p => p.ThumbnailUrl)
            .HasMaxLength(500);

        builder.Property(p => p.RowVersion)
            .IsRowVersion();

        // Relationships
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Brand)
            .WithMany(b => b.Products)
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.PrimaryUOM)
            .WithMany()
            .HasForeignKey(p => p.PrimaryUOMId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.SecondaryUOM)
            .WithMany()
            .HasForeignKey(p => p.SecondaryUOMId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.PreferredSupplier)
            .WithMany()
            .HasForeignKey(p => p.PreferredSupplierId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
