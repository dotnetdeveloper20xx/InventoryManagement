import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../inventory.service';
import { StockTransfer } from '../../../core/models/inventory.model';
import { LookupDto } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-stock-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="transfer-page">
      <div class="page-header">
        <h1>Stock Transfer</h1>
        <app-button variant="ghost" (clicked)="router.navigate(['/inventory'])">
          ← Back to Inventory
        </app-button>
      </div>

      <form #transferForm="ngForm" (ngSubmit)="onSubmit(!!transferForm.valid)" class="form-container">
        <app-card title="Transfer Details">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="productId">Product *</label>
              <select id="productId" name="productId" [(ngModel)]="transfer.productId" required>
                <option [ngValue]="undefined">Select Product</option>
                <option *ngFor="let product of products()" [ngValue]="product.id">{{ product.name }}</option>
              </select>
            </div>

            <div class="form-section">
              <h3>From</h3>
              <div class="form-group">
                <label for="sourceWarehouseId">Source Warehouse *</label>
                <select id="sourceWarehouseId" name="sourceWarehouseId" [(ngModel)]="transfer.sourceWarehouseId" required>
                  <option [ngValue]="undefined">Select Warehouse</option>
                  <option *ngFor="let wh of warehouses()" [ngValue]="wh.id">{{ wh.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-section">
              <h3>To</h3>
              <div class="form-group">
                <label for="destinationWarehouseId">Destination Warehouse *</label>
                <select id="destinationWarehouseId" name="destinationWarehouseId" [(ngModel)]="transfer.destinationWarehouseId" required>
                  <option [ngValue]="undefined">Select Warehouse</option>
                  <option *ngFor="let wh of warehouses()" [ngValue]="wh.id" [disabled]="wh.id === transfer.sourceWarehouseId">{{ wh.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                [(ngModel)]="transfer.quantity"
                required
                min="1"
              />
            </div>

            <div class="form-group full-width">
              <label for="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                [(ngModel)]="transfer.notes"
                rows="3"
                placeholder="Additional notes about this transfer..."
              ></textarea>
            </div>
          </div>
        </app-card>

        <div class="form-actions">
          <app-button variant="ghost" (clicked)="router.navigate(['/inventory'])">
            Cancel
          </app-button>
          <app-button type="submit" variant="primary" [loading]="saving()" [disabled]="!transferForm.valid || !isValidTransfer()">
            Submit Transfer
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .transfer-page {
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

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-section h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
export class StockTransferComponent {
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

  transfer: Partial<StockTransfer> = {
    quantity: 1
  };

  isValidTransfer(): boolean {
    return this.transfer.sourceWarehouseId !== this.transfer.destinationWarehouseId;
  }

  onSubmit(isValid: boolean | null): void {
    if (!isValid || !this.isValidTransfer()) return;

    this.saving.set(true);
    this.inventoryService.transferStock(this.transfer as StockTransfer).subscribe({
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
