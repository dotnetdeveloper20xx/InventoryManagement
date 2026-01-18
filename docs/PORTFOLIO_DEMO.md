# StockFlow Pro - Portfolio Demo Document

================================================================================
## SECTION 1: PROJECT IDENTITY
================================================================================

```json
{
  "id": "stockflow-pro",
  "name": "StockFlow Pro",
  "tagline": "Real-time Inventory Intelligence for Modern Supply Chains",
  "elevatorPitch": "StockFlow Pro is an enterprise-grade Warehouse Management System that gives businesses real-time visibility and control over inventory across multiple warehouse locations. It eliminates spreadsheet-based tracking, prevents stockouts, and reduces carrying costs through intelligent reorder alerts and comprehensive audit trails.",
  "technicalSummary": "Built on Clean Architecture principles with ASP.NET Core 8 and Angular 19, StockFlow Pro features a 4-layer architecture separating Domain, Application, Infrastructure, and API concerns. The system implements the Repository and Unit of Work patterns, uses AutoMapper for DTO projections, and provides JWT-based authentication with role-based access control across 31 domain entities.",
  "problemStatement": "Businesses managing inventory across multiple warehouses struggle with spreadsheet-based tracking, leading to stockouts, overstocking, lost items, and manual errors. Without real-time visibility, managers cannot make informed decisions about purchasing, transfers, or stock allocation.",
  "solution": "StockFlow Pro provides a centralized command center for inventory operations with real-time stock levels, automated reorder alerts, multi-warehouse tracking, and complete audit trails. The system acts like a GPS for every product in every warehouse, telling managers exactly when to reorder, what to move, and how to optimize.",
  "targetUsers": [
    "Warehouse Managers - Need real-time visibility into stock levels across locations, transfer management, and receiving operations",
    "Inventory Clerks - Perform daily stock counts, adjustments, and receiving with handheld-ready interfaces",
    "Purchasing Managers - Create and manage purchase orders, track supplier performance, and optimize reorder points",
    "System Administrators - Manage users, configure system settings, and maintain audit compliance"
  ],
  "industryDomain": "Supply Chain & Logistics",
  "projectType": "Enterprise SaaS Platform"
}
```

================================================================================
## SECTION 2: COMPLETE TECH STACK
================================================================================

```json
{
  "techStack": {
    "backend": {
      "runtime": ".NET 8",
      "framework": "ASP.NET Core 8 Web API",
      "orm": "Entity Framework Core 8",
      "database": "SQL Server 2022 / In-Memory (Development)",
      "caching": "In-Memory Cache",
      "authentication": "JWT Bearer Tokens",
      "authorization": "Role-Based Access Control (RBAC)",
      "libraries": [
        "AutoMapper 12.x - Object-to-object mapping",
        "Serilog - Structured logging with console and file sinks",
        "Swashbuckle - OpenAPI/Swagger documentation",
        "System.IdentityModel.Tokens.Jwt - JWT token generation"
      ]
    },
    "frontend": {
      "framework": "Angular 19.2.0 with Standalone Components",
      "language": "TypeScript 5.7.2",
      "stateManagement": "Angular Signals + RxJS 7.8.0",
      "uiLibrary": "Custom SCSS components (no external UI library)",
      "forms": "Reactive Forms",
      "httpClient": "Angular HttpClient with Interceptors",
      "routing": "Angular Router with Guards"
    },
    "infrastructure": {
      "hosting": "Docker-ready / Azure App Service compatible",
      "database": "SQL Server 2022",
      "ci_cd": "GitHub Actions ready",
      "monitoring": "Serilog structured logging"
    },
    "architecture": {
      "pattern": "Clean Architecture (4-Layer)",
      "principles": ["SOLID", "Repository Pattern", "Unit of Work", "Dependency Injection"],
      "projectStructure": "4 projects: StockFlowPro.Domain (Entities), StockFlowPro.Application (Services, DTOs), StockFlowPro.Infrastructure (Data Access, Repositories), StockFlowPro.API (Controllers, Middleware)"
    }
  },
  "codeMetrics": {
    "csharpSourceFiles": 116,
    "typescriptFiles": 57,
    "domainEntities": 31,
    "apiControllers": 18,
    "applicationServices": 17,
    "angularComponents": "40+",
    "totalBackendLOC": "~8,000",
    "totalFrontendLOC": "~12,000"
  }
}
```

