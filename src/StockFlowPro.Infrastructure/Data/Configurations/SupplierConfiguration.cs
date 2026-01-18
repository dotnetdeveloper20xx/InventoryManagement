using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Data.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("Suppliers");

        builder.HasKey(s => s.SupplierId);

        builder.Property(s => s.SupplierCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(s => s.SupplierCode)
            .IsUnique();

        builder.Property(s => s.CompanyName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.TradingName)
            .HasMaxLength(200);

        builder.Property(s => s.TaxId)
            .HasMaxLength(50);

        builder.Property(s => s.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("USD");

        builder.Property(s => s.CreditLimit)
            .HasPrecision(18, 2);

        builder.Property(s => s.MinOrderValue)
            .HasPrecision(18, 2);

        builder.Property(s => s.TotalSpend)
            .HasPrecision(18, 2);

        builder.Property(s => s.OnTimeDeliveryRate)
            .HasPrecision(5, 2);

        builder.Property(s => s.QualityAcceptanceRate)
            .HasPrecision(5, 2);

        builder.Property(s => s.AverageLeadTimeDays)
            .HasPrecision(8, 2);
    }
}
