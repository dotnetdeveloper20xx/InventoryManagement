import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { StockCountsService } from '../../../core/services/stock-counts.service';
import { StockCount } from '../../../core/models/stock-count.model';

@Component({
  selector: 'app-stock-count-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="stock-count-detail-page">
      <div class="page-header">
        <a routerLink="/stock-counts" class="back-link">← Back to Stock Counts</a>
        <div class="header-row">
          <div class="header-content">
            <h1>{{ stockCount()?.countNumber }}</h1>
            <span class="status-badge" [class]="stockCount()?.status?.toLowerCase()">{{ stockCount()?.status }}</span>
          </div>
          <div class="header-actions">
            <a *ngIf="stockCount()?.status === 'InProgress'" [routerLink]="['count']" class="btn btn-primary">Continue Counting</a>
            <button *ngIf="stockCount()?.status === 'Completed'" class="btn btn-success" (click)="postCount()" [disabled]="posting()">
              {{ posting() ? 'Posting...' : 'Post Count' }}
            </button>
            <button *ngIf="stockCount()?.status === 'InProgress'" class="btn btn-secondary" (click)="completeCount()">
              Complete Count
            </button>
          </div>
        </div>
      </div>

      <app-spinner *ngIf="loading()" message="Loading stock count..."></app-spinner>

      <div class="detail-content" *ngIf="!loading() && stockCount()">
        <div class="info-grid">
          <app-card title="Count Information">
            <div class="info-list">
              <div class="info-item">
                <span class="label">Count Number</span>
                <span class="value">{{ stockCount()!.countNumber }}</span>
              </div>
              <div class="info-item">
                <span class="label">Count Type</span>
                <span class="value">{{ stockCount()!.countType }}</span>
              </div>
              <div class="info-item">
                <span class="label">Count Date</span>
                <span class="value">{{ stockCount()!.countDate | date:'mediumDate' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Warehouse</span>
                <span class="value">{{ stockCount()!.warehouseName }}</span>
              </div>
            </div>
          </app-card>

          <app-card title="Summary">
            <div class="summary-stats">
              <div class="stat">
                <span class="value">{{ stockCount()!.totalLines }}</span>
                <span class="label">Total Items</span>
              </div>
              <div class="stat">
                <span class="value">{{ stockCount()!.countedLines }}</span>
                <span class="label">Counted</span>
              </div>
              <div class="stat" [class.negative]="stockCount()!.varianceLines < 0" [class.positive]="stockCount()!.varianceLines > 0">
                <span class="value">{{ stockCount()!.varianceLines > 0 ? '+' : '' }}{{ stockCount()!.varianceLines }}</span>
                <span class="label">Variance Qty</span>
              </div>
              <div class="stat" [class.negative]="stockCount()!.totalVarianceValue < 0" [class.positive]="stockCount()!.totalVarianceValue > 0">
                <span class="value">{{ stockCount()!.totalVarianceValue | currency }}</span>
                <span class="label">Variance Value</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress" [style.width.%]="getProgress()"></div>
            </div>
            <p class="progress-text">{{ getProgress() | number:'1.0-0' }}% Complete</p>
          </app-card>
        </div>

        <app-card title="Count Lines">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Bin</th>
                  <th class="text-right">System Qty</th>
                  <th class="text-right">Counted Qty</th>
                  <th class="text-right">Variance</th>
                  <th class="text-right">Value Impact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let line of stockCount()!.lines" [class.variance]="line.variance !== 0">
                  <td class="sku">{{ line.productSKU }}</td>
                  <td>{{ line.productName }}</td>
                  <td>{{ line.binCode || '-' }}</td>
                  <td class="text-right">{{ line.systemQuantity }}</td>
                  <td class="text-right">{{ line.countQuantity1 !== null ? line.countQuantity1 : '-' }}</td>
                  <td class="text-right" [class.negative]="line.variance < 0" [class.positive]="line.variance > 0">
                    {{ line.variance !== 0 ? (line.variance > 0 ? '+' : '') + line.variance : '-' }}
                  </td>
                  <td class="text-right" [class.negative]="line.varianceValue < 0" [class.positive]="line.varianceValue > 0">
                    {{ line.varianceValue !== 0 ? (line.varianceValue | currency) : '-' }}
                  </td>
                  <td>
                    <span class="line-status" [class.counted]="line.countQuantity1 !== null">
                      {{ line.countQuantity1 !== null ? 'Counted' : 'Pending' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>

        <app-card *ngIf="stockCount()!.notes" title="Notes">
          <p class="notes-text">{{ stockCount()!.notes }}</p>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .stock-count-detail-page { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
    .header-content { display: flex; align-items: center; gap: 1rem; }
    .header-content h1 { margin: 0; font-size: 1.75rem; color: #1e293b; font-family: monospace; }
    .header-actions { display: flex; gap: 0.75rem; }

    .status-badge { padding: 0.375rem 1rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.draft { background: #f1f5f9; color: #475569; }
    .status-badge.inprogress { background: #fef3c7; color: #92400e; }
    .status-badge.completed { background: #d1fae5; color: #065f46; }
    .status-badge.posted { background: #dbeafe; color: #1e40af; }

    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-success { background: #10b981; color: white; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn:hover:not(:disabled) { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .detail-content { display: flex; flex-direction: column; gap: 1.5rem; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .info-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
    .info-item:last-child { border-bottom: none; }
    .info-item .label { color: #64748b; font-size: 0.875rem; }
    .info-item .value { font-weight: 500; color: #1e293b; }

    .summary-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .stat { text-align: center; padding: 0.75rem; background: #f8fafc; border-radius: 0.375rem; }
    .stat .value { display: block; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .stat .label { display: block; font-size: 0.75rem; color: #64748b; }
    .stat.negative .value { color: #ef4444; }
    .stat.positive .value { color: #10b981; }

    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .progress { height: 100%; background: #3b82f6; transition: width 0.3s ease; }
    .progress-text { margin: 0.5rem 0 0; text-align: center; font-size: 0.75rem; color: #64748b; }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .data-table tbody tr.variance { background: #fefce8; }
    .text-right { text-align: right; }
    .sku { font-family: monospace; color: #3b82f6; }
    .negative { color: #ef4444; }
    .positive { color: #10b981; }

    .line-status { font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 0.25rem; background: #f1f5f9; color: #64748b; }
    .line-status.counted { background: #d1fae5; color: #065f46; }

    .notes-text { margin: 0; color: #475569; white-space: pre-wrap; }

    @media (max-width: 768px) {
      .info-grid { grid-template-columns: 1fr; }
      .header-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .summary-stats { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class StockCountDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stockCountsService = inject(StockCountsService);

  loading = signal(true);
  posting = signal(false);
  stockCount = signal<StockCount | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadStockCount(id);
    }
  }

  loadStockCount(id: number): void {
    this.loading.set(true);
    this.stockCountsService.getStockCount(id).subscribe({
      next: (data: any) => {
        this.stockCount.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/stock-counts']);
      }
    });
  }

  getProgress(): number {
    const sc = this.stockCount();
    if (!sc || sc.totalLines === 0) return 0;
    return (sc.countedLines / sc.totalLines) * 100;
  }

  completeCount(): void {
    const sc = this.stockCount();
    if (!sc) return;

    if (confirm('Mark this stock count as complete? Make sure all items have been counted.')) {
      // In real app would call complete endpoint
      this.loadStockCount(sc.stockCountId);
    }
  }

  postCount(): void {
    const sc = this.stockCount();
    if (!sc) return;

    if (confirm('Are you sure you want to post this stock count? This will adjust inventory levels and cannot be undone.')) {
      this.posting.set(true);
      this.stockCountsService.postStockCount(sc.stockCountId, { stockCountId: sc.stockCountId }).subscribe({
        next: () => {
          this.posting.set(false);
          this.loadStockCount(sc.stockCountId);
        },
        error: () => this.posting.set(false)
      });
    }
  }
}