================================================================================
## SECTION 3: FEATURE INVENTORY
================================================================================

### Authentication & Authorization
- [x] User login with JWT tokens
- [x] Token refresh endpoint
- [x] Logout functionality
- [x] Role-based access control (3 roles: Administrator, Warehouse Manager, Inventory Clerk)
- [x] Route guards for protected pages
- [x] HTTP interceptor for automatic token attachment

### User Management
- [x] User profile view
- [x] User CRUD operations (Admin only)
- [x] User lock/unlock functionality
- [x] Password change
- [x] Default warehouse assignment per user

### Product Management
- [x] Product catalog with CRUD operations
- [x] SKU management with uniqueness validation
- [x] Barcode support
- [x] Category hierarchy (unlimited nesting)
- [x] Brand management
- [x] Multi-unit support (UOM) with conversions
- [x] Product images support
- [x] Product status (Active, Inactive, Discontinued)
- [x] Cost tracking (Standard Cost, Average Cost, Last Purchase Price)
- [x] Reorder point and quantity settings
- [x] Min/Max stock level configuration

### Inventory Control
- [x] Real-time stock level tracking
- [x] Multi-warehouse stock visibility
- [x] Stock status indicators (OK, Low, Critical, Out of Stock)
- [x] Reserved quantity tracking
- [x] Available quantity calculation
- [x] Bin location tracking (Aisle-Rack-Level-Bin)
- [x] Batch/Lot tracking with expiry dates
- [x] Stock movements history with audit trail
- [x] Stock adjustments with reason codes
- [x] Movement number auto-generation

### Warehouse Operations
- [x] Multi-warehouse management
- [x] Warehouse types (Main, Distribution, Retail, Cold Storage)
- [x] Zone management within warehouses
- [x] Bin location management
- [x] Capacity tracking (total pallet positions, area)
- [x] Warehouse status (Active, Inactive)

### Stock Transfers
- [x] Inter-warehouse transfer creation
- [x] Transfer approval workflow
- [x] Priority levels (Low, Normal, High, Urgent)
- [x] Ship transfer with tracking number and carrier
- [x] Receive transfer with variance tracking
- [x] Transfer rejection with reason
- [x] Transfer cancellation

### Purchase Orders
- [x] PO creation with line items
- [x] Supplier selection and management
- [x] Expected delivery date tracking
- [x] PO approval workflow (Draft → Submitted → Approved)
- [x] Payment terms and shipping terms
- [x] Multi-currency support
- [x] Discount and tax calculations
- [x] PO number auto-generation

### Goods Receiving
- [x] GRN (Goods Receipt Note) creation
- [x] PO matching
- [x] Quantity received vs ordered tracking
- [x] Quality inspection status
- [x] Rejected quantity tracking
- [x] Batch number and expiry date capture
- [x] Automatic stock level updates
- [x] Average cost recalculation on receipt

### Stock Counts (Physical Inventory)
- [x] Stock count creation
- [x] Count by warehouse/zone
- [x] Counted vs system quantity comparison
- [x] Variance calculation
- [x] Count approval and posting
- [x] Blind count option

### Supplier Management
- [x] Supplier CRUD operations
- [x] Multiple contacts per supplier
- [x] Address management (billing, shipping)
- [x] Payment terms configuration
- [x] Lead time tracking
- [x] Supplier status (Active, Inactive, Blocked)

