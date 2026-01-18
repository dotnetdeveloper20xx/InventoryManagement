using Serilog;
using StockFlowPro.API.Extensions;
using StockFlowPro.API.Middleware;
using StockFlowPro.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();

// Add custom services
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddSwaggerDocumentation();
builder.Services.AddCorsPolicies(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "StockFlow Pro API v1");
        options.RoutePrefix = "swagger";
    });

    // Seed the database in development
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<StockFlowDbContext>();
    await SeedDevelopmentData(dbContext);
}

app.UseCors("AllowAngular");

// Only use HTTPS redirection in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Seed development data
static async Task SeedDevelopmentData(StockFlowDbContext context)
{
    // Add seed data if database is empty
    if (!context.Categories.Any())
    {
        // Add sample categories
        var categories = new[]
        {
            new StockFlowPro.Domain.Entities.Category { CategoryCode = "ELEC", Name = "Electronics", Path = "ELEC", FullPath = "Electronics", Level = 0, DisplayOrder = 1, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Category { CategoryCode = "OFFC", Name = "Office Supplies", Path = "OFFC", FullPath = "Office Supplies", Level = 0, DisplayOrder = 2, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Category { CategoryCode = "INDQ", Name = "Industrial Equipment", Path = "INDQ", FullPath = "Industrial Equipment", Level = 0, DisplayOrder = 3, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Category { CategoryCode = "FOOD", Name = "Food & Beverage", Path = "FOOD", FullPath = "Food & Beverage", Level = 0, DisplayOrder = 4, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Category { CategoryCode = "MEDC", Name = "Medical Supplies", Path = "MEDC", FullPath = "Medical Supplies", Level = 0, DisplayOrder = 5, IsActive = true, CreatedDate = DateTime.UtcNow }
        };
        context.Categories.AddRange(categories);

        // Add sample brands
        var brands = new[]
        {
            new StockFlowPro.Domain.Entities.Brand { BrandCode = "APPL", Name = "Apple", Country = "USA", IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Brand { BrandCode = "DELL", Name = "Dell", Country = "USA", IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Brand { BrandCode = "HP", Name = "HP", Country = "USA", IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Brand { BrandCode = "3M", Name = "3M", Country = "USA", IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Brand { BrandCode = "BOSCH", Name = "Bosch", Country = "Germany", IsActive = true, CreatedDate = DateTime.UtcNow }
        };
        context.Brands.AddRange(brands);

        // Add sample UOMs
        var uoms = new[]
        {
            new StockFlowPro.Domain.Entities.UnitOfMeasure { UOMCode = "EA", Name = "Each", Symbol = "ea", UOMType = "Quantity", IsBaseUnit = true, ConversionFactor = 1, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.UnitOfMeasure { UOMCode = "BOX", Name = "Box", Symbol = "box", UOMType = "Quantity", IsBaseUnit = false, ConversionFactor = 12, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.UnitOfMeasure { UOMCode = "CASE", Name = "Case", Symbol = "cs", UOMType = "Quantity", IsBaseUnit = false, ConversionFactor = 24, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.UnitOfMeasure { UOMCode = "KG", Name = "Kilogram", Symbol = "kg", UOMType = "Weight", IsBaseUnit = true, ConversionFactor = 1, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.UnitOfMeasure { UOMCode = "LTR", Name = "Liter", Symbol = "L", UOMType = "Volume", IsBaseUnit = true, ConversionFactor = 1, IsActive = true, CreatedDate = DateTime.UtcNow }
        };
        context.UnitsOfMeasure.AddRange(uoms);

        // Add sample warehouses
        var warehouses = new[]
        {
            new StockFlowPro.Domain.Entities.Warehouse { WarehouseCode = "WH-NYC", Name = "New York Distribution Center", Type = StockFlowPro.Domain.Enums.WarehouseType.Main, City = "New York", StateProvince = "NY", Country = "USA", TotalAreaSqFt = 50000, TotalPalletPositions = 1000, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Warehouse { WarehouseCode = "WH-LA", Name = "Los Angeles Fulfillment Center", Type = StockFlowPro.Domain.Enums.WarehouseType.Distribution, City = "Los Angeles", StateProvince = "CA", Country = "USA", TotalAreaSqFt = 40000, TotalPalletPositions = 800, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Warehouse { WarehouseCode = "WH-CHI", Name = "Chicago Regional Hub", Type = StockFlowPro.Domain.Enums.WarehouseType.Distribution, City = "Chicago", StateProvince = "IL", Country = "USA", TotalAreaSqFt = 35000, TotalPalletPositions = 700, IsActive = true, CreatedDate = DateTime.UtcNow }
        };
        context.Warehouses.AddRange(warehouses);

        // Add sample suppliers
        var suppliers = new[]
        {
            new StockFlowPro.Domain.Entities.Supplier { SupplierCode = "SUP-001", CompanyName = "Tech Distributors Inc", PrimaryContactName = "John Smith", PrimaryContactEmail = "john@techdist.com", PrimaryContactPhone = "555-0101", BillingCity = "San Jose", BillingStateProvince = "CA", BillingCountry = "USA", PaymentTerms = "Net 30", DefaultLeadTimeDays = 5, Status = StockFlowPro.Domain.Enums.SupplierStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Supplier { SupplierCode = "SUP-002", CompanyName = "Global Electronics", PrimaryContactName = "Sarah Johnson", PrimaryContactEmail = "sarah@globalelec.com", PrimaryContactPhone = "555-0102", BillingCity = "Austin", BillingStateProvince = "TX", BillingCountry = "USA", PaymentTerms = "Net 45", DefaultLeadTimeDays = 7, Status = StockFlowPro.Domain.Enums.SupplierStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Supplier { SupplierCode = "SUP-003", CompanyName = "Office Solutions Ltd", PrimaryContactName = "Mike Brown", PrimaryContactEmail = "mike@officesol.com", PrimaryContactPhone = "555-0103", BillingCity = "Seattle", BillingStateProvince = "WA", BillingCountry = "USA", PaymentTerms = "Net 30", DefaultLeadTimeDays = 3, Status = StockFlowPro.Domain.Enums.SupplierStatus.Active, CreatedDate = DateTime.UtcNow }
        };
        context.Suppliers.AddRange(suppliers);

        // Add sample roles
        var roles = new[]
        {
            new StockFlowPro.Domain.Entities.Role { RoleName = "Administrator", Description = "Full system access", IsSystem = true, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Role { RoleName = "Warehouse Manager", Description = "Manage warehouse operations", IsSystem = false, IsActive = true, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Role { RoleName = "Inventory Clerk", Description = "View and update inventory", IsSystem = false, IsActive = true, CreatedDate = DateTime.UtcNow }
        };
        context.Roles.AddRange(roles);

        await context.SaveChangesAsync();

        // Add test users after roles are saved
        // Password: Password123! (SHA256 hashed)
        var passwordHash = HashPassword("Password123!");
        var users = new[]
        {
            new StockFlowPro.Domain.Entities.User
            {
                Username = "admin",
                Email = "admin@stockflow.com",
                PasswordHash = passwordHash,
                FirstName = "System",
                LastName = "Administrator",
                RoleId = 1,
                DefaultWarehouseId = 1,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            },
            new StockFlowPro.Domain.Entities.User
            {
                Username = "demo",
                Email = "demo@stockflow.com",
                PasswordHash = passwordHash,
                FirstName = "Demo",
                LastName = "User",
                RoleId = 2,
                DefaultWarehouseId = 1,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            },
            new StockFlowPro.Domain.Entities.User
            {
                Username = "clerk",
                Email = "clerk@stockflow.com",
                PasswordHash = passwordHash,
                FirstName = "Inventory",
                LastName = "Clerk",
                RoleId = 3,
                DefaultWarehouseId = 2,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            }
        };
        context.Users.AddRange(users);

        // Add sample products after categories, brands, and UOMs are saved
        var products = new[]
        {
            new StockFlowPro.Domain.Entities.Product { SKU = "LAP-001", Name = "MacBook Pro 14\"", CategoryId = 1, BrandId = 1, PrimaryUOMId = 1, StandardCost = 1999.00m, MSRP = 2499.00m, ReorderPoint = 10, ReorderQuantity = 20, MinStockLevel = 5, MaxStockLevel = 100, Status = StockFlowPro.Domain.Enums.ProductStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Product { SKU = "LAP-002", Name = "Dell XPS 15", CategoryId = 1, BrandId = 2, PrimaryUOMId = 1, StandardCost = 1499.00m, MSRP = 1799.00m, ReorderPoint = 15, ReorderQuantity = 25, MinStockLevel = 5, MaxStockLevel = 150, Status = StockFlowPro.Domain.Enums.ProductStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Product { SKU = "MON-001", Name = "HP 27\" 4K Monitor", CategoryId = 1, BrandId = 3, PrimaryUOMId = 1, StandardCost = 449.00m, MSRP = 549.00m, ReorderPoint = 20, ReorderQuantity = 30, MinStockLevel = 10, MaxStockLevel = 200, Status = StockFlowPro.Domain.Enums.ProductStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Product { SKU = "OFC-001", Name = "Premium Copy Paper A4", CategoryId = 2, BrandId = 4, PrimaryUOMId = 3, StandardCost = 29.99m, MSRP = 39.99m, ReorderPoint = 50, ReorderQuantity = 100, MinStockLevel = 20, MaxStockLevel = 500, Status = StockFlowPro.Domain.Enums.ProductStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Product { SKU = "IND-001", Name = "Cordless Power Drill", CategoryId = 3, BrandId = 5, PrimaryUOMId = 1, StandardCost = 129.99m, MSRP = 179.99m, ReorderPoint = 25, ReorderQuantity = 30, MinStockLevel = 10, MaxStockLevel = 150, Status = StockFlowPro.Domain.Enums.ProductStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Product { SKU = "LAP-003", Name = "Lenovo ThinkPad X1", CategoryId = 1, BrandId = 2, PrimaryUOMId = 1, StandardCost = 1299.00m, MSRP = 1599.00m, ReorderPoint = 10, ReorderQuantity = 15, MinStockLevel = 5, MaxStockLevel = 80, Status = StockFlowPro.Domain.Enums.ProductStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Product { SKU = "ACC-001", Name = "Logitech MX Master 3 Mouse", CategoryId = 1, BrandId = 4, PrimaryUOMId = 1, StandardCost = 79.99m, MSRP = 99.99m, ReorderPoint = 30, ReorderQuantity = 50, MinStockLevel = 15, MaxStockLevel = 300, Status = StockFlowPro.Domain.Enums.ProductStatus.Active, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.Product { SKU = "ACC-002", Name = "USB-C Docking Station", CategoryId = 1, BrandId = 2, PrimaryUOMId = 1, StandardCost = 149.99m, MSRP = 199.99m, ReorderPoint = 20, ReorderQuantity = 25, MinStockLevel = 10, MaxStockLevel = 150, Status = StockFlowPro.Domain.Enums.ProductStatus.Active, CreatedDate = DateTime.UtcNow }
        };
        context.Products.AddRange(products);

        await context.SaveChangesAsync();

        // Add initial stock levels
        var stockLevels = new[]
        {
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 1, WarehouseId = 1, QuantityOnHand = 25, QuantityReserved = 5, QuantityAvailable = 20, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 2, WarehouseId = 1, QuantityOnHand = 18, QuantityReserved = 3, QuantityAvailable = 15, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 3, WarehouseId = 1, QuantityOnHand = 45, QuantityReserved = 0, QuantityAvailable = 45, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 4, WarehouseId = 1, QuantityOnHand = 120, QuantityReserved = 10, QuantityAvailable = 110, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 5, WarehouseId = 1, QuantityOnHand = 35, QuantityReserved = 5, QuantityAvailable = 30, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 1, WarehouseId = 2, QuantityOnHand = 15, QuantityReserved = 2, QuantityAvailable = 13, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 2, WarehouseId = 2, QuantityOnHand = 8, QuantityReserved = 0, QuantityAvailable = 8, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 6, WarehouseId = 1, QuantityOnHand = 22, QuantityReserved = 4, QuantityAvailable = 18, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 7, WarehouseId = 1, QuantityOnHand = 50, QuantityReserved = 8, QuantityAvailable = 42, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow },
            new StockFlowPro.Domain.Entities.StockLevel { ProductId = 8, WarehouseId = 1, QuantityOnHand = 30, QuantityReserved = 5, QuantityAvailable = 25, LastCountDate = DateTime.UtcNow, LastMovementDate = DateTime.UtcNow, CreatedDate = DateTime.UtcNow }
        };
        context.StockLevels.AddRange(stockLevels);

        await context.SaveChangesAsync();

        Log.Information("Database seeded with test data. Test users created:");
        Log.Information("  Username: admin    Password: Password123!");
        Log.Information("  Username: demo     Password: Password123!");
        Log.Information("  Username: clerk    Password: Password123!");
    }
}

// Helper function to hash passwords
static string HashPassword(string password)
{
    using var sha256 = System.Security.Cryptography.SHA256.Create();
    var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
    return Convert.ToBase64String(bytes);
}
