import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../inventory.service';
import { InventoryLevel, InventoryFilter, StockStatus } from '../../../core/models/inventory.model';
import { PaginatedResponse, LookupDto } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { DataColumnDirective } from '../../../shared/components/data-table/data-column.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    DataTableComponent,
    DataColumnDirective,
    ButtonComponent
  ],
  template: `
    <div class="inventory-list-page">
      <div class="page-header">
        <div>
          <h1>Inventory</h1>
          <p>View and manage stock levels across warehouses</p>
        </div>
        <div class="header-actions">
          <app-button variant="secondary" (clicked)="router.navigate(['/inventory/adjust'])">
            Adjust Stock
          </app-button>
          <app-button variant="primary" (clicked)="router.navigate(['/inventory/transfer'])">
            Transfer Stock
          </app-button>
        </div>
      </div>

      <app-card [noPadding]="true">
        <app-data-table
          [data]="inventory()"
          [loading]="loading()"
          [currentPage]="filter.pageNumber"
          [pageSize]="filter.pageSize"
          [totalItems]="totalItems()"
          [headerTemplate]="headerTemplate"
          (search)="onSearch($event)"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        >
          <app-data-column field="productSKU" header="SKU" [sortable]="true" width="120px"></app-data-column>
          <app-data-column field="productName" header="Product" [sortable]="true"></app-data-column>
          <app-data-column field="warehouseName" header="Warehouse" [sortable]="true"></app-data-column>
          <app-data-column field="binCode" header="Bin" width="100px"></app-data-column>
          <app-data-column field="quantityOnHand" header="On Hand" [sortable]="true" width="100px">
            <ng-template let-value="value">
              <span class="qty">{{ value }}</span>
            </ng-template>
          </app-data-column>
          <app-data-column field="quantityReserved" header="Reserved" width="100px">
            <ng-template let-value="value">
              <span class="qty reserved">{{ value }}</span>
            </ng-template>
          </app-data-column>
          <app-data-column field="quantityAvailable" header="Available" [sortable]="true" width="100px">
            <ng-template let-value="value">
              <span class="qty">{{ value }}</span>
            </ng-template>
          </app-data-column>
          <app-data-column field="statusName" header="Status" width="120px">
            <ng-template let-row="row">
              <span class="status-badge" [class]="getStatusClass(row.status)">
                {{ row.statusName }}
              </span>
            </ng-template>
          </app-data-column>
        </app-data-table>
      </app-card>

      <ng-template #headerTemplate>
        <div class="filters">
          <select [(ngModel)]="filter.warehouseId" (ngModelChange)="loadInventory()" class="filter-select">
            <option [ngValue]="undefined">All Warehouses</option>
            <option *ngFor="let wh of warehouses()" [ngValue]="wh.id">{{ wh.name }}</option>
          </select>
          <select [(ngModel)]="filter.stockStatus" (ngModelChange)="loadInventory()" class="filter-select">
            <option [ngValue]="undefined">All Statuses</option>
            <option [ngValue]="StockStatus.OK">OK</option>
            <option [ngValue]="StockStatus.Low">Low Stock</option>
            <option [ngValue]="StockStatus.Critical">Critical</option>
            <option [ngValue]="StockStatus.OutOfStock">Out of Stock</option>
          </select>
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="filter.lowStockOnly" (ngModelChange)="loadInventory()" />
            Low Stock Only
          </label>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .inventory-list-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      color: #1e293b;
    }

    .page-header p {
      margin: 0.25rem 0 0;
      color: #64748b;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      outline: none;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #374151;
      cursor: pointer;
    }

    .qty {
      font-weight: 500;
    }

    .qty.reserved {
      color: #f59e0b;
    }

    .qty.low {
      color: #ef4444;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.ok {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-badge.low {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-badge.critical {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .status-badge.out-of-stock {
      background-color: #f3f4f6;
      color: #4b5563;
    }

    .status-badge.overstock {
      background-color: #dbeafe;
      color: #1e40af;
    }
  `]
})
export class InventoryListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly inventoryService = inject(InventoryService);

  inventory = signal<InventoryLevel[]>([]);
  warehouses = signal<LookupDto[]>([]);
  loading = signal(true);
  totalItems = signal(0);

  StockStatus = StockStatus;

  filter: InventoryFilter = {
    pageNumber: 1,
    pageSize: 10
  };

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadInventory();
  }

  loadWarehouses(): void {
    this.warehouses.set([
      { id: 1, name: 'Main Warehouse - NYC' },
      { id: 2, name: 'West Coast - LA' },
      { id: 3, name: 'Distribution Center - Chicago' }
    ]);
  }

  loadInventory(): void {
    this.loading.set(true);
    this.inventoryService.getInventoryLevels(this.filter).subscribe({
      next: (response: PaginatedResponse<InventoryLevel>) => {
        this.inventory.set(response.items);
        this.totalItems.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.inventory.set([
          { stockLevelId: 1, productId: 1, productName: 'MacBook Pro 14"', productSKU: 'LAP-001', warehouseId: 1, warehouseName: 'Main Warehouse - NYC', quantityOnHand: 25, quantityReserved: 5, quantityAvailable: 20, quantityOnOrder: 0, quantityInTransit: 0, unitCost: 1999, totalValue: 49975, status: 'OK', statusName: 'OK' },
          { stockLevelId: 2, productId: 2, productName: 'Dell XPS 15', productSKU: 'LAP-002', warehouseId: 1, warehouseName: 'Main Warehouse - NYC', quantityOnHand: 8, quantityReserved: 0, quantityAvailable: 8, quantityOnOrder: 0, quantityInTransit: 0, unitCost: 1499, totalValue: 11992, status: 'Low', statusName: 'Low' },
          { stockLevelId: 3, productId: 3, productName: 'HP 27" 4K Monitor', productSKU: 'MON-001', warehouseId: 2, warehouseName: 'West Coast - LA', quantityOnHand: 0, quantityReserved: 0, quantityAvailable: 0, quantityOnOrder: 10, quantityInTransit: 0, unitCost: 449, totalValue: 0, status: 'OutOfStock', statusName: 'Out of Stock' },
        ]);
        this.totalItems.set(3);
      }
    });
  }

  onSearch(term: string): void {
    this.filter.search = term;
    this.filter.pageNumber = 1;
    this.loadInventory();
  }

  onPageChange(page: number): void {
    this.filter.pageNumber = page;
    this.loadInventory();
  }

  onPageSizeChange(size: number): void {
    this.filter.pageSize = size;
    this.filter.pageNumber = 1;
    this.loadInventory();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OK': return 'ok';
      case 'Low': return 'low';
      case 'Critical': return 'critical';
      case 'OutOfStock': return 'out-of-stock';
      case 'Overstock': return 'overstock';
      default: return '';
    }
  }
}