### Dashboard & Analytics
- [x] Executive dashboard with KPIs
- [x] Total products count
- [x] Total inventory value
- [x] Low stock alerts count
- [x] Pending orders count
- [x] Quick action buttons
- [x] Recent activity feed

### Reports
- [x] Inventory valuation report
- [x] Stock movement report
- [x] Low stock report
- [x] Stock by warehouse report
- [x] Date range filtering

### Alerts & Notifications
- [x] Reorder point alerts
- [x] Low stock alerts
- [x] Alert acknowledgment
- [x] Alert history

### System Administration
- [x] System settings management
- [x] Number series configuration
- [x] Audit log viewing
- [x] Reason code management

### UI/UX Features
- [x] Responsive design (desktop optimized)
- [x] Loading states with spinners
- [x] Error handling with user feedback
- [x] Form validation with clear messages
- [x] Confirmation dialogs for destructive actions
- [x] Pagination for all lists
- [x] Search and filtering
- [x] Sortable columns

================================================================================
## SECTION 4: USER ROLES & PERMISSIONS
================================================================================

### Role 1: Administrator
**Description**: System administrator with full access to all features
**Access Level**: Full system access

**Can Do:**
- All product management operations (Create, Read, Update, Delete)
- All inventory operations (adjustments, transfers, counts)
- All purchase order operations
- All supplier management operations
- All warehouse and zone management
- User management (create, update, lock/unlock, delete)
- System settings configuration
- View all audit logs
- Access all warehouses

**Dashboard View:**
- Full executive dashboard with all KPIs
- Access to all reports
- All quick action buttons

---

### Role 2: Warehouse Manager
**Description**: Manages day-to-day warehouse operations
**Access Level**: Operational access

**Can Do:**
- View all products
- View and manage inventory for assigned warehouse
- Create and manage stock transfers
- Approve/reject transfers
- Create and manage stock counts
- Receive goods (GRN creation and posting)
- View purchase orders
- View and acknowledge alerts
- View movement history

**Cannot Do:**
- Delete products
- Manage users
- Change system settings
- Access other warehouses' sensitive data

**Dashboard View:**
- Warehouse-specific KPIs
- Pending transfers and receipts
- Low stock alerts for assigned warehouse

---

### Role 3: Inventory Clerk
**Description**: Day-to-day inventory data entry and tracking
**Access Level**: Limited operational access

**Can Do:**
- View products
- View stock levels
- Perform stock adjustments (with reason codes)
- Participate in stock counts
- View movement history
- Acknowledge alerts

**Cannot Do:**
- Create purchase orders
- Approve transfers
- Access admin functions
- Modify product master data

**Dashboard View:**
- Basic stock overview
- Assigned tasks
- Recent movements

================================================================================
## SECTION 5: USER JOURNEYS & WORKFLOWS
================================================================================

### Journey 1: Creating and Approving a Purchase Order

**Actor**: Purchasing Manager (Admin or Warehouse Manager)
**Goal**: Order stock from supplier to replenish inventory
**Preconditions**: Supplier and products exist in system

**Steps**:
1. Navigate to Purchase Orders → New Order
2. Select supplier from dropdown
3. Select destination warehouse
4. Set expected delivery date
5. Add line items:
   - Search/select product
   - Enter quantity and unit price
   - System calculates line total
6. Enter payment terms and shipping terms
7. Add any notes
8. Save as Draft
9. Review totals (subtotal, discount, tax, total)
10. Click "Submit for Approval"
11. Approver receives notification
12. Approver reviews PO details
13. Approver clicks "Approve" or "Reject with reason"
14. Upon approval, PO status changes to Approved
15. PO can be sent to supplier

**Success Criteria**: PO in Approved status, ready for receiving

---

### Journey 2: Receiving Goods Against a Purchase Order

**Actor**: Warehouse Clerk
**Goal**: Receive incoming inventory and update stock levels
**Preconditions**: Approved PO exists

