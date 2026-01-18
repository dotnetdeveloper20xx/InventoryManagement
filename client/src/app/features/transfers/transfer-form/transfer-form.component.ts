import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TransfersService } from '../../../core/services/transfers.service';
import { WarehousesService } from '../../warehouses/warehouses.service';
import { ProductsService } from '../../products/products.service';
import { CreateTransfer, CreateTransferLine } from '../../../core/models/transfer.model';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="transfer-form-page">
      <div class="page-header">
        <a routerLink="/transfers" class="back-link">← Back to Transfers</a>
        <h1>New Stock Transfer</h1>
        <p>Move inventory between warehouses</p>
      </div>

      <app-spinner *ngIf="loading()" message="Loading..."></app-spinner>

      <div class="form-content" *ngIf="!loading()">
        <app-card title="Transfer Details">
          <form class="transfer-form">
            <div class="form-row">
              <div class="form-group">
                <label>From Warehouse *</label>
                <select [(ngModel)]="formData.fromWarehouseId" name="fromWarehouseId" required (change)="onFromWarehouseChange()">
                  <option [ngValue]="0">Select Source Warehouse</option>
                  <option *ngFor="let w of warehouses()" [ngValue]="w.id">{{ w.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>To Warehouse *</label>
                <select [(ngModel)]="formData.toWarehouseId" name="toWarehouseId" required>
                  <option [ngValue]="0">Select Destination Warehouse</option>
                  <option *ngFor="let w of destinationWarehouses()" [ngValue]="w.id">{{ w.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Request Date</label>
                <input type="date" [(ngModel)]="formData.requestDate" name="requestDate">
              </div>
              <div class="form-group">
                <label>Expected Arrival</label>
                <input type="date" [(ngModel)]="formData.expectedArrivalDate" name="expectedArrivalDate">
              </div>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="formData.notes" name="notes" rows="2" placeholder="Reason for transfer, special instructions..."></textarea>
            </div>
          </form>
        </app-card>

        <app-card title="Transfer Lines">
          <div class="add-line-row">
            <select [(ngModel)]="newLine.productId" class="product-select">
              <option [ngValue]="0">Select Product</option>
              <option *ngFor="let p of availableProducts()" [ngValue]="p.id">
                {{ p.sku }} - {{ p.name }} (Avail: {{ p.availableQuantity }})
              </option>
            </select>
            <input type="number" [(ngModel)]="newLine.quantity" placeholder="Qty" min="1" class="qty-input">
            <input type="text" [(ngModel)]="newLine.fromBinLocation" placeholder="From Bin" class="bin-input">
            <input type="text" [(ngModel)]="newLine.toBinLocation" placeholder="To Bin" class="bin-input">
            <button class="btn btn-secondary" (click)="addLine()" [disabled]="!canAddLine()">Add</button>
          </div>

          <div class="lines-table" *ngIf="formData.lines.length > 0">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th class="text-right">Quantity</th>
                  <th>From Bin</th>
                  <th>To Bin</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let line of formData.lines; let i = index">
                  <td>{{ getProductName(line.productId) }}</td>
                  <td class="text-right">{{ line.quantity }}</td>
                  <td>{{ line.fromBinLocation || '-' }}</td>
                  <td>{{ line.toBinLocation || '-' }}</td>
                  <td>
                    <button class="btn-icon danger" (click)="removeLine(i)">✕</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td class="text-right"><strong>{{ getTotalQuantity() }}</strong></td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="empty-lines" *ngIf="formData.lines.length === 0">
            <p>No lines added yet. Add products to transfer above.</p>
          </div>
        </app-card>

        <div class="form-actions">
          <a routerLink="/transfers" class="btn btn-secondary">Cancel</a>
          <button class="btn btn-primary" (click)="createTransfer()" [disabled]="!canCreate() || saving()">
            {{ saving() ? 'Creating...' : 'Create Transfer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transfer-form-page { max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0.5rem 0 0; font-size: 1.75rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .form-content { display: flex; flex-direction: column; gap: 1.5rem; }

    .transfer-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }

    .add-line-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
    .product-select { flex: 2; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
    .qty-input { width: 80px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; text-align: center; }
    .bin-input { width: 100px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }

    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tfoot td { border-top: 2px solid #e2e8f0; background: #f8fafc; }
    .text-right { text-align: right; }

    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn:hover:not(:disabled) { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-icon { width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; border: none; background: transparent; cursor: pointer; border-radius: 0.25rem; }
    .btn-icon.danger:hover { background: #fee2e2; color: #991b1b; }

    .empty-lines { text-align: center; padding: 2rem; color: #64748b; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 0; }
  `]
})
export class TransferFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly transfersService = inject(TransfersService);
  private readonly warehousesService = inject(WarehousesService);
  private readonly productsService = inject(ProductsService);

  loading = signal(true);
  saving = signal(false);
  warehouses = signal<any[]>([]);
  products = signal<any[]>([]);
  destinationWarehouses = signal<any[]>([]);
  availableProducts = signal<any[]>([]);

  formData: any = {
    fromWarehouseId: 0,
    toWarehouseId: 0,
    requestDate: new Date().toISOString().split('T')[0],
    expectedArrivalDate: '',
    notes: '',
    lines: []
  };

  newLine: any = {
    productId: 0,
    quantity: 1,
    fromBinLocation: '',
    toBinLocation: ''
  };

  ngOnInit(): void {
    this.loadReferenceData();
  }

  loadReferenceData(): void {
    Promise.all([
      this.warehousesService.getWarehouses({ pageNumber: 1, pageSize: 100 }).toPromise(),
      this.productsService.getProducts({ pageNumber: 1, pageSize: 500 }).toPromise()
    ]).then(([warehouses, products]: any) => {
      this.warehouses.set(warehouses?.items || []);
      this.products.set(products?.items || []);
      this.loading.set(false);
    }).catch(() => this.loading.set(false));
  }

  onFromWarehouseChange(): void {
    // Filter destination to exclude source
    this.destinationWarehouses.set(
      this.warehouses().filter(w => w.id !== this.formData.fromWarehouseId)
    );

    // In real app, would load available stock for the source warehouse
    this.availableProducts.set(
      this.products().map(p => ({
        ...p,
        availableQuantity: Math.floor(Math.random() * 100) + 10 // Mock available qty
      }))
    );
  }

  getProductName(productId: number): string {
    const product = this.products().find(p => p.id === productId);
    return product ? `${product.sku} - ${product.name}` : 'Unknown';
  }

  canAddLine(): boolean {
    return this.newLine.productId > 0 && this.newLine.quantity > 0;
  }

  addLine(): void {
    if (!this.canAddLine()) return;
    this.formData.lines.push({ ...this.newLine });
    this.newLine = { productId: 0, quantity: 1, fromBinLocation: '', toBinLocation: '' };
  }

  removeLine(index: number): void {
    this.formData.lines.splice(index, 1);
  }

  getTotalQuantity(): number {
    return this.formData.lines.reduce((sum: number, line: any) => sum + line.quantity, 0);
  }

  canCreate(): boolean {
    return this.formData.fromWarehouseId > 0 &&
           this.formData.toWarehouseId > 0 &&
           this.formData.fromWarehouseId !== this.formData.toWarehouseId &&
           this.formData.lines.length > 0;
  }

  createTransfer(): void {
    if (!this.canCreate()) return;
    this.saving.set(true);
    const createData: CreateTransfer = {
      sourceWarehouseId: this.formData.fromWarehouseId,
      destinationWarehouseId: this.formData.toWarehouseId,
      requiredDate: new Date(this.formData.expectedArrivalDate || this.formData.requestDate),
      priority: 'Normal',
      notes: this.formData.notes,
      lines: this.formData.lines.map((line: any) => ({
        productId: line.productId,
        requestedQuantity: line.quantity
      }))
    };
    this.transfersService.createTransfer(createData).subscribe({
      next: (result: any) => {
        this.saving.set(false);
        this.router.navigate(['/transfers', result.transferId]);
      },
      error: () => this.saving.set(false)
    });
  }
}
