import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PurchaseOrdersService } from '../purchase-orders.service';
import { PurchaseOrder, PurchaseOrderFilter, POStatus } from '../../../core/models/purchase-order.model';
import { PaginatedResponse, LookupDto } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { DataColumnDirective } from '../../../shared/components/data-table/data-column.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-purchase-order-list',
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
    <div class="po-list-page">
      <div class="page-header">
        <div>
          <h1>Purchase Orders</h1>
          <p>Manage purchase orders and receipts</p>
        </div>
        <app-button variant="primary" (clicked)="router.navigate(['/purchase-orders/new'])">
          + New Purchase Order
        </app-button>
      </div>

      <app-card [noPadding]="true">
        <app-data-table
          [data]="purchaseOrders()"
          [loading]="loading()"
          [currentPage]="filter.pageNumber"
          [pageSize]="filter.pageSize"
          [totalItems]="totalItems()"
          [headerTemplate]="headerTemplate"
          [actionsTemplate]="actionsTemplate"
          (search)="onSearch($event)"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
          (rowClick)="onRowClick($event)"
        >
          <app-data-column field="poNumber" header="PO #" [sortable]="true" width="130px"></app-data-column>
          <app-data-column field="supplierName" header="Supplier" [sortable]="true"></app-data-column>
          <app-data-column field="warehouseName" header="Warehouse"></app-data-column>
          <app-data-column field="orderDate" header="Order Date" [sortable]="true" width="120px">
            <ng-template let-value="value">
              {{ value | date:'shortDate' }}
            </ng-template>
          </app-data-column>
          <app-data-column field="expectedDeliveryDate" header="Expected" width="120px">
            <ng-template let-value="value">
              {{ value ? (value | date:'shortDate') : '-' }}
            </ng-template>
          </app-data-column>
          <app-data-column field="lineCount" header="Items" width="80px"></app-data-column>
          <app-data-column field="totalAmount" header="Total" [sortable]="true" width="120px">
            <ng-template let-value="value">
              {{ value | currency }}
            </ng-template>
          </app-data-column>
          <app-data-column field="status" header="Status" width="130px">
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
          <select [(ngModel)]="filter.supplierId" (ngModelChange)="loadPurchaseOrders()" class="filter-select">
            <option [ngValue]="undefined">All Suppliers</option>
            <option *ngFor="let s of suppliers()" [ngValue]="s.id">{{ s.name }}</option>
          </select>
          <select [(ngModel)]="filter.status" (ngModelChange)="loadPurchaseOrders()" class="filter-select">
            <option [ngValue]="undefined">All Statuses</option>
            <option [ngValue]="POStatus.Draft">Draft</option>
            <option [ngValue]="POStatus.Submitted">Submitted</option>
            <option [ngValue]="POStatus.Approved">Approved</option>
            <option [ngValue]="POStatus.Ordered">Ordered</option>
            <option [ngValue]="POStatus.PartiallyReceived">Partially Received</option>
            <option [ngValue]="POStatus.Received">Received</option>
            <option [ngValue]="POStatus.Cancelled">Cancelled</option>
          </select>
        </div>
      </ng-template>

      <ng-template #actionsTemplate let-row="row">
        <div class="action-buttons">
          <button class="icon-btn" (click)="onView(row); $event.stopPropagation()" title="View">👁️</button>
          <button class="icon-btn" *ngIf="row.status === POStatus.Draft" (click)="onEdit(row); $event.stopPropagation()" title="Edit">✏️</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .po-list-page {
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

    .filters {
      display: flex;
      gap: 1rem;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      outline: none;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.draft {
      background-color: #f3f4f6;
      color: #4b5563;
    }

    .status-badge.submitted {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-badge.approved {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .status-badge.ordered {
      background-color: #e0e7ff;
      color: #3730a3;
    }

    .status-badge.partially-received {
      background-color: #fed7aa;
      color: #9a3412;
    }

    .status-badge.received {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-badge.cancelled {
      background-color: #fee2e2;
      color: #991b1b;
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
  `]
})
export class PurchaseOrderListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);

  purchaseOrders = signal<PurchaseOrder[]>([]);
  suppliers = signal<LookupDto[]>([]);
  loading = signal(true);
  totalItems = signal(0);

  POStatus = POStatus;

  filter: PurchaseOrderFilter = {
    pageNumber: 1,
    pageSize: 10
  };

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadPurchaseOrders();
  }

  loadSuppliers(): void {
    this.suppliers.set([
      { id: 1, name: 'Tech Distributors Inc' },
      { id: 2, name: 'Global Electronics' },
      { id: 3, name: 'Office Solutions Ltd' }
    ]);
  }

  loadPurchaseOrders(): void {
    this.loading.set(true);
    this.purchaseOrdersService.getPurchaseOrders(this.filter).subscribe({
      next: (response: PaginatedResponse<PurchaseOrder>) => {
        this.purchaseOrders.set(response.items);
        this.totalItems.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.purchaseOrders.set([
          { purchaseOrderId: 1, poNumber: 'PO-2025-0042', supplierId: 1, supplierName: 'Tech Distributors Inc', warehouseId: 1, warehouseName: 'Main Warehouse - NYC', orderDate: new Date(), expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'Approved', statusName: 'Approved', subtotal: 15000, taxAmount: 1200, shippingCost: 150, totalAmount: 16350, lineCount: 5, createdDate: new Date() },
          { purchaseOrderId: 2, poNumber: 'PO-2025-0041', supplierId: 2, supplierName: 'Global Electronics', warehouseId: 1, warehouseName: 'Main Warehouse - NYC', orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'PartiallyReceived', statusName: 'Partially Received', subtotal: 8500, taxAmount: 680, shippingCost: 100, totalAmount: 9280, lineCount: 3, createdDate: new Date() },
          { purchaseOrderId: 3, poNumber: 'PO-2025-0040', supplierId: 1, supplierName: 'Tech Distributors Inc', warehouseId: 2, warehouseName: 'West Coast - LA', orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'Received', statusName: 'Received', subtotal: 22000, taxAmount: 1760, shippingCost: 200, totalAmount: 23960, lineCount: 8, createdDate: new Date() },
        ]);
        this.totalItems.set(3);
      }
    });
  }

  onSearch(term: string): void {
    this.filter.search = term;
    this.filter.pageNumber = 1;
    this.loadPurchaseOrders();
  }

  onPageChange(page: number): void {
    this.filter.pageNumber = page;
    this.loadPurchaseOrders();
  }

  onPageSizeChange(size: number): void {
    this.filter.pageSize = size;
    this.filter.pageNumber = 1;
    this.loadPurchaseOrders();
  }

  onRowClick(order: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders', order.purchaseOrderId]);
  }

  onView(order: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders', order.purchaseOrderId]);
  }

  onEdit(order: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders', order.purchaseOrderId, 'edit']);
  }

  getStatusClass(status: POStatus): string {
    switch (status) {
      case POStatus.Draft: return 'draft';
      case POStatus.Submitted: return 'submitted';
      case POStatus.Approved: return 'approved';
      case POStatus.Ordered: return 'ordered';
      case POStatus.PartiallyReceived: return 'partially-received';
      case POStatus.Received: return 'received';
      case POStatus.Cancelled: return 'cancelled';
      default: return '';
    }
  }
}