**Steps**:
1. Navigate to Goods Receipts → Pending Receipts
2. Select PO from pending list
3. Click "Create Receipt"
4. Enter delivery note number from supplier
5. For each line item:
   - Enter received quantity
   - Enter rejected quantity (if any)
   - Select bin location
   - Enter batch number (if applicable)
   - Enter expiry date (if applicable)
   - Set inspection status
6. Review receipt totals
7. Save as Draft
8. Click "Post Receipt"
9. System updates:
   - Stock levels increase
   - PO line quantities received
   - Product average cost recalculated
   - Stock movement created
10. GRN number generated and receipt confirmed

**Success Criteria**: Stock levels updated, PO marked as received

---

### Journey 3: Inter-Warehouse Stock Transfer

**Actor**: Warehouse Manager
**Goal**: Move inventory from one warehouse to another
**Preconditions**: Stock exists in source warehouse

**Steps**:
1. Navigate to Transfers → New Transfer
2. Select source warehouse
3. Select destination warehouse
4. Set required date and priority
5. Add transfer lines:
   - Select product
   - Enter requested quantity
   - Select source bin (optional)
   - Select destination bin (optional)
6. System validates stock availability
7. Save transfer (Draft status)
8. Submit for approval
9. Approver reviews and approves quantities
10. Source warehouse ships transfer:
    - Enter shipped quantities
    - Enter tracking number and carrier
    - System deducts from source stock
11. Destination warehouse receives:
    - Enter received quantities
    - Note any variances
    - System adds to destination stock
12. Transfer completed

**Success Criteria**: Stock moved between warehouses with full audit trail

---

### Journey 4: Physical Inventory Count

**Actor**: Inventory Clerk and Warehouse Manager
**Goal**: Verify system quantities against physical counts
**Preconditions**: Products have stock levels

**Steps**:
1. Manager creates new Stock Count
2. Select warehouse and optional zone
3. Select products to count (or count all)
4. System generates count sheet with expected quantities
5. Optional: Enable blind count (hides expected quantities)
6. Clerks perform physical count
7. Enter counted quantities for each item
8. System calculates variances
9. Manager reviews variances
10. Investigate discrepancies
11. Manager approves count
12. System posts adjustments automatically
13. Stock levels updated to counted quantities
14. Audit trail created for all adjustments

**Success Criteria**: System quantities match physical reality

---

### Journey 5: Reorder Alert Response

**Actor**: Purchasing Manager
**Goal**: Respond to low stock alert by creating PO
**Preconditions**: Product reaches reorder point

**Steps**:
1. Dashboard shows low stock alert count
2. Click alert to view details
3. See products below reorder point
4. Click "Create PO" action from alert
5. System pre-fills:
   - Product and quantity (reorder quantity)
   - Preferred supplier
6. Review and modify as needed
7. Add additional products if batching orders
8. Submit PO for approval
9. Acknowledge alert
10. Alert cleared when stock received

**Success Criteria**: Proactive reordering prevents stockouts

================================================================================
## SECTION 6: DATA MODEL OVERVIEW
================================================================================

### Entity: Product
**Purpose**: Master data for inventory items
**Key Fields**:
- ProductId (int, PK)
- SKU (string, unique, required)
- Name (string, required)
- Description (string)
- CategoryId (FK to Category)
- BrandId (FK to Brand)
- PrimaryUOMId (FK to UnitOfMeasure)
- StandardCost (decimal)
- AverageCost (decimal)
- MSRP (decimal)
- ReorderPoint (decimal)
- ReorderQuantity (decimal)
- MinStockLevel, MaxStockLevel (decimal)
- Status (enum: Active, Inactive, Discontinued)

**Relationships**:
- Belongs to Category (many-to-one)
- Belongs to Brand (many-to-one)
- Has many StockLevels
- Has many ProductSuppliers
- Has many ProductImages

---

