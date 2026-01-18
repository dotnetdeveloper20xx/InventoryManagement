import { Component, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../products.service';
import { Product, ProductFilter, ProductStatus } from '../../../core/models/product.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { DataColumnDirective } from '../../../shared/components/data-table/data-column.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    DataTableComponent,
    DataColumnDirective,
    ButtonComponent,
    ModalComponent
  ],
  template: `
    <div class="product-list-page">
      <div class="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <app-button variant="primary" (clicked)="router.navigate(['/products/new'])">
          + Add Product
        </app-button>
      </div>

      <app-card [noPadding]="true">
        <app-data-table
          [data]="products()"
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
          <app-data-column field="sku" header="SKU" [sortable]="true" width="120px"></app-data-column>
          <app-data-column field="name" header="Name" [sortable]="true"></app-data-column>
          <app-data-column field="categoryName" header="Category" [sortable]="true"></app-data-column>
          <app-data-column field="totalQuantityAvailable" header="Qty Available" [sortable]="true" width="120px">
            <ng-template let-row="row" let-value="value">
              <span [class.low-stock]="value <= row.reorderPoint">{{ value }}</span>
            </ng-template>
          </app-data-column>
          <app-data-column field="standardCost" header="Cost" [sortable]="true" width="100px">
            <ng-template let-value="value">
              {{ value | currency }}
            </ng-template>
          </app-data-column>
          <app-data-column field="status" header="Status" width="100px">
            <ng-template let-row="row">
              <span class="status-badge" [class]="getStatusClass(row.status)">
                {{ row.status }}
              </span>
            </ng-template>
          </app-data-column>
        </app-data-table>
      </app-card>

      <ng-template #headerTemplate>
        <select [(ngModel)]="filter.status" (ngModelChange)="loadProducts()" class="filter-select">
          <option [ngValue]="null">All Statuses</option>
          <option [ngValue]="ProductStatus.Active">Active</option>
          <option [ngValue]="ProductStatus.Draft">Draft</option>
          <option [ngValue]="ProductStatus.Discontinued">Discontinued</option>
        </select>
      </ng-template>

      <ng-template #actionsTemplate let-row="row">
        <div class="action-buttons">
          <button class="icon-btn" (click)="onEdit(row); $event.stopPropagation()" title="Edit">✏️</button>
          <button class="icon-btn danger" (click)="onDelete(row); $event.stopPropagation()" title="Delete">🗑️</button>
        </div>
      </ng-template>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="showDeleteModal()"
        title="Confirm Delete"
        (closed)="showDeleteModal.set(false)"
      >
        <p>Are you sure you want to delete <strong>{{ selectedProduct()?.name }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div modal-footer>
          <app-button variant="ghost" (clicked)="showDeleteModal.set(false)">Cancel</app-button>
          <app-button variant="danger" [loading]="deleting()" (clicked)="confirmDelete()">Delete</app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .product-list-page {
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

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      outline: none;
    }

    .low-stock {
      color: #ef4444;
      font-weight: 600;
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

    .status-badge.draft {
      background-color: #f3f4f6;
      color: #4b5563;
    }

    .status-badge.discontinued {
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

    .icon-btn.danger:hover {
      background: #fee2e2;
    }

    .warning-text {
      color: #ef4444;
      font-size: 0.875rem;
    }
  `]
})
export class ProductListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  products = signal<Product[]>([]);
  loading = signal(true);
  totalItems = signal(0);
  showDeleteModal = signal(false);
  selectedProduct = signal<Product | null>(null);
  deleting = signal(false);

  ProductStatus = ProductStatus;

  filter: ProductFilter = {
    pageNumber: 1,
    pageSize: 10
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService.getProducts(this.filter).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        this.products.set(response.items);
        this.totalItems.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // Show mock data for demo
        this.products.set([
          { productId: 1, sku: 'LAP-001', name: 'MacBook Pro 14"', categoryName: 'Electronics', primaryUOMName: 'Each', standardCost: 1999, reorderPoint: 10, status: 'Active' },
          { productId: 2, sku: 'LAP-002', name: 'Dell XPS 15', categoryName: 'Electronics', primaryUOMName: 'Each', standardCost: 1499, reorderPoint: 15, status: 'Active' },
          { productId: 3, sku: 'MON-001', name: 'HP 27" 4K Monitor', categoryName: 'Electronics', primaryUOMName: 'Each', standardCost: 449, reorderPoint: 20, status: 'Active' },
        ]);
        this.totalItems.set(3);
      }
    });
  }

  onSearch(term: string): void {
    this.filter.search = term;
    this.filter.pageNumber = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.filter.pageNumber = page;
    this.loadProducts();
  }

  onPageSizeChange(size: number): void {
    this.filter.pageSize = size;
    this.filter.pageNumber = 1;
    this.loadProducts();
  }

  onRowClick(product: Product): void {
    this.router.navigate(['/products', product.productId]);
  }

  onEdit(product: Product): void {
    this.router.navigate(['/products', product.productId]);
  }

  onDelete(product: Product): void {
    this.selectedProduct.set(product);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const product = this.selectedProduct();
    if (!product) return;

    this.deleting.set(true);
    this.productsService.deleteProduct(product.productId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.loadProducts();
      },
      error: () => {
        this.deleting.set(false);
        // For demo, just close modal
        this.showDeleteModal.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'active';
      case 'Draft': return 'draft';
      case 'Discontinued': return 'discontinued';
      case 'OnHold': return 'onhold';
      default: return '';
    }
  }
}
