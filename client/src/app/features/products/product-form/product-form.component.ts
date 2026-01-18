import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../products.service';
import { ProductDetail, CreateProduct, UpdateProduct, ProductStatus } from '../../../core/models/product.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SpinnerComponent],
  template: `
    <div class="product-form-page">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Product' : 'New Product' }}</h1>
        <app-button variant="ghost" (clicked)="router.navigate(['/products'])">
          ← Back to Products
        </app-button>
      </div>

      <app-spinner *ngIf="loading()" message="Loading product..."></app-spinner>

      <form *ngIf="!loading()" #productForm="ngForm" (ngSubmit)="onSubmit(!!productForm.valid)" class="form-container">
        <app-card title="Basic Information">
          <div class="form-grid">
            <div class="form-group">
              <label for="sku">SKU *</label>
              <input
                type="text"
                id="sku"
                name="sku"
                [(ngModel)]="product.sku"
                required
                [disabled]="isEditMode()"
              />
            </div>
            <div class="form-group">
              <label for="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="product.name"
                required
              />
            </div>
            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="product.description"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="categoryId">Category *</label>
              <select id="categoryId" name="categoryId" [(ngModel)]="product.categoryId" required>
                <option [ngValue]="null">Select Category</option>
                <option [ngValue]="1">Electronics</option>
                <option [ngValue]="2">Office Supplies</option>
                <option [ngValue]="3">Industrial Equipment</option>
              </select>
            </div>
            <div class="form-group">
              <label for="brandId">Brand</label>
              <select id="brandId" name="brandId" [(ngModel)]="product.brandId">
                <option [ngValue]="null">Select Brand</option>
                <option [ngValue]="1">Apple</option>
                <option [ngValue]="2">Dell</option>
                <option [ngValue]="3">HP</option>
              </select>
            </div>
            <div class="form-group" *ngIf="isEditMode()">
              <label for="status">Status</label>
              <select id="status" name="status" [(ngModel)]="product.status">
                <option [ngValue]="ProductStatus.Draft">Draft</option>
                <option [ngValue]="ProductStatus.Active">Active</option>
                <option [ngValue]="ProductStatus.Discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </app-card>

        <app-card title="Pricing & Inventory">
          <div class="form-grid">
            <div class="form-group">
              <label for="primaryUOMId">Primary UOM *</label>
              <select id="primaryUOMId" name="primaryUOMId" [(ngModel)]="product.primaryUOMId" required>
                <option [ngValue]="null">Select UOM</option>
                <option [ngValue]="1">Each</option>
                <option [ngValue]="2">Box</option>
                <option [ngValue]="3">Case</option>
              </select>
            </div>
            <div class="form-group">
              <label for="barcode">Barcode</label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                [(ngModel)]="product.barcode"
              />
            </div>
            <div class="form-group">
              <label for="standardCost">Standard Cost *</label>
              <input
                type="number"
                id="standardCost"
                name="standardCost"
                [(ngModel)]="product.standardCost"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div class="form-group">
              <label for="msrp">Selling Price</label>
              <input
                type="number"
                id="msrp"
                name="msrp"
                [(ngModel)]="product.msrp"
                min="0"
                step="0.01"
              />
            </div>
            <div class="form-group">
              <label for="reorderPoint">Reorder Point *</label>
              <input
                type="number"
                id="reorderPoint"
                name="reorderPoint"
                [(ngModel)]="product.reorderPoint"
                required
                min="0"
              />
            </div>
            <div class="form-group">
              <label for="minStockLevel">Min Stock Level *</label>
              <input
                type="number"
                id="minStockLevel"
                name="minStockLevel"
                [(ngModel)]="product.minStockLevel"
                required
                min="0"
              />
            </div>
            <div class="form-group">
              <label for="maxStockLevel">Max Stock Level *</label>
              <input
                type="number"
                id="maxStockLevel"
                name="maxStockLevel"
                [(ngModel)]="product.maxStockLevel"
                required
                min="0"
              />
            </div>
          </div>
        </app-card>

        <div class="form-actions">
          <app-button variant="ghost" (clicked)="router.navigate(['/products'])">
            Cancel
          </app-button>
          <app-button type="submit" variant="primary" [loading]="saving()" [disabled]="!productForm.valid">
            {{ isEditMode() ? 'Update Product' : 'Create Product' }}
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .product-form-page {
      max-width: 900px;
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

    .form-group input:disabled {
      background-color: #f1f5f9;
      cursor: not-allowed;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit {
  @Input() id?: string;

  readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  ProductStatus = ProductStatus;

  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);

  product: Partial<ProductDetail> = {
    sku: '',
    name: '',
    categoryId: undefined,
    brandId: undefined,
    primaryUOMId: undefined,
    standardCost: 0,
    msrp: undefined,
    reorderPoint: 10,
    minStockLevel: 5,
    maxStockLevel: 100,
    status: ProductStatus.Draft
  };

  ngOnInit(): void {
    if (this.id && this.id !== 'new') {
      this.isEditMode.set(true);
      this.loadProduct(parseInt(this.id, 10));
    }
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product = { ...product };
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // For demo, use mock data
        this.product = {
          productId: id,
          sku: 'LAP-001',
          name: 'MacBook Pro 14"',
          categoryId: 1,
          brandId: 1,
          primaryUOMId: 1,
          standardCost: 1999,
          msrp: 2499,
          reorderPoint: 10,
          minStockLevel: 5,
          maxStockLevel: 100,
          status: ProductStatus.Active
        };
      }
    });
  }

  onSubmit(isValid: boolean | null): void {
    if (!isValid) return;

    this.saving.set(true);

    const operation = this.isEditMode()
      ? this.productsService.updateProduct(this.product.productId!, this.product as UpdateProduct)
      : this.productsService.createProduct(this.product as CreateProduct);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/products']);
      },
      error: () => {
        this.saving.set(false);
        // For demo, navigate anyway
        this.router.navigate(['/products']);
      }
    });
  }
}