### Entity: StockLevel
**Purpose**: Current inventory position for product at location
**Key Fields**:
- StockLevelId (int, PK)
- ProductId (FK)
- WarehouseId (FK)
- BinId (FK, optional)
- BatchId (FK, optional)
- QuantityOnHand (decimal)
- QuantityReserved (decimal)
- QuantityAvailable (computed)
- UnitCost (decimal)
- Status (enum: OK, Low, Critical, OutOfStock)
- LastMovementDate, LastCountDate

**Relationships**:
- Belongs to Product
- Belongs to Warehouse
- Belongs to Bin (optional)
- Belongs to Batch (optional)

---

### Entity: PurchaseOrder
**Purpose**: Order to supplier for inventory replenishment
**Key Fields**:
- PurchaseOrderId (int, PK)
- PONumber (string, unique, auto-generated)
- SupplierId (FK)
- WarehouseId (FK)
- OrderDate (DateTime)
- ExpectedDeliveryDate (DateTime)
- Status (enum: Draft, Submitted, Approved, Rejected, etc.)
- Subtotal, DiscountAmount, TaxAmount, TotalAmount (decimal)
- CreatedByUserId, ApprovedByUserId (FK)

**Relationships**:
- Belongs to Supplier
- Has many PurchaseOrderLines
- Has many GoodsReceipts

---

### Entity: Transfer
**Purpose**: Inter-warehouse stock movement
**Key Fields**:
- TransferId (int, PK)
- TransferNumber (string, unique)
- FromWarehouseId, ToWarehouseId (FK)
- RequestedDate, RequiredDate, ShippedDate, ReceivedDate
- Status (enum: Draft, Submitted, Approved, Shipped, Received, etc.)
- Priority (enum: Low, Normal, High, Urgent)
- TrackingNumber, Carrier

**Relationships**:
- Belongs to FromWarehouse, ToWarehouse
- Has many TransferLines
- Belongs to RequestedBy, ApprovedBy (Users)

---

### Key Relationships Diagram
```
Category (1) → (*) Product
Brand (1) → (*) Product
Product (1) → (*) StockLevel → (*) Warehouse
Product (*) → (*) Supplier (via ProductSupplier)
Supplier (1) → (*) PurchaseOrder → (*) PurchaseOrderLine → (1) Product
PurchaseOrder (1) → (*) GoodsReceipt → (*) GoodsReceiptLine
Transfer (1) → (*) TransferLine → (1) Product
Warehouse (1) → (*) Zone (1) → (*) Bin
StockMovement → References (PurchaseOrder | GoodsReceipt | Transfer | StockAdjustment)
```

================================================================================
## SECTION 7: API ENDPOINTS
================================================================================

### Authentication (3 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/login | User login, returns JWT | No |
| POST | /api/auth/logout | Invalidate session | Yes |
| POST | /api/auth/refresh | Refresh JWT token | Yes |

### Products (7 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/products | Paginated product list | Yes |
| GET | /api/products/{id} | Get product by ID | Yes |
| GET | /api/products/lookup | Product dropdown data | Yes |
| GET | /api/products/check-sku/{sku} | Check SKU uniqueness | Yes |
| POST | /api/products | Create product | Yes |
| PUT | /api/products/{id} | Update product | Yes |
| DELETE | /api/products/{id} | Delete product | Admin |

### Categories (5 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/categories | All categories | Yes |
| GET | /api/categories/tree | Category hierarchy | Yes |
| GET | /api/categories/{id} | Get category | Yes |
| POST | /api/categories | Create category | Yes |
| PUT | /api/categories/{id} | Update category | Yes |

### Inventory (6 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/inventory | Paginated stock levels | Yes |
| GET | /api/inventory/{productId}/{warehouseId} | Stock at location | Yes |
| GET | /api/inventory/product/{productId}/summary | Stock summary | Yes |
| GET | /api/inventory/low-stock/{warehouseId} | Low stock items | Yes |
| GET | /api/inventory/movements/{productId} | Movement history | Yes |
| POST | /api/inventory/adjust | Stock adjustment | Yes |

