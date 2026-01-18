using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StockFlowPro.API.Services;
using StockFlowPro.Application.Common.Mappings;
using StockFlowPro.Application.Services.Implementations;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Infrastructure.Data;
using StockFlowPro.Infrastructure.Repositories.Implementations;
using StockFlowPro.Infrastructure.Repositories.Interfaces;
using System.Text;

namespace StockFlowPro.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<StockFlowDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("InMemory"))
            {
                // Use in-memory database for development
                options.UseInMemoryDatabase("StockFlowProDb");
            }
            else
            {
                options.UseSqlServer(connectionString);
            }
        });

        // Repositories
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // HttpContext accessor for current user service
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // AutoMapper
        services.AddAutoMapper(typeof(MappingProfile).Assembly);

        // Services
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IWarehouseService, WarehouseService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();

        // New Services
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IGoodsReceiptService, GoodsReceiptService>();
        services.AddScoped<ITransferService, TransferService>();
        services.AddScoped<IStockCountService, StockCountService>();
        services.AddScoped<IAlertService, AlertService>();
        services.AddScoped<IZoneService, ZoneService>();
        services.AddScoped<IBinService, BinService>();
        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<IAuditLogService, AuditLogService>();

        return services;
    }

    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
            {
                Title = "StockFlow Pro API",
                Version = "v1",
                Description = "Enterprise Inventory & Warehouse Management System API",
                Contact = new Microsoft.OpenApi.Models.OpenApiContact
                {
                    Name = "StockFlow Pro Team",
                    Email = "support@stockflowpro.com"
                }
            });

            // Enable XML comments
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }
        });

        return services;
    }

    public static IServiceCollection AddCorsPolicies(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAngular", builder =>
            {
                builder
                    .WithOrigins("http://localhost:4200", "https://localhost:4200")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });

            // Production policy - configure allowed origins from configuration
            options.AddPolicy("Production", builder =>
            {
                builder
                    .WithOrigins(configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey must be configured in appsettings.json under JwtSettings:SecretKey");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"] ?? "StockFlowPro",
                ValidAudience = jwtSettings["Audience"] ?? "StockFlowProClient",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
            };
        });

        return services;
    }
}
