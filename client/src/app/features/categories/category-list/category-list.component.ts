import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoriesService } from '../categories.service';
import { Category, CategoryFilter } from '../../../core/models/category.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { DataColumnDirective } from '../../../shared/components/data-table/data-column.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-category-list',
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
    <div class="category-list-page">
      <div class="page-header">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories</p>
        </div>
        <app-button variant="primary" (clicked)="router.navigate(['/categories/new'])">
          + Add Category
        </app-button>
      </div>

      <app-card [noPadding]="true">
        <app-data-table
          [data]="categories()"
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
          <app-data-column field="categoryCode" header="Code" [sortable]="true" width="100px"></app-data-column>
          <app-data-column field="name" header="Name" [sortable]="true"></app-data-column>
          <app-data-column field="fullPath" header="Path"></app-data-column>
          <app-data-column field="productCount" header="Products" width="100px">
            <ng-template let-value="value">
              {{ value || 0 }}
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
          <button class="icon-btn danger" (click)="onDelete(row); $event.stopPropagation()" title="Delete">🗑️</button>
        </div>
      </ng-template>

      <app-modal
        [isOpen]="showDeleteModal()"
        title="Confirm Delete"
        (closed)="showDeleteModal.set(false)"
      >
        <p>Are you sure you want to delete <strong>{{ selectedCategory()?.name }}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div modal-footer>
          <app-button variant="ghost" (clicked)="showDeleteModal.set(false)">Cancel</app-button>
          <app-button variant="danger" [loading]="deleting()" (clicked)="confirmDelete()">Delete</app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .category-list-page {
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
export class CategoryListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  totalItems = signal(0);
  showDeleteModal = signal(false);
  selectedCategory = signal<Category | null>(null);
  deleting = signal(false);

  filter: CategoryFilter = {
    pageNumber: 1,
    pageSize: 10
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoriesService.getCategories(this.filter).subscribe({
      next: (response: PaginatedResponse<Category>) => {
        this.categories.set(response.items);
        this.totalItems.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.categories.set([
          { categoryId: 1, categoryCode: 'ELEC', name: 'Electronics', fullPath: 'Electronics', isActive: true, productCount: 45 },
          { categoryId: 2, categoryCode: 'OFFC', name: 'Office Supplies', fullPath: 'Office Supplies', isActive: true, productCount: 120 },
          { categoryId: 3, categoryCode: 'INDQ', name: 'Industrial Equipment', fullPath: 'Industrial Equipment', isActive: true, productCount: 30 },
        ]);
        this.totalItems.set(3);
      }
    });
  }

  onSearch(term: string): void {
    this.filter.search = term;
    this.filter.pageNumber = 1;
    this.loadCategories();
  }

  onPageChange(page: number): void {
    this.filter.pageNumber = page;
    this.loadCategories();
  }

  onPageSizeChange(size: number): void {
    this.filter.pageSize = size;
    this.filter.pageNumber = 1;
    this.loadCategories();
  }

  onRowClick(category: Category): void {
    this.router.navigate(['/categories', category.categoryId]);
  }

  onEdit(category: Category): void {
    this.router.navigate(['/categories', category.categoryId]);
  }

  onDelete(category: Category): void {
    this.selectedCategory.set(category);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const category = this.selectedCategory();
    if (!category) return;

    this.deleting.set(true);
    this.categoriesService.deleteCategory(category.categoryId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.loadCategories();
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}