### Purchase Orders (6 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/purchaseorders | Paginated PO list | Yes |
| GET | /api/purchaseorders/{id} | Get PO with lines | Yes |
| GET | /api/purchaseorders/pending-receipts | POs awaiting receipt | Yes |
| POST | /api/purchaseorders | Create PO | Yes |
| POST | /api/purchaseorders/{id}/submit | Submit for approval | Yes |
| POST | /api/purchaseorders/{id}/approve | Approve PO | Admin |

### Goods Receipts (5 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/goodsreceipts | Paginated GRN list | Yes |
| GET | /api/goodsreceipts/{id} | Get GRN with lines | Yes |
| GET | /api/goodsreceipts/pending | POs pending receipt | Yes |
| POST | /api/goodsreceipts | Create GRN | Yes |
| POST | /api/goodsreceipts/{id}/post | Post GRN to inventory | Yes |

### Transfers (5 endpoints)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/transfers | Paginated transfer list | Yes |
| GET | /api/transfers/{id} | Get transfer details | Yes |
| POST | /api/transfers | Create transfer | Yes |
| POST | /api/transfers/{id}/approve | Approve transfer | Yes |
| POST | /api/transfers/{id}/ship | Ship transfer | Yes |

### Additional Controllers
- **Warehouses**: 5 endpoints (CRUD + lookup)
- **Zones**: 5 endpoints (CRUD + by warehouse)
- **Bins**: 5 endpoints (CRUD + by zone)
- **Suppliers**: 5 endpoints (CRUD + lookup)
- **StockCounts**: 5 endpoints (CRUD + post)
- **Reports**: 6 endpoints (various report types)
- **Alerts**: 5 endpoints (list, acknowledge, dismiss)
- **Settings**: 4 endpoints (system configuration)
- **AuditLogs**: 2 endpoints (list, detail)
- **Users**: 6 endpoints (CRUD + lock/unlock)

**Total Endpoint Count**: 68+ endpoints

================================================================================
## SECTION 8: BUSINESS RULES & VALIDATION
================================================================================

### Inventory Rules

1. **Stock Availability Check**
   - Transfers cannot exceed available quantity
   - Available = On Hand - Reserved
   - Error: "Insufficient stock for product {SKU}"

2. **Reorder Point Alert**
   - Alert generated when Quantity On Hand <= Reorder Point
   - Alert cleared when stock received above reorder point

3. **Transfer Validation**
   - Source and destination warehouses must be different
   - Error: "Source and destination warehouses cannot be the same"

4. **Stock Level Status Calculation**
   - OutOfStock: Quantity = 0
   - Critical: Quantity <= Min Stock Level
   - Low: Quantity <= Reorder Point
   - OK: Quantity > Reorder Point

### Purchase Order Rules

1. **PO Workflow States**
   - Draft → Submitted → Approved → Sent → PartiallyReceived → FullyReceived
   - Only Draft can be submitted
   - Only Submitted can be approved/rejected

2. **Rejection Returns to Draft**
   - Rejected POs return to Draft status
   - Revision number incremented

3. **Receiving Validation**
   - Can only receive against Approved or PartiallyReceived POs
   - Received quantity cannot exceed ordered quantity

### Transfer Rules

1. **Transfer Workflow**
   - Draft → Submitted → Approved → Shipped → Received
   - Can cancel any status except Shipped or Received

2. **Variance Tracking**
   - Variance = Shipped Quantity - Received Quantity
   - Variance logged for investigation

### Validation Rules

| Field | Entity | Rules | Error Message |
|-------|--------|-------|---------------|
| SKU | Product | Required, unique, max 50 chars | "SKU is required and must be unique" |
| Name | Product | Required, max 200 chars | "Product name is required" |
| Email | User | Required, valid email format | "Please enter a valid email" |
| Password | User | Min 8 chars, SHA256 hashed | "Password must be at least 8 characters" |
| Quantity | StockLevel | >= 0 | "Quantity cannot be negative" |
| UnitPrice | PO Line | > 0, max 2 decimal places | "Price must be greater than zero" |

