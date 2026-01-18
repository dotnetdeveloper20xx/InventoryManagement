import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { GoodsReceiptsService } from '../../../core/services/goods-receipts.service';
import { GoodsReceipt } from '../../../core/models/goods-receipt.model';

@Component({
  selector: 'app-goods-receipt-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="grn-detail-page">
      <div class="page-header">
        <a routerLink="/goods-receipts" class="back-link">← Back to Goods Receipts</a>
        <div class="header-row">
          <div class="header-content">
            <h1>{{ receipt()?.grnNumber }}</h1>
            <span class="status-badge" [class]="receipt()?.status?.toLowerCase()">{{ receipt()?.status }}</span>
          </div>
          <div class="header-actions" *ngIf="receipt()?.status === 'Draft'">
            <button class="btn btn-primary" (click)="postReceipt()" [disabled]="posting()">
              {{ posting() ? 'Posting...' : 'Post Receipt' }}
            </button>
          </div>
        </div>
      </div>

      <app-spinner *ngIf="loading()" message="Loading receipt..."></app-spinner>

      <div class="detail-content" *ngIf="!loading() && receipt()">
        <div class="info-grid">
          <app-card title="Receipt Information">
            <div class="info-list">
              <div class="info-item">
                <span class="label">Receipt Number</span>
                <span class="value">{{ receipt()!.grnNumber }}</span>
              </div>
              <div class="info-item" *ngIf="receipt()!.poNumber">
                <span class="label">Purchase Order</span>
                <span class="value">{{ receipt()!.poNumber }}</span>
              </div>
              <div class="info-item">
                <span class="label">Receipt Date</span>
                <span class="value">{{ receipt()!.receiptDate | date:'mediumDate' }}</span>
              </div>
              <div class="info-item" *ngIf="receipt()!.deliveryNoteNumber">
                <span class="label">Delivery Note</span>
                <span class="value">{{ receipt()!.deliveryNoteNumber }}</span>
              </div>
            </div>
          </app-card>

          <app-card title="Supplier & Warehouse">
            <div class="info-list">
              <div class="info-item">
                <span class="label">Supplier</span>
                <span class="value">{{ receipt()!.supplierName }}</span>
              </div>
              <div class="info-item">
                <span class="label">Warehouse</span>
                <span class="value">{{ receipt()!.warehouseName }}</span>
              </div>
              <div class="info-item">
                <span class="label">Received By</span>
                <span class="value">{{ receipt()!.receivedBy || '-' }}</span>
              </div>
              <div class="info-item" *ngIf="receipt()!.createdDate">
                <span class="label">Created Date</span>
                <span class="value">{{ receipt()!.createdDate | date:'medium' }}</span>
              </div>
            </div>
          </app-card>
        </div>

        <app-card title="Receipt Lines">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Unit Cost</th>
                  <th class="text-right">Total</th>
                  <th>Bin Location</th>
                  <th>Batch #</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let line of receipt()!.lines">
                  <td class="sku">{{ line.productSKU }}</td>
                  <td>{{ line.productName }}</td>
                  <td class="text-right">{{ line.receivedQuantity }}</td>
                  <td class="text-right">{{ line.unitCost | currency }}</td>
                  <td class="text-right">{{ line.totalCost | currency }}</td>
                  <td>{{ line.binId || '-' }}</td>
                  <td>{{ line.batchNumber || '-' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2"><strong>Totals</strong></td>
                  <td class="text-right"><strong>{{ getTotalQuantity() }}</strong></td>
                  <td></td>
                  <td class="text-right"><strong>{{ receipt()!.totalValue | currency }}</strong></td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </app-card>

        <app-card *ngIf="receipt()!.notes" title="Notes">
          <p class="notes-text">{{ receipt()!.notes }}</p>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .grn-detail-page { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
    .header-content { display: flex; align-items: center; gap: 1rem; }
    .header-content h1 { margin: 0; font-size: 1.75rem; color: #1e293b; font-family: monospace; }

    .status-badge { padding: 0.375rem 1rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.draft { background: #fef3c7; color: #92400e; }
    .status-badge.posted { background: #d1fae5; color: #065f46; }
    .status-badge.cancelled { background: #fee2e2; color: #991b1b; }

    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .detail-content { display: flex; flex-direction: column; gap: 1.5rem; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .info-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
    .info-item:last-child { border-bottom: none; }
    .info-item .label { color: #64748b; font-size: 0.875rem; }
    .info-item .value { font-weight: 500; color: #1e293b; }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tfoot td { border-top: 2px solid #e2e8f0; background: #f8fafc; }
    .text-right { text-align: right; }
    .sku { font-family: monospace; color: #3b82f6; }

    .notes-text { margin: 0; color: #475569; white-space: pre-wrap; }

    @media (max-width: 768px) {
      .info-grid { grid-template-columns: 1fr; }
      .header-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
    }
  `]
})
export class GoodsReceiptDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly goodsReceiptsService = inject(GoodsReceiptsService);

  loading = signal(true);
  posting = signal(false);
  receipt = signal<GoodsReceipt | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadReceipt(id);
    }
  }

  loadReceipt(id: number): void {
    this.loading.set(true);
    this.goodsReceiptsService.getGoodsReceipt(id).subscribe({
      next: (data: any) => {
        this.receipt.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/goods-receipts']);
      }
    });
  }

  getTotalQuantity(): number {
    const r = this.receipt();
    if (!r || !r.lines) return 0;
    return r.lines.reduce((sum, line) => sum + line.receivedQuantity, 0);
  }

  postReceipt(): void {
    const receiptId = this.receipt()?.goodsReceiptId;
    if (!receiptId) return;

    if (confirm('Are you sure you want to post this goods receipt? This will update inventory levels and cannot be undone.')) {
      this.posting.set(true);
      this.goodsReceiptsService.postGoodsReceipt(receiptId).subscribe({
        next: () => {
          this.posting.set(false);
          this.loadReceipt(receiptId);
        },
        error: () => this.posting.set(false)
      });
    }
  }
}
