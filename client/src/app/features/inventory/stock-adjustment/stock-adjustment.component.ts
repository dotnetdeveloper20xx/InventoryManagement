import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../inventory.service';
import { StockAdjustment } from '../../../core/models/inventory.model';
import { LookupDto } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="adjustment-page">
      <div class="page-header">
        <h1>Stock Adjustment</h1>
        <app-button variant="ghost" (clicked)="router.navigate(['/inventory'])">
          ← Back to Inventory
        </app-button>
      </div>

      <form #adjustmentForm="ngForm" (ngSubmit)="onSubmit(!!adjustmentForm.valid)" class="form-container">
        <app-card title="Adjustment Details">
          <div class="form-grid">
            <div class="form-group">
              <label for="productId">Product *</label>
              <select id="productId" name="productId" [(ngModel)]="adjustment.productId" required>
                <option [ngValue]="undefined">Select Product</option>
                <option *ngFor="let product of products()" [ngValue]="product.id">{{ product.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="warehouseId">Warehouse *</label>
              <select id="warehouseId" name="warehouseId" [(ngModel)]="adjustment.warehouseId" required>
                <option [ngValue]="undefined">Select Warehouse</option>
                <option *ngFor="let wh of warehouses()" [ngValue]="wh.id">{{ wh.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="adjustmentType">Adjustment Type *</label>
              <select id="adjustmentType" name="adjustmentType" [(ngModel)]="adjustment.adjustmentType" required>
                <option value="increase">Increase Stock</option>
                <option value="decrease">Decrease Stock</option>
                <option value="set">Set Stock Level</option>
              </select>
            </div>
            <div class="form-group">
              <label for="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                [(ngModel)]="adjustment.quantity"
                required
                min="1"
              />
            </div>
            <div class="form-group">
              <label for="reason">Reason *</label>
              <select id="reason" name="reason" [(ngModel)]="adjustment.reason" required>
                <option value="">Select Reason</option>
                <option value="Cycle Count">Cycle Count</option>
                <option value="Damaged">Damaged</option>
                <option value="Expired">Expired</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
                <option value="Quality Issue">Quality Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                [(ngModel)]="adjustment.notes"
                rows="3"
                placeholder="Additional notes about this adjustment..."
              ></textarea>
            </div>
          </div>
        </app-card>

        <div class="form-actions">
          <app-button variant="ghost" (clicked)="router.navigate(['/inventory'])">
            Cancel
          </app-button>
          <app-button type="submit" variant="primary" [loading]="saving()" [disabled]="!adjustmentForm.valid">
            Submit Adjustment
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .adjustment-page {
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
export class StockAdjustmentComponent {
  readonly router = inject(Router);
  private readonly inventoryService = inject(InventoryService);

  products = signal<LookupDto[]>([
    { id: 1, name: 'MacBook Pro 14" (LAP-001)' },
    { id: 2, name: 'Dell XPS 15 (LAP-002)' },
    { id: 3, name: 'HP 27" 4K Monitor (MON-001)' }
  ]);

  warehouses = signal<LookupDto[]>([
    { id: 1, name: 'Main Warehouse - NYC' },
    { id: 2, name: 'West Coast - LA' },
    { id: 3, name: 'Distribution Center - Chicago' }
  ]);

  saving = signal(false);

  adjustment: Partial<StockAdjustment> = {
    adjustmentType: 'increase',
    quantity: 1,
    reason: ''
  };

  onSubmit(isValid: boolean | null): void {
    if (!isValid) return;

    this.saving.set(true);
    this.inventoryService.adjustStock(this.adjustment as StockAdjustment).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/inventory']);
      },
      error: () => {
        this.saving.set(false);
        this.router.navigate(['/inventory']);
      }
    });
  }
}
