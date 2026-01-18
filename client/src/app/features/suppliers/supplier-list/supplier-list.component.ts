import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SuppliersService } from '../suppliers.service';
import { Supplier, SupplierFilter } from '../../../core/models/supplier.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { DataColumnDirective } from '../../../shared/components/data-table/data-column.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-supplier-list',
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
    <div class="supplier-list-page">
      <div class="page-header">
        <div>
          <h1>Suppliers</h1>
          <p>Manage your supplier relationships</p>
        </div>
        <app-button variant="primary" (clicked)="router.navigate(['/suppliers/new'])">
          + Add Supplier
        </app-button>
      </div>

      <app-card [noPadding]="true">
        <app-data-table
          [data]="suppliers()"
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
          <app-data-column field="supplierCode" header="Code" [sortable]="true" width="100px"></app-data-column>
          <app-data-column field="companyName" header="Name" [sortable]="true"></app-data-column>
          <app-data-column field="primaryContactName" header="Contact"></app-data-column>
          <app-data-column field="primaryContactEmail" header="Email"></app-data-column>
          <app-data-column field="primaryContactPhone" header="Phone" width="120px"></app-data-column>
          <app-data-column field="defaultLeadTimeDays" header="Lead Time" width="100px">
            <ng-template let-value="value">
              {{ value ? value + ' days' : '-' }}
            </ng-template>
          </app-data-column>
          <app-data-column field="statusName" header="Status" width="100px">
            <ng-template let-value="value">
              <span class="status-badge" [class.active]="value === 'Active'" [class.inactive]="value !== 'Active'">
                {{ value }}
              </span>
            </ng-template>
          </app-data-column>
        </app-data-table>
      </app-card>

      <ng-template #actionsTemplate let-row="row">
        <div class="action-buttons">
          <button class="icon-btn" (click)="onEdit(row); $event.stopPropagation()" title="Edit">✏️</button>
          <button class="icon-btn danger" (click)="onDelete(row); $event.stopPropagation()" title="Delete">🗑️</button>
        </div>
      </ng-template>

      <app-modal
        [isOpen]="showDeleteModal()"
        title="Confirm Delete"
        (closed)="showDeleteModal.set(false)"
      >
        <p>Are you sure you want to delete <strong>{{ selectedSupplier()?.companyName }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div modal-footer>
          <app-button variant="ghost" (clicked)="showDeleteModal.set(false)">Cancel</app-button>
          <app-button variant="danger" [loading]="deleting()" (clicked)="confirmDelete()">Delete</app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .supplier-list-page {
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

    .warning-text {
      color: #ef4444;
      font-size: 0.875rem;
    }
  `]
})
export class SupplierListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly suppliersService = inject(SuppliersService);

  suppliers = signal<Supplier[]>([]);
  loading = signal(true);
  totalItems = signal(0);
  showDeleteModal = signal(false);
  selectedSupplier = signal<Supplier | null>(null);
  deleting = signal(false);

  filter: SupplierFilter = {
    pageNumber: 1,
    pageSize: 10
  };

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading.set(true);
    this.suppliersService.getSuppliers(this.filter).subscribe({
      next: (response: PaginatedResponse<Supplier>) => {
        this.suppliers.set(response.items);
        this.totalItems.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.suppliers.set([
          { supplierId: 1, supplierCode: 'SUP-001', companyName: 'Tech Distributors Inc', primaryContactName: 'John Smith', primaryContactEmail: 'john@techdist.com', primaryContactPhone: '555-0101', billingCity: 'San Jose', billingCountry: 'USA', defaultLeadTimeDays: 5, statusName: 'Active' },
          { supplierId: 2, supplierCode: 'SUP-002', companyName: 'Global Electronics', primaryContactName: 'Sarah Johnson', primaryContactEmail: 'sarah@globalelec.com', primaryContactPhone: '555-0102', billingCity: 'Austin', billingCountry: 'USA', defaultLeadTimeDays: 7, statusName: 'Active' },
          { supplierId: 3, supplierCode: 'SUP-003', companyName: 'Office Solutions Ltd', primaryContactName: 'Mike Brown', primaryContactEmail: 'mike@officesol.com', primaryContactPhone: '555-0103', billingCity: 'Seattle', billingCountry: 'USA', defaultLeadTimeDays: 3, statusName: 'Active' },
        ]);
        this.totalItems.set(3);
      }
    });
  }

  onSearch(term: string): void {
    this.filter.search = term;
    this.filter.pageNumber = 1;
    this.loadSuppliers();
  }

  onPageChange(page: number): void {
    this.filter.pageNumber = page;
    this.loadSuppliers();
  }

  onPageSizeChange(size: number): void {
    this.filter.pageSize = size;
    this.filter.pageNumber = 1;
    this.loadSuppliers();
  }

  onRowClick(supplier: Supplier): void {
    this.router.navigate(['/suppliers', supplier.supplierId]);
  }

  onEdit(supplier: Supplier): void {
    this.router.navigate(['/suppliers', supplier.supplierId]);
  }

  onDelete(supplier: Supplier): void {
    this.selectedSupplier.set(supplier);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const supplier = this.selectedSupplier();
    if (!supplier) return;

    this.deleting.set(true);
    this.suppliersService.deleteSupplier(supplier.supplierId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.loadSuppliers();
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}
