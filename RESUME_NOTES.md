# StockFlow Pro - Resume Notes
**Last Updated**: January 16, 2026

## Current State
- **Backend API**: Running on `http://localhost:5086` with seed data (users, products, warehouses, suppliers, categories, inventory)
- **Frontend**: Angular 19 app on `http://localhost:4200`
- **Database**: Entity Framework In-Memory database with seeded test data

## Test Credentials
- **Admin**: `admin@stockflow.com` / `Admin123!`
- **Manager**: `manager@stockflow.com` / `Manager123!`
- **User**: `user@stockflow.com` / `User123!`

## Completed Work

### Backend
- ASP.NET Core 8 Web API with JWT authentication
- All CRUD endpoints for: Products, Warehouses, Suppliers, Categories, Inventory, Purchase Orders
- Seed data configured in `DataSeeder.cs`
- HTTPS redirect disabled in development mode for Angular HTTP calls

### Frontend Pages Tested & Fixed
| Page | Status | Notes |
|------|--------|-------|
| Login | ✓ Working | JWT auth with token storage |
| Dashboard | ✓ Working | Summary cards and charts |
| Products | ✓ Working | Model updated to match API |
| Warehouses | ✓ Working | Model updated to match API |
| Suppliers | ✓ Working | Model updated to match API |
| Categories | ✓ Working | Model updated to match API |
| Inventory | ✓ Working | Model updated to match API |
| Purchase Orders | Pending Build | Model updates done, needs verification |

## Key Technical Patterns

### Backend
- Uses `JsonStringEnumConverter()` - all enums returned as strings
- DTOs in `Models/DTOs/` folder
- Services in `Services/` folder with interfaces

### Frontend
- Angular 19 standalone components with signal-based state management
- Custom UI components only (NO third-party libraries)
- Models must match backend DTO property names exactly
- Form validation uses `!!form.valid` to convert `boolean|null` to `boolean`

### Property Name Mappings (Angular ← API)
| Model | Angular Property | API Property |
|-------|-----------------|--------------|
| Product | status | status (string) |
| Warehouse | warehouseCode | warehouseCode |
| Warehouse | stateProvince | stateProvince |
| Supplier | supplierCode | supplierCode |
| Supplier | companyName | companyName |
| Supplier | primaryContactName | primaryContactName |
| Category | categoryCode | categoryCode |
| Category | fullPath | fullPath |
| Inventory | stockLevelId | stockLevelId |
| Inventory | productSKU | productSKU |
| Inventory | binCode | binCode |
| PurchaseOrder | poNumber | poNumber |
| PurchaseOrder | lineCount | lineCount |

## Last Task In Progress
**Testing Purchase Orders page**

Updates completed:
- `client/src/app/core/models/purchase-order.model.ts`:
  - Changed `orderNumber` → `poNumber`
  - Changed `lineItemCount` → `lineCount`
  - Changed status to string enum
- `client/src/app/features/purchase-orders/purchase-order-list/purchase-order-list.component.ts`:
  - Updated field references
  - Updated mock data in error handler

**Next action**: Run Angular build to verify changes compile successfully

## Next Steps
1. Run `npm run build` in `client` folder to verify purchase orders updates
2. Test purchase orders page in browser at `http://localhost:4200/purchase-orders`
3. Note: No seed data for purchase orders - page will show mock fallback data
4. Consider adding purchase order seed data if needed

## Commands to Start Development

### Start Backend
```bash
cd C:\Users\AfzalAhmed\source\repos\dotnetdeveloper20xx\InventoryManagement\src\StockFlowPro.API
dotnet run
```

### Start Frontend
```bash
cd C:\Users\AfzalAhmed\source\repos\dotnetdeveloper20xx\InventoryManagement\client
ng serve
```

### Build Frontend (to check for errors)
```bash
cd C:\Users\AfzalAhmed\source\repos\dotnetdeveloper20xx\InventoryManagement\client
npm run build
```

## Project Structure
```
InventoryManagement/
├── src/
│   └── StockFlowPro.API/          # ASP.NET Core 8 backend
│       ├── Controllers/
│       ├── Services/
│       ├── Models/
│       │   ├── Entities/
│       │   └── DTOs/
│       ├── Data/
│       │   ├── AppDbContext.cs
│       │   └── DataSeeder.cs
│       └── Program.cs
├── client/                         # Angular 19 frontend
│   └── src/app/
│       ├── core/
│       │   ├── models/            # TypeScript interfaces
│       │   └── services/          # Auth, HTTP services
│       ├── features/              # Feature modules
│       │   ├── products/
│       │   ├── warehouses/
│       │   ├── suppliers/
│       │   ├── categories/
│       │   ├── inventory/
│       │   └── purchase-orders/
│       └── shared/
│           └── components/        # Reusable UI components
└── RESUME_NOTES.md                # This file
```
