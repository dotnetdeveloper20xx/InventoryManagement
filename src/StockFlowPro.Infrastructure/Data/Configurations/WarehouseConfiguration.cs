using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Data.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses");

        builder.HasKey(w => w.WarehouseId);

        builder.Property(w => w.WarehouseCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(w => w.WarehouseCode)
            .IsUnique();

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.AddressLine1)
            .HasMaxLength(200);

        builder.Property(w => w.AddressLine2)
            .HasMaxLength(200);

        builder.Property(w => w.City)
            .HasMaxLength(100);

        builder.Property(w => w.StateProvince)
            .HasMaxLength(100);

        builder.Property(w => w.PostalCode)
            .HasMaxLength(20);

        builder.Property(w => w.Country)
            .HasMaxLength(100);

        builder.Property(w => w.ManagerName)
            .HasMaxLength(100);

        builder.Property(w => w.Phone)
            .HasMaxLength(50);

        builder.Property(w => w.Email)
            .HasMaxLength(100);

        builder.Property(w => w.OperatingHours)
            .HasMaxLength(100);

        builder.Property(w => w.TotalAreaSqFt)
            .HasPrecision(18, 2);

        builder.Property(w => w.StorageCapacityCuFt)
            .HasPrecision(18, 2);

        builder.Property(w => w.CurrentUtilizationPercent)
            .HasPrecision(5, 2);

        builder.Property(w => w.Latitude)
            .HasPrecision(10, 7);

        builder.Property(w => w.Longitude)
            .HasPrecision(10, 7);
    }
}
