import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoriesService } from '../categories.service';
import { CategoryDetail, CreateCategory, UpdateCategory } from '../../../core/models/category.model';
import { LookupDto } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SpinnerComponent],
  template: `
    <div class="category-form-page">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Category' : 'New Category' }}</h1>
        <app-button variant="ghost" (clicked)="router.navigate(['/categories'])">
          ← Back to Categories
        </app-button>
      </div>

      <app-spinner *ngIf="loading()" message="Loading category..."></app-spinner>

      <form *ngIf="!loading()" #categoryForm="ngForm" (ngSubmit)="onSubmit(!!categoryForm.valid)" class="form-container">
        <app-card title="Category Details">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="category.name"
                required
              />
            </div>
            <div class="form-group">
              <label for="parentCategoryId">Parent Category</label>
              <select id="parentCategoryId" name="parentCategoryId" [(ngModel)]="category.parentCategoryId">
                <option [ngValue]="null">None (Top Level)</option>
                <option *ngFor="let cat of parentCategories()" [ngValue]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="category.description"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group" *ngIf="isEditMode()">
              <label for="isActive">Status</label>
              <select id="isActive" name="isActive" [(ngModel)]="category.isActive">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Inactive</option>
              </select>
            </div>
          </div>
        </app-card>

        <div class="form-actions">
          <app-button variant="ghost" (clicked)="router.navigate(['/categories'])">
            Cancel
          </app-button>
          <app-button type="submit" variant="primary" [loading]="saving()" [disabled]="!categoryForm.valid">
            {{ isEditMode() ? 'Update Category' : 'Create Category' }}
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .category-form-page {
      max-width: 700px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      color: #1e293b;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
    }
  `]
})
export class CategoryFormComponent implements OnInit {
  @Input() id?: string;

  readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);

  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);
  parentCategories = signal<LookupDto[]>([]);

  category: Partial<CategoryDetail> = {
    name: '',
    description: '',
    parentCategoryId: undefined,
    isActive: true
  };

  ngOnInit(): void {
    this.loadParentCategories();

    if (this.id && this.id !== 'new') {
      this.isEditMode.set(true);
      this.loadCategory(parseInt(this.id, 10));
    }
  }

  loadParentCategories(): void {
    this.categoriesService.getLookup().subscribe({
      next: (categories) => {
        this.parentCategories.set(categories.filter(c =>
          !this.id || c.id !== parseInt(this.id, 10)
        ));
      },
      error: () => {
        this.parentCategories.set([
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Office Supplies' },
          { id: 3, name: 'Industrial Equipment' }
        ]);
      }
    });
  }

  loadCategory(id: number): void {
    this.loading.set(true);
    this.categoriesService.getCategory(id).subscribe({
      next: (category) => {
        this.category = { ...category };
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.category = {
          categoryId: id,
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          isActive: true
        };
      }
    });
  }

  onSubmit(isValid: boolean | null): void {
    if (!isValid) return;

    this.saving.set(true);

    const operation = this.isEditMode()
      ? this.categoriesService.updateCategory(this.category.categoryId!, this.category as UpdateCategory)
      : this.categoriesService.createCategory(this.category as CreateCategory);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/categories']);
      },
      error: () => {
        this.saving.set(false);
        this.router.navigate(['/categories']);
      }
    });
  }
}
