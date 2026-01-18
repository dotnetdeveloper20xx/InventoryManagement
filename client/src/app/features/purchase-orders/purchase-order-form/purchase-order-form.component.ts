import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseOrdersService } from '../purchase-orders.service';
import { CreatePurchaseOrder, CreatePurchaseOrderLineItem } from '../../../core/models/purchase-order.model';
import { LookupDto } from '../../../core/models/api-response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

interface LineItem extends CreatePurchaseOrderLineItem {
  productName?: string;
  lineTotal?: number;
}

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SpinnerComponent],
  template: `
    <div class="po-form-page">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Purchase Order' : 'New Purchase Order' }}</h1>
        <app-button variant="ghost" (clicked)="router.navigate(['/purchase-orders'])">
          ← Back to Purchase Orders
        </app-button>
      </div>

      <app-spinner *ngIf="loading()" message="Loading..."></app-spinner>

      <form *ngIf="!loading()" #poForm="ngForm" (ngSubmit)="onSubmit(!!poForm.valid)" class="form-container">
        <app-card title="Order Information">
          <div class="form-grid">
            <div class="form-group">
              <label for="supplierId">Supplier *</label>
              <select id="supplierId" name="supplierId" [(ngModel)]="order.supplierId" required>
                <option [ngValue]="undefined">Select Supplier</option>
                <option *ngFor="let s of suppliers()" [ngValue]="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="warehouseId">Receiving Warehouse *</label>
              <select id="warehouseId" name="warehouseId" [(ngModel)]="order.warehouseId" required>
                <option [ngValue]="undefined">Select Warehouse</option>
                <option *ngFor="let wh of warehouses()" [ngValue]="wh.id">{{ wh.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="expectedDeliveryDate">Expected Delivery Date</label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                [(ngModel)]="expectedDeliveryDateStr"
              />
            </div>
            <div class="form-group full-width">
              <label for="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                [(ngModel)]="order.notes"
                rows="2"
                placeholder="Additional notes..."
              ></textarea>
            </div>
          </div>
        </app-card>

        <app-card title="Line Items">
          <div class="line-items">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th width="100">Quantity</th>
                  <th width="120">Unit Cost</th>
                  <th width="120">Line Total</th>
                  <th width="50"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of lineItems(); let i = index">
                  <td>
                    <select [(ngModel)]="item.productId" [name]="'product_' + i" required (ngModelChange)="updateLineTotal(item)">
                      <option [ngValue]="undefined">Select Product</option>
                      <option *ngFor="let p of products()" [ngValue]="p.id">{{ p.name }}</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" [(ngModel)]="item.quantityOrdered" [name]="'qty_' + i" min="1" required (ngModelChange)="updateLineTotal(item)" />
                  </td>
                  <td>
                    <input type="number" [(ngModel)]="item.unitCost" [name]="'cost_' + i" min="0" step="0.01" required (ngModelChange)="updateLineTotal(item)" />
                  </td>
                  <td class="line-total">
                    {{ (item.lineTotal || 0) | currency }}
                  </td>
                  <td>
                    <button type="button" class="remove-btn" (click)="removeLineItem(i)" *ngIf="lineItems().length > 1">×</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <app-button variant="secondary" (clicked)="addLineItem()">+ Add Line Item</app-button>
          </div>

          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ calculateSubtotal() | currency }}</span>
            </div>
            <div class="summary-row">
              <span>Tax (8%):</span>
              <span>{{ calculateTax() | currency }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ calculateTotal() | currency }}</span>
            </div>
          </div>
        </app-card>

        <div class="form-actions">
          <app-button variant="ghost" (clicked)="router.navigate(['/purchase-orders'])">
            Cancel
          </app-button>
          <app-button variant="secondary" [loading]="saving()" [disabled]="!poForm.valid || lineItems().length === 0" (clicked)="onSaveDraft()">
            Save as Draft
          </app-button>
          <app-button type="submit" variant="primary" [loading]="saving()" [disabled]="!poForm.valid || lineItems().length === 0">
            Submit Order
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .po-form-page {
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
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .line-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table th {
      text-align: left;
      padding: 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
    }

    .items-table td {
      padding: 0.5rem;
      vertical-align: middle;
    }

    .items-table select,
    .items-table input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .line-total {
      text-align: right;
      font-weight: 500;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #ef4444;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
    }

    .remove-btn:hover {
      color: #dc2626;
    }

    .order-summary {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .summary-row {
      display: flex;
      gap: 2rem;
      font-size: 0.875rem;
    }

    .summary-row span:first-child {
      color: #64748b;
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 1rem;
    }

    .summary-row.total span:first-child {
      color: #1e293b;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
    }
  `]
})
export class PurchaseOrderFormComponent implements OnInit {
  @Input() id?: string;

