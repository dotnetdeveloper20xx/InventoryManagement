using AutoMapper;
using StockFlowPro.Application.DTOs.Categories;
using StockFlowPro.Application.DTOs.Inventory;
using StockFlowPro.Application.DTOs.Products;
using StockFlowPro.Application.DTOs.PurchaseOrders;
using StockFlowPro.Application.DTOs.Suppliers;
using StockFlowPro.Application.DTOs.Users;
using StockFlowPro.Application.DTOs.Warehouses;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Product mappings
        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.BrandName, opt => opt.MapFrom(s => s.Brand != null ? s.Brand.Name : null))
            .ForMember(d => d.PrimaryUOMName, opt => opt.MapFrom(s => s.PrimaryUOM.Name));

        CreateMap<Product, ProductListDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.BrandName, opt => opt.MapFrom(s => s.Brand != null ? s.Brand.Name : null))
            .ForMember(d => d.PrimaryUOMName, opt => opt.MapFrom(s => s.PrimaryUOM.Name));

        CreateMap<Product, ProductDetailDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.BrandName, opt => opt.MapFrom(s => s.Brand != null ? s.Brand.Name : null))
            .ForMember(d => d.PrimaryUOMName, opt => opt.MapFrom(s => s.PrimaryUOM.Name))
            .ForMember(d => d.SecondaryUOMName, opt => opt.MapFrom(s => s.SecondaryUOM != null ? s.SecondaryUOM.Name : null))
            .ForMember(d => d.PreferredSupplierName, opt => opt.MapFrom(s => s.PreferredSupplier != null ? s.PreferredSupplier.CompanyName : null))
            .ForMember(d => d.Images, opt => opt.MapFrom(s => s.ProductImages))
            .ForMember(d => d.Suppliers, opt => opt.MapFrom(s => s.ProductSuppliers));

        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();

        CreateMap<ProductImage, ProductImageDto>();
        CreateMap<ProductSupplier, ProductSupplierDto>()
            .ForMember(d => d.SupplierName, opt => opt.MapFrom(s => s.Supplier.CompanyName));

        // Category mappings
        CreateMap<Category, CategoryDto>();
        CreateMap<Category, CategoryTreeDto>();
        CreateMap<CreateCategoryDto, Category>();
        CreateMap<UpdateCategoryDto, Category>();

        // Warehouse mappings
        CreateMap<Warehouse, WarehouseDto>();
        CreateMap<Warehouse, WarehouseDetailDto>()
            .ForMember(d => d.Zones, opt => opt.MapFrom(s => s.Zones));
        CreateMap<Zone, ZoneDto>()
            .ForMember(d => d.Bins, opt => opt.MapFrom(s => s.Bins));
        CreateMap<Bin, BinDto>();
        CreateMap<CreateWarehouseDto, Warehouse>();
        CreateMap<UpdateWarehouseDto, Warehouse>();

        // Supplier mappings
        CreateMap<Supplier, SupplierDto>();
        CreateMap<Supplier, SupplierDetailDto>()
            .ForMember(d => d.Contacts, opt => opt.MapFrom(s => s.Contacts));
        CreateMap<SupplierContact, SupplierContactDto>();
        CreateMap<CreateSupplierDto, Supplier>();
        CreateMap<UpdateSupplierDto, Supplier>();

        // Inventory mappings
        CreateMap<StockLevel, StockLevelDto>()
            .ForMember(d => d.ProductSKU, opt => opt.MapFrom(s => s.Product.SKU))
            .ForMember(d => d.ProductName, opt => opt.MapFrom(s => s.Product.Name))
            .ForMember(d => d.WarehouseName, opt => opt.MapFrom(s => s.Warehouse.Name))
            .ForMember(d => d.BinCode, opt => opt.MapFrom(s => s.Bin != null ? s.Bin.BinCode : null))
            .ForMember(d => d.BatchNumber, opt => opt.MapFrom(s => s.Batch != null ? s.Batch.BatchNumber : null));

        CreateMap<StockMovement, StockMovementDto>()
            .ForMember(d => d.ProductSKU, opt => opt.MapFrom(s => s.Product.SKU))
            .ForMember(d => d.ProductName, opt => opt.MapFrom(s => s.Product.Name))
            .ForMember(d => d.FromWarehouseName, opt => opt.MapFrom(s => s.FromWarehouse != null ? s.FromWarehouse.Name : null))
            .ForMember(d => d.ToWarehouseName, opt => opt.MapFrom(s => s.ToWarehouse != null ? s.ToWarehouse.Name : null))
            .ForMember(d => d.UOMName, opt => opt.MapFrom(s => s.UOM.Name))
            .ForMember(d => d.CreatedByUserName, opt => opt.MapFrom(s => s.CreatedBy != null ? s.CreatedBy.FullName : null));

        // Purchase Order mappings
        CreateMap<PurchaseOrder, PurchaseOrderDto>()
            .ForMember(d => d.SupplierName, opt => opt.MapFrom(s => s.Supplier.CompanyName))
            .ForMember(d => d.WarehouseName, opt => opt.MapFrom(s => s.Warehouse.Name))
            .ForMember(d => d.LineCount, opt => opt.MapFrom(s => s.Lines.Count));

        CreateMap<PurchaseOrder, PurchaseOrderDetailDto>()
            .ForMember(d => d.SupplierName, opt => opt.MapFrom(s => s.Supplier.CompanyName))
            .ForMember(d => d.WarehouseName, opt => opt.MapFrom(s => s.Warehouse.Name))
            .ForMember(d => d.ApprovedByUserName, opt => opt.MapFrom(s => s.ApprovedBy != null ? s.ApprovedBy.FullName : null))
            .ForMember(d => d.Lines, opt => opt.MapFrom(s => s.Lines));

        CreateMap<PurchaseOrderLine, PurchaseOrderLineDto>()
            .ForMember(d => d.ProductSKU, opt => opt.MapFrom(s => s.Product.SKU))
            .ForMember(d => d.ProductName, opt => opt.MapFrom(s => s.Product.Name))
            .ForMember(d => d.UOMName, opt => opt.MapFrom(s => s.UOM.Name));

        CreateMap<CreatePurchaseOrderDto, PurchaseOrder>();
        CreateMap<CreatePurchaseOrderLineDto, PurchaseOrderLine>();

        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(d => d.RoleName, opt => opt.MapFrom(s => s.Role.RoleName))
            .ForMember(d => d.DefaultWarehouseName, opt => opt.MapFrom(s => s.DefaultWarehouse != null ? s.DefaultWarehouse.Name : null));
        CreateMap<User, UserDetailDto>()
            .ForMember(d => d.RoleName, opt => opt.MapFrom(s => s.Role.RoleName))
            .ForMember(d => d.DefaultWarehouseName, opt => opt.MapFrom(s => s.DefaultWarehouse != null ? s.DefaultWarehouse.Name : null));
        CreateMap<CreateUserDto, User>();
        CreateMap<UpdateUserDto, User>();

        CreateMap<Role, RoleDto>();
    }
}