================================================================================
## SECTION 9: EMAIL TEMPLATES
================================================================================

**Note**: Email notifications are planned for future implementation. Documented templates:

| Email Type | Trigger | Recipient | Key Content |
|------------|---------|-----------|-------------|
| Low Stock Alert | Product reaches reorder point | Purchasing Manager | Product details, current qty, reorder point |
| PO Approval Request | PO submitted | Approvers | PO details, line items, total |
| PO Approved | PO approved | Requester | PO number, approval date |
| Transfer Request | Transfer submitted | Approvers | From/to warehouse, items |
| GRN Posted | Goods received | PO Creator | GRN number, received quantities |

**Total Email Templates**: 5 (planned)

================================================================================
## SECTION 10: SCREENSHOTS SPECIFICATION
================================================================================

### PRIMARY (Card Thumbnail)
**Filename**: 1.png
**Screen**: Executive Dashboard
**What to Capture**: Main dashboard with KPIs, quick actions, and analytics
**Why Important**: Shows the command center view that managers see

---

### SECONDARY (Demo Page Gallery)

**Filename**: 2.png
**Screen**: Products List
**What to Capture**: Product listing with SKU, name, category, quantity, cost, status
**Why Important**: Demonstrates product catalog management

**Filename**: 3.png
**Screen**: Edit Product Form
**What to Capture**: Product form with basic info, pricing, inventory settings
**Why Important**: Shows form handling and data entry

**Filename**: 4.png
**Screen**: Inventory List
**What to Capture**: Stock levels by warehouse with status indicators
**Why Important**: Core inventory tracking feature

**Filename**: 5.png
**Screen**: Stock Transfer
**What to Capture**: Transfer form for inter-warehouse movements
**Why Important**: Multi-warehouse operations

**Filename**: 6.png
**Screen**: Suppliers List
**What to Capture**: Supplier listing with contact info and lead times
**Why Important**: Supplier relationship management

**Filename**: 7.png
**Screen**: Edit Supplier Form
**What to Capture**: Supplier details form
**Why Important**: Comprehensive data management

**Filename**: 8.png
**Screen**: New Purchase Order
**What to Capture**: PO creation with line items
**Why Important**: Complex multi-line document handling

**Filename**: 9.png
**Screen**: Dashboard (alternate view)
**What to Capture**: Clean dashboard with key metrics
**Why Important**: KPI visualization

================================================================================
## SECTION 11: SECURITY FEATURES
================================================================================

### Authentication
- [x] Password hashing: SHA256 (consider upgrading to BCrypt for production)
- [x] JWT token expiration: 8 hours (configurable)
- [x] Token refresh endpoint implemented
- [x] Secure cookie settings planned

### Authorization
- [x] Role-based access control (3 roles)
- [x] Route guards on frontend
- [x] [Authorize] attributes on API endpoints
- [x] Current user context in services

### Data Protection
- [x] Input validation (server-side via DTOs)
- [x] SQL injection prevention (parameterized queries via EF Core)
- [x] XSS prevention (Angular sanitization)
- [x] HTTPS enforcement (production)

### API Security
- [x] CORS policy (origin-restricted)
- [x] JWT validation
- [x] Exception handling middleware
- [ ] Rate limiting (planned)

### Audit & Compliance
- [x] Audit logging (user actions tracked)
- [x] Timestamp tracking on all entities
- [x] User tracking on all modifications

================================================================================
## SECTION 12: PERFORMANCE CHARACTERISTICS
================================================================================

### Database
- **Indexes**: Primary keys, foreign keys, unique constraints (SKU, PONumber, etc.)
- **Query Optimization**: EF Core with Include() for eager loading
- **Connection Pooling**: EF Core default pooling

