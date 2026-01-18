using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Infrastructure.Data.Configurations;

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("Brands");
        builder.HasKey(b => b.BrandId);
        builder.Property(b => b.BrandCode).IsRequired().HasMaxLength(20);
        builder.HasIndex(b => b.BrandCode).IsUnique();
        builder.Property(b => b.Name).IsRequired().HasMaxLength(100);
    }
}

public class UnitOfMeasureConfiguration : IEntityTypeConfiguration<UnitOfMeasure>
{
    public void Configure(EntityTypeBuilder<UnitOfMeasure> builder)
    {
        builder.ToTable("UnitsOfMeasure");
        builder.HasKey(u => u.UOMId);
        builder.Property(u => u.UOMCode).IsRequired().HasMaxLength(10);
        builder.HasIndex(u => u.UOMCode).IsUnique();
        builder.Property(u => u.Name).IsRequired().HasMaxLength(50);
        builder.Property(u => u.ConversionFactor).HasPrecision(18, 6);

        builder.HasOne(u => u.BaseUOM)
            .WithMany(u => u.DerivedUOMs)
            .HasForeignKey(u => u.BaseUOMId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class ZoneConfiguration : IEntityTypeConfiguration<Zone>
{
    public void Configure(EntityTypeBuilder<Zone> builder)
    {
        builder.ToTable("Zones");
        builder.HasKey(z => z.ZoneId);
        builder.Property(z => z.ZoneCode).IsRequired().HasMaxLength(20);
        builder.Property(z => z.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(z => new { z.WarehouseId, z.ZoneCode }).IsUnique();

        builder.HasOne(z => z.Warehouse)
            .WithMany(w => w.Zones)
            .HasForeignKey(z => z.WarehouseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class BinConfiguration : IEntityTypeConfiguration<Bin>
{
    public void Configure(EntityTypeBuilder<Bin> builder)
    {
        builder.ToTable("Bins");
        builder.HasKey(b => b.BinId);
        builder.Property(b => b.BinCode).IsRequired().HasMaxLength(20);
        builder.HasIndex(b => new { b.ZoneId, b.BinCode }).IsUnique();

        builder.HasOne(b => b.Zone)
            .WithMany(z => z.Bins)
            .HasForeignKey(b => b.ZoneId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("StockMovements");
        builder.HasKey(s => s.StockMovementId);
        builder.Property(s => s.MovementNumber).IsRequired().HasMaxLength(50);
        builder.HasIndex(s => s.MovementNumber).IsUnique();
        builder.Property(s => s.Quantity).HasPrecision(18, 4);
        builder.Property(s => s.QuantityInBaseUOM).HasPrecision(18, 4);
        builder.Property(s => s.UnitCost).HasPrecision(18, 4);
        builder.Property(s => s.TotalCost).HasPrecision(18, 4);
        builder.Property(s => s.RunningBalance).HasPrecision(18, 4);

        builder.HasOne(s => s.Product)
            .WithMany(p => p.StockMovements)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class BatchConfiguration : IEntityTypeConfiguration<Batch>
{
    public void Configure(EntityTypeBuilder<Batch> builder)
    {
        builder.ToTable("Batches");
        builder.HasKey(b => b.BatchId);
        builder.Property(b => b.BatchNumber).IsRequired().HasMaxLength(50);
        builder.HasIndex(b => new { b.ProductId, b.BatchNumber }).IsUnique();

        builder.HasOne(b => b.Product)
            .WithMany(p => p.Batches)
            .HasForeignKey(b => b.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AlertConfiguration : IEntityTypeConfiguration<Alert>
{
    public void Configure(EntityTypeBuilder<Alert> builder)
    {
        builder.ToTable("Alerts");
        builder.HasKey(a => a.AlertId);
        builder.Property(a => a.Title).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Message).IsRequired().HasMaxLength(1000);
    }
}

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");
        builder.HasKey(a => a.AuditLogId);
        builder.Property(a => a.EntityType).IsRequired().HasMaxLength(100);
        builder.HasIndex(a => new { a.EntityType, a.EntityId });
        builder.HasIndex(a => a.Timestamp);
    }
}

public class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
{
    public void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        builder.ToTable("SystemSettings");
        builder.HasKey(s => s.SystemSettingId);
        builder.Property(s => s.Category).IsRequired().HasMaxLength(50);
        builder.Property(s => s.Key).IsRequired().HasMaxLength(100);
        builder.HasIndex(s => new { s.Category, s.Key }).IsUnique();
    }
}

public class NumberSeriesConfiguration : IEntityTypeConfiguration<NumberSeries>
{
    public void Configure(EntityTypeBuilder<NumberSeries> builder)
    {
        builder.ToTable("NumberSeries");
        builder.HasKey(n => n.NumberSeriesId);
        builder.Property(n => n.EntityType).IsRequired().HasMaxLength(50);
        builder.HasIndex(n => n.EntityType).IsUnique();
        builder.Property(n => n.Prefix).HasMaxLength(20);
    }
}

public class ReasonCodeConfiguration : IEntityTypeConfiguration<ReasonCode>
{
    public void Configure(EntityTypeBuilder<ReasonCode> builder)
    {
        builder.ToTable("ReasonCodes");
        builder.HasKey(r => r.ReasonCodeId);
        builder.Property(r => r.Code).IsRequired().HasMaxLength(20);
        builder.HasIndex(r => r.Code).IsUnique();
        builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
    }
}