  readonly router = inject(Router);
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);

  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);

  suppliers = signal<LookupDto[]>([
    { id: 1, name: 'Tech Distributors Inc' },
    { id: 2, name: 'Global Electronics' },
    { id: 3, name: 'Office Solutions Ltd' }
  ]);

  warehouses = signal<LookupDto[]>([
    { id: 1, name: 'Main Warehouse - NYC' },
    { id: 2, name: 'West Coast - LA' },
    { id: 3, name: 'Distribution Center - Chicago' }
  ]);

  products = signal<LookupDto[]>([
    { id: 1, name: 'MacBook Pro 14" (LAP-001)' },
    { id: 2, name: 'Dell XPS 15 (LAP-002)' },
    { id: 3, name: 'HP 27" 4K Monitor (MON-001)' },
    { id: 4, name: 'Logitech MX Master 3 (ACC-001)' },
    { id: 5, name: 'USB-C Dock (ACC-002)' }
  ]);

  lineItems = signal<LineItem[]>([
    { productId: undefined as any, quantityOrdered: 1, unitCost: 0, lineTotal: 0 }
  ]);

  order: Partial<CreatePurchaseOrder> = {
    supplierId: undefined,
    warehouseId: undefined,
    notes: ''
  };

  expectedDeliveryDateStr: string = '';

  ngOnInit(): void {
    if (this.id && this.id !== 'new') {
      this.isEditMode.set(true);
      this.loadOrder(parseInt(this.id, 10));
    }
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.purchaseOrdersService.getPurchaseOrder(id).subscribe({
      next: (order) => {
        this.order.supplierId = order.supplierId;
        this.order.warehouseId = order.warehouseId;
        this.order.notes = order.notes;
        if (order.expectedDeliveryDate) {
          this.expectedDeliveryDateStr = new Date(order.expectedDeliveryDate).toISOString().split('T')[0];
        }
        this.lineItems.set(order.lineItems.map(li => ({
          productId: li.productId,
          quantityOrdered: li.quantityOrdered,
          unitCost: li.unitCost,
          lineTotal: li.lineTotal
        })));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  addLineItem(): void {
    this.lineItems.update(items => [...items, { productId: undefined as any, quantityOrdered: 1, unitCost: 0, lineTotal: 0 }]);
  }

  removeLineItem(index: number): void {
    this.lineItems.update(items => items.filter((_, i) => i !== index));
  }

  updateLineTotal(item: LineItem): void {
    item.lineTotal = (item.quantityOrdered || 0) * (item.unitCost || 0);
  }

  calculateSubtotal(): number {
    return this.lineItems().reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.08;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  onSaveDraft(): void {
    this.saveOrder(false);
  }

  onSubmit(isValid: boolean | null): void {
    if (!isValid) return;
    this.saveOrder(true);
  }

  private saveOrder(submit: boolean): void {
    this.saving.set(true);

    const orderData: CreatePurchaseOrder = {
      supplierId: this.order.supplierId!,
      warehouseId: this.order.warehouseId!,
      expectedDeliveryDate: this.expectedDeliveryDateStr ? new Date(this.expectedDeliveryDateStr) : undefined,
      notes: this.order.notes,
      lineItems: this.lineItems().filter(li => li.productId).map(li => ({
        productId: li.productId,
        quantityOrdered: li.quantityOrdered,
        unitCost: li.unitCost
      }))
    };

    this.purchaseOrdersService.createPurchaseOrder(orderData).subscribe({
      next: (created) => {
        if (submit) {
          this.purchaseOrdersService.submitPurchaseOrder(created.purchaseOrderId).subscribe({
            next: () => {
              this.saving.set(false);
              this.router.navigate(['/purchase-orders']);
            },
            error: () => {
              this.saving.set(false);
              this.router.navigate(['/purchase-orders']);
            }
          });
        } else {
          this.saving.set(false);
          this.router.navigate(['/purchase-orders']);
        }
      },
      error: () => {
        this.saving.set(false);
        this.router.navigate(['/purchase-orders']);
      }
    });
  }
}