### Caching
- **In-Memory Cache**: Development environment
- **Cache Strategy**: Lookup data (categories, UOMs) cached
- **Cache Invalidation**: On entity modifications

### Frontend
- **Lazy Loaded Modules**: All feature modules use lazy loading
- **Standalone Components**: Angular 19 standalone architecture
- **Bundle Optimization**: Angular production build with tree shaking

### API
- **Pagination**: Default page size 10-25 items
- **Response Compression**: Gzip enabled
- **Async Operations**: All service methods are async

================================================================================
## SECTION 13: DEMO CREDENTIALS & TEST DATA
================================================================================

### Administrator Account
- **Username**: admin
- **Password**: Password123!
- **What to explore**: User management, system settings, all reports, full access

### Warehouse Manager Account
- **Username**: demo
- **Password**: Password123!
- **What to explore**: Daily operations, transfers, receiving, stock management

### Inventory Clerk Account
- **Username**: clerk
- **Password**: Password123!
- **What to explore**: Stock adjustments, counts, movement viewing

### Test Data Highlights
- 3 warehouses (NYC, LA, Chicago)
- 8 products across categories
- 5 categories (Electronics, Office, Industrial, Food, Medical)
- 5 brands
- 3 suppliers
- Stock levels with realistic quantities
- Date range: Current data

================================================================================
## SECTION 14: COMPETITIVE DIFFERENTIATORS
================================================================================

### Technical Excellence
1. **Clean Architecture Implementation** - True 4-layer separation with proper dependency flow (Domain ← Application ← Infrastructure ← API)
2. **Modern Angular 19 with Signals** - Latest Angular features including standalone components and reactive signals
3. **Comprehensive Domain Model** - 31 entities covering full WMS domain

### Enterprise Patterns Demonstrated
1. **Repository + Unit of Work** - Proper data access abstraction
2. **DTO Projections with AutoMapper** - Clean API responses
3. **Global Exception Handling** - Consistent error responses with proper HTTP status codes
4. **Audit Trail** - Complete tracking of all user actions

### Problem-Solving Examples
1. **Multi-Warehouse Stock Tracking** - Complex stock level management across locations with transfers
2. **Document Workflows** - PO approval, GRN posting, transfer workflows with state machines
3. **Real-time Stock Calculations** - Available = On Hand - Reserved with automatic updates

### Code Quality Indicators
- Consistent naming conventions
- Service-based architecture
- Typed DTOs for all API communications
- Comprehensive error handling
- Structured logging with Serilog

================================================================================
## SECTION 15: FUTURE ROADMAP
================================================================================

### Short-term (Nice to have)
- [ ] Real-time notifications via SignalR
- [ ] Email notifications for alerts
- [ ] Advanced filtering and saved searches
- [ ] Dark mode theme

### Medium-term (Valuable additions)
- [ ] Barcode scanning integration
- [ ] Batch import/export (CSV, Excel)
- [ ] Advanced reporting with charts
- [ ] Mobile companion app

### Long-term (Vision)
- [ ] Multi-tenant SaaS deployment
- [ ] ERP integration APIs
- [ ] AI-powered demand forecasting
- [ ] IoT sensor integration

================================================================================
## SECTION 16: COLOR & ICON RECOMMENDATION
================================================================================

### Banner Color
**Recommended**: teal (#008272)
**Reason**: Teal conveys trust, professionalism, and efficiency - perfect for supply chain and logistics software. It also differentiates from typical blue enterprise software.

### Icon Suggestion
**Primary Icon**: Warehouse/boxes with flow arrows - representing inventory movement
**Alternative Icons**:
- Stacked boxes with checkmark
- Forklift with package
- Inventory barcode with shelves

**SVG Concept**: A stylized warehouse building silhouette with three horizontal layers (representing shelves) and an upward arrow indicating stock flow/growth

### Color Reference
- **teal** (#008272) - Supply chain, logistics, operational efficiency, trust
