import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { GoodsReceiptsService } from '../../../core/services/goods-receipts.service';
import { WarehousesService } from '../../warehouses/warehouses.service';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { ProductsService } from '../../products/products.service';
import { PendingReceipt, CreateGoodsReceipt } from '../../../core/models/goods-receipt.model';

@Component({
  selector: 'app-goods-receipt-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="grn-form-page">
      <div class="page-header">
        <a routerLink="/goods-receipts" class="back-link">← Back to Goods Receipts</a>
        <h1>New Goods Receipt</h1>
        <p>Receive inventory into warehouse</p>
      </div>

      <app-spinner *ngIf="loading()" message="Loading..."></app-spinner>

      <div class="form-content" *ngIf="!loading()">
        <app-card title="Receipt Details">
          <form class="receipt-form">
            <div class="form-row">
              <div class="form-group">
                <label>Warehouse *</label>
                <select [(ngModel)]="formData.warehouseId" name="warehouseId" required (change)="onWarehouseChange()">
                  <option [ngValue]="0">Select Warehouse</option>
                  <option *ngFor="let w of warehouses()" [ngValue]="w.id">{{ w.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Supplier *</label>
                <select [(ngModel)]="selectedSupplierId" name="supplierId" required (change)="onSupplierChange()">
                  <option [ngValue]="0">Select Supplier</option>
                  <option *ngFor="let s of suppliers()" [ngValue]="s.supplierId">{{ s.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Receipt Date *</label>
                <input type="date" [(ngModel)]="formData.receiptDate" name="receiptDate" required>
              </div>
              <div class="form-group">
                <label>Reference (Delivery Note)</label>
                <input type="text" [(ngModel)]="formData.deliveryNoteNumber" name="deliveryNoteNumber" placeholder="DN-12345">
              </div>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="formData.notes" name="notes" rows="2" placeholder="Any additional notes..."></textarea>
            </div>
          </form>
        </app-card>

        <app-card *ngIf="pendingReceipts().length > 0" title="Pending Purchase Orders">
          <div class="pending-list">
            <div class="pending-item" *ngFor="let po of pendingReceipts()" (click)="selectPendingOrder(po)" [class.selected]="selectedPO()?.purchaseOrderId === po.purchaseOrderId">
              <div class="po-info">
                <span class="po-number">{{ po.poNumber }}</span>
                <span class="po-date">{{ po.orderDate | date:'mediumDate' }}</span>
              </div>
              <div class="po-details">
                <span>{{ po.linesPending }} lines pending</span>
                <span>{{ po.totalLines }} total lines</span>
              </div>
            </div>
          </div>
        </app-card>

        <app-card title="Receipt Lines">
          <div class="add-line-row">
            <select [(ngModel)]="newLine.productId" class="product-select">
              <option [ngValue]="0">Select Product</option>
              <option *ngFor="let p of products()" [ngValue]="p.id">{{ p.sku }} - {{ p.name }}</option>
            </select>
            <input type="number" [(ngModel)]="newLine.receivedQuantity" placeholder="Qty" min="1" class="qty-input">
            <input type="number" [(ngModel)]="newLine.unitCost" placeholder="Unit Cost" min="0" step="0.01" class="cost-input">
            <input type="number" [(ngModel)]="newLine.binId" placeholder="Bin ID" class="bin-input">
            <button class="btn btn-secondary" (click)="addLine()" [disabled]="!canAddLine()">Add</button>
          </div>

          <div class="lines-table" *ngIf="formData.lines.length > 0">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Unit Cost</th>
                  <th class="text-right">Total</th>
                  <th>Bin</th>
                  <th>Batch #</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let line of formData.lines; let i = index">
                  <td>{{ getProductName(line.productId) }}</td>
                  <td class="text-right">{{ line.receivedQuantity }}</td>
                  <td class="text-right">{{ line.unitCost | currency }}</td>
                  <td class="text-right">{{ line.receivedQuantity * line.unitCost | currency }}</td>
                  <td>{{ line.binId || '-' }}</td>
                  <td>
                    <input type="text" [(ngModel)]="line.batchNumber" placeholder="Batch #" class="inline-input">
                  </td>
                  <td>
                    <button class="btn-icon danger" (click)="removeLine(i)">✕</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right"><strong>Total:</strong></td>
                  <td class="text-right"><strong>{{ calculateTotal() | currency }}</strong></td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="empty-lines" *ngIf="formData.lines.length === 0">
            <p>No lines added yet. Add products to receive above.</p>
          </div>
        </app-card>

        <div class="form-actions">
          <a routerLink="/goods-receipts" class="btn btn-secondary">Cancel</a>
          <button class="btn btn-primary" (click)="saveReceipt()" [disabled]="!canSave() || saving()">
            {{ saving() ? 'Saving...' : 'Save as Draft' }}
          </button>
          <button class="btn btn-success" (click)="saveAndPost()" [disabled]="!canSave() || saving()">
            {{ saving() ? 'Saving...' : 'Save & Post' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grn-form-page { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0.5rem 0 0; font-size: 1.75rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .form-content { display: flex; flex-direction: column; gap: 1.5rem; }

    .receipt-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }

    .pending-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .pending-item { display: flex; justify-content: space-between; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.375rem; cursor: pointer; }
    .pending-item:hover { border-color: #3b82f6; }
    .pending-item.selected { border-color: #3b82f6; background: #eff6ff; }
    .po-number { font-weight: 600; color: #3b82f6; }
    .po-date { font-size: 0.75rem; color: #64748b; margin-left: 0.5rem; }
    .po-details { font-size: 0.875rem; color: #475569; display: flex; gap: 1rem; }

    .add-line-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
    .product-select { flex: 2; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
    .qty-input, .cost-input, .bin-input { width: 100px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
    .bin-input { width: 120px; }

    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tfoot td { border-top: 2px solid #e2e8f0; background: #f8fafc; }
    .text-right { text-align: right; }
    .inline-input { padding: 0.25rem 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.75rem; width: 100px; }

    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn-success { background: #10b981; color: white; }
    .btn:hover:not(:disabled) { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-icon { width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; border: none; background: transparent; cursor: pointer; border-radius: 0.25rem; }
    .btn-icon.danger:hover { background: #fee2e2; color: #991b1b; }

    .empty-lines { text-align: center; padding: 2rem; color: #64748b; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 0; }
  `]
})
export class GoodsReceiptFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly goodsReceiptsService = inject(GoodsReceiptsService);
  private readonly warehousesService = inject(WarehousesService);
  private readonly suppliersService = inject(SuppliersService);
  private readonly productsService = inject(ProductsService);

  loading = signal(true);
  saving = signal(false);
  warehouses = signal<any[]>([]);
  suppliers = signal<any[]>([]);
  products = signal<any[]>([]);
  pendingReceipts = signal<PendingReceipt[]>([]);
  selectedPO = signal<PendingReceipt | null>(null);

  selectedSupplierId = 0;

  formData: CreateGoodsReceipt = {
    purchaseOrderId: 0,
    warehouseId: 0,
    receiptDate: new Date(),
    deliveryNoteNumber: '',
    notes: '',
    lines: []
  };

  newLine: any = {
    purchaseOrderLineId: 0,
    productId: 0,
    receivedQuantity: 1,
    unitCost: 0,
    binId: undefined,
    batchNumber: '',
    expiryDate: undefined
  };

  ngOnInit(): void {
    this.loadReferenceData();
  }

  loadReferenceData(): void {
    Promise.all([
      this.warehousesService.getWarehouses({ pageNumber: 1, pageSize: 100 }).toPromise(),
      this.suppliersService.getSuppliers({ pageNumber: 1, pageSize: 100 }).toPromise(),
      this.productsService.getProducts({ pageNumber: 1, pageSize: 100 }).toPromise()
    ]).then(([warehouses, suppliers, products]: any[]) => {
      this.warehouses.set(warehouses?.items || []);
      this.suppliers.set(suppliers?.items || []);
      this.products.set(products?.items || []);
      this.loading.set(false);
    }).catch(() => this.loading.set(false));
  }

  onWarehouseChange(): void {
    // Could filter pending receipts by warehouse
  }

  onSupplierChange(): void {
    if (this.selectedSupplierId > 0) {
      this.goodsReceiptsService.getPendingReceipts(this.selectedSupplierId).subscribe({
        next: (data: any) => this.pendingReceipts.set(data)
      });
    } else {
      this.pendingReceipts.set([]);
    }
  }

  selectPendingOrder(po: PendingReceipt): void {
    this.selectedPO.set(po);
    this.formData.purchaseOrderId = po.purchaseOrderId;
    // In a real app, would load PO lines and populate formData.lines
  }

  getProductName(productId: number): string {
    const product = this.products().find((p: any) => p.productId === productId);
    return product ? `${product.sku} - ${product.name}` : 'Unknown';
  }

  canAddLine(): boolean {
    return this.newLine.productId > 0 && this.newLine.receivedQuantity > 0;
  }

  addLine(): void {
    if (!this.canAddLine()) return;
    const product = this.products().find((p: any) => p.productId === this.newLine.productId);
    this.formData.lines.push({
      ...this.newLine,
      unitCost: this.newLine.unitCost || product?.unitCost || 0
    });
    this.newLine = { purchaseOrderLineId: 0, productId: 0, receivedQuantity: 1, unitCost: 0, binId: undefined, batchNumber: '' };
  }

  removeLine(index: number): void {
    this.formData.lines.splice(index, 1);
  }

  calculateTotal(): number {
    return this.formData.lines.reduce((sum: number, line: any) => sum + (line.receivedQuantity * line.unitCost), 0);
  }

  canSave(): boolean {
    return this.formData.warehouseId > 0 &&
           this.selectedSupplierId > 0 &&
           this.formData.lines.length > 0;
  }

  saveReceipt(): void {
    if (!this.canSave()) return;
    this.saving.set(true);
    this.goodsReceiptsService.createGoodsReceipt(this.formData).subscribe({
      next: (result: any) => {
        this.saving.set(false);
        this.router.navigate(['/goods-receipts', result.goodsReceiptId]);
      },
      error: () => this.saving.set(false)
    });
  }

  saveAndPost(): void {
    if (!this.canSave()) return;
    this.saving.set(true);
    this.goodsReceiptsService.createGoodsReceipt(this.formData).subscribe({
      next: (result: any) => {
        this.goodsReceiptsService.postGoodsReceipt(result.goodsReceiptId).subscribe({
          next: () => {
            this.saving.set(false);
            this.router.navigate(['/goods-receipts', result.goodsReceiptId]);
          },
          error: () => {
            this.saving.set(false);
            this.router.navigate(['/goods-receipts', result.goodsReceiptId]);
          }
        });
      },
      error: () => this.saving.set(false)
    });
  }
}
