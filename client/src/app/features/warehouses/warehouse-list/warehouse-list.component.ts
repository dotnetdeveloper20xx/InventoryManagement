import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WarehousesService } from '../warehouses.service';
import { Warehouse, WarehouseFilter } from '../../../core/models/warehouse.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { DataColumnDirective } from '../../../shared/components/data-table/data-column.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    DataTableComponent,
    DataColumnDirective,
    ButtonComponent,
    ModalComponent
  ],
  template: `
    <div class="warehouse-list-page">
      <div class="page-header">
        <div>
          <h1>Warehouses</h1>
          <p>Manage warehouse locations</p>
        </div>
        <app-button variant="primary" (clicked)="router.navigate(['/warehouses/new'])">
          + Add Warehouse
        </app-button>
      </div>

      <app-card [noPadding]="true">
        <app-data-table
          [data]="warehouses()"
          [loading]="loading()"
          [currentPage]="filter.pageNumber"
          [pageSize]="filter.pageSize"
          [totalItems]="totalItems()"
          [actionsTemplate]="actionsTemplate"
          (search)="onSearch($event)"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
          (rowClick)="onRowClick($event)"
        >
          <app-data-column field="warehouseCode" header="Code" [sortable]="true" width="100px"></app-data-column>
          <app-data-column field="name" header="Name" [sortable]="true"></app-data-column>
          <app-data-column field="city" header="City" [sortable]="true"></app-data-column>
          <app-data-column field="stateProvince" header="State" width="80px"></app-data-column>
          <app-data-column field="typeName" header="Type" width="120px">
            <ng-template let-value="value">
              <span class="type-badge">{{ value }}</span>
            </ng-template>
          </app-data-column>
          <app-data-column field="totalPalletPositions" header="Capacity" width="100px">
            <ng-template let-value="value">
              {{ value || 0 }} pallets
            </ng-template>
          </app-data-column>
          <app-data-column field="isActive" header="Status" width="100px">
            <ng-template let-value="value">
              <span class="status-badge" [class.active]="value" [class.inactive]="!value">
                {{ value ? 'Active' : 'Inactive' }}
              </span>
            </ng-template>
          </app-data-column>
        </app-data-table>
      </app-card>

      <ng-template #actionsTemplate let-row="row">
        <div class="action-buttons">
          <button class="icon-btn" (click)="onEdit(row); $event.stopPropagation()" title="Edit">✏️</button>
          <button class="icon-btn danger" (click)="onDelete(row); $event.stopPropagation()" title="Delete" [disabled]="row.isPrimary">🗑️</button>
        </div>
      </ng-template>

      <app-modal
        [isOpen]="showDeleteModal()"
        title="Confirm Delete"
        (closed)="showDeleteModal.set(false)"
      >
        <p>Are you sure you want to delete <strong>{{ selectedWarehouse()?.name }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div modal-footer>
          <app-button variant="ghost" (clicked)="showDeleteModal.set(false)">Cancel</app-button>
          <app-button variant="danger" [loading]="deleting()" (clicked)="confirmDelete()">Delete</app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .warehouse-list-page {
      max-width: 1200px;
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

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-badge.inactive {
      background-color: #f3f4f6;
      color: #4b5563;
    }

    .primary-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: #dbeafe;
      color: #1e40af;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: background 0.15s;
    }

    .icon-btn:hover {
      background: #f1f5f9;
    }

    .icon-btn.danger:hover {
      background: #fee2e2;
    }

    .icon-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .warning-text {
      color: #ef4444;
      font-size: 0.875rem;
    }
  `]
})
export class WarehouseListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly warehousesService = inject(WarehousesService);

  warehouses = signal<Warehouse[]>([]);
  loading = signal(true);
  totalItems = signal(0);
  showDeleteModal = signal(false);
  selectedWarehouse = signal<Warehouse | null>(null);
  deleting = signal(false);

  filter: WarehouseFilter = {
    pageNumber: 1,
    pageSize: 10
  };

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading.set(true);
    this.warehousesService.getWarehouses(this.filter).subscribe({
      next: (response: PaginatedResponse<Warehouse>) => {
        this.warehouses.set(response.items);
        this.totalItems.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.warehouses.set([
          { warehouseId: 1, warehouseCode: 'WH-NYC', name: 'Main Warehouse - NYC', city: 'New York', stateProvince: 'NY', country: 'USA', isActive: true, typeName: 'Main', totalPalletPositions: 1000 },
          { warehouseId: 2, warehouseCode: 'WH-LA', name: 'West Coast - LA', city: 'Los Angeles', stateProvince: 'CA', country: 'USA', isActive: true, typeName: 'Distribution', totalPalletPositions: 800 },
          { warehouseId: 3, warehouseCode: 'WH-CHI', name: 'Distribution Center - Chicago', city: 'Chicago', stateProvince: 'IL', country: 'USA', isActive: true, typeName: 'Distribution', totalPalletPositions: 700 },
        ]);
        this.totalItems.set(3);
      }
    });
  }

  onSearch(term: string): void {
    this.filter.search = term;
    this.filter.pageNumber = 1;
    this.loadWarehouses();
  }

  onPageChange(page: number): void {
    this.filter.pageNumber = page;
    this.loadWarehouses();
  }

  onPageSizeChange(size: number): void {
    this.filter.pageSize = size;
    this.filter.pageNumber = 1;
    this.loadWarehouses();
  }

  onRowClick(warehouse: Warehouse): void {
    this.router.navigate(['/warehouses', warehouse.warehouseId]);
  }

  onEdit(warehouse: Warehouse): void {
    this.router.navigate(['/warehouses', warehouse.warehouseId]);
  }

  onDelete(warehouse: Warehouse): void {
    this.selectedWarehouse.set(warehouse);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const warehouse = this.selectedWarehouse();
    if (!warehouse) return;

    this.deleting.set(true);
    this.warehousesService.deleteWarehouse(warehouse.warehouseId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.loadWarehouses();
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}
