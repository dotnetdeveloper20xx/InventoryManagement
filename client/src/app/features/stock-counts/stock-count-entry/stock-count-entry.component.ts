import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { StockCountsService } from '../../../core/services/stock-counts.service';
import { StockCount, StockCountLine, UpdateStockCountLine } from '../../../core/models/stock-count.model';

@Component({
  selector: 'app-stock-count-entry',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="count-entry-page">
      <div class="page-header">
        <a [routerLink]="['/stock-counts', stockCount()?.stockCountId]" class="back-link">← Back to Count Details</a>
        <div class="header-row">
          <div class="header-content">
            <h1>Count Entry: {{ stockCount()?.countNumber }}</h1>
            <p>{{ stockCount()?.warehouseName }} · {{ stockCount()?.countDate | date:'mediumDate' }}</p>
          </div>
          <div class="progress-info">
            <span class="progress-text">{{ countedCount() }}/{{ totalCount() }} items</span>
            <div class="progress-bar-small">
              <div class="progress" [style.width.%]="progressPercent()"></div>
            </div>
          </div>
        </div>
      </div>

      <app-spinner *ngIf="loading()" message="Loading count..."></app-spinner>

      <div class="entry-content" *ngIf="!loading() && stockCount()">
        <div class="scan-section">
          <app-card title="Quick Entry">
            <div class="scan-row">
              <input type="text" [(ngModel)]="scanInput" placeholder="Scan barcode or enter SKU..." (keyup.enter)="handleScan()" class="scan-input" autofocus>
              <input type="number" [(ngModel)]="scanQuantity" placeholder="Qty" min="0" class="qty-input">
              <button class="btn btn-primary" (click)="handleScan()">Add</button>
            </div>
          </app-card>
        </div>

        <app-card title="Items to Count">
          <div class="filter-row">
            <button class="filter-btn" [class.active]="filterMode === 'all'" (click)="filterMode = 'all'">All ({{ totalCount() }})</button>
            <button class="filter-btn" [class.active]="filterMode === 'pending'" (click)="filterMode = 'pending'">Pending ({{ pendingCount() }})</button>
            <button class="filter-btn" [class.active]="filterMode === 'counted'" (click)="filterMode = 'counted'">Counted ({{ countedCount() }})</button>
            <button class="filter-btn" [class.active]="filterMode === 'variance'" (click)="filterMode = 'variance'">With Variance ({{ varianceCount() }})</button>
          </div>

          <div class="items-list">
            <div class="item-card" *ngFor="let line of filteredLines()" [class.counted]="line.countQuantity1 !== null" [class.variance]="line.variance !== 0 && line.countQuantity1 !== null">
              <div class="item-info">
                <div class="item-sku">{{ line.productSKU }}</div>
                <div class="item-name">{{ line.productName }}</div>
                <div class="item-meta">
                  <span *ngIf="line.binCode">Bin: {{ line.binCode }}</span>
                  <span>System: {{ line.systemQuantity }}</span>
                </div>
              </div>
              <div class="item-count">
                <input type="number" [ngModel]="line.countQuantity1" (ngModelChange)="updateLineQuantity(line, $event)" min="0" placeholder="Count" class="count-input" [class.has-variance]="line.variance !== 0">
                <div class="variance-display" *ngIf="line.countQuantity1 !== null && line.variance !== 0" [class.negative]="line.variance < 0" [class.positive]="line.variance > 0">
                  {{ line.variance > 0 ? '+' : '' }}{{ line.variance }}
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredLines().length === 0">
            <p>No items match the current filter.</p>
          </div>
        </app-card>

        <div class="action-bar">
          <button class="btn btn-secondary" (click)="saveProgress()" [disabled]="saving()">
            {{ saving() ? 'Saving...' : 'Save Progress' }}
          </button>
          <button class="btn btn-success" (click)="completeCount()" [disabled]="pendingCount() > 0 || saving()">
            Complete Count
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .count-entry-page { max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 0.5rem; }
    .header-content h1 { margin: 0; font-size: 1.5rem; color: #1e293b; }
    .header-content p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.875rem; }
    .progress-info { text-align: right; }
    .progress-text { font-size: 0.875rem; color: #475569; font-weight: 500; }
    .progress-bar-small { width: 150px; height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 0.25rem; }
    .progress-bar-small .progress { height: 100%; background: #3b82f6; border-radius: 3px; transition: width 0.3s; }

    .entry-content { display: flex; flex-direction: column; gap: 1.5rem; }

    .scan-row { display: flex; gap: 0.5rem; }
    .scan-input { flex: 1; padding: 0.75rem; border: 2px solid #3b82f6; border-radius: 0.375rem; font-size: 1rem; }
    .qty-input { width: 80px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem; text-align: center; }

    .filter-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
    .filter-btn { padding: 0.5rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; cursor: pointer; }
    .filter-btn:hover { background: #f8fafc; }
    .filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

    .items-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 500px; overflow-y: auto; }
    .item-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .item-card.counted { background: #f0fdf4; border-color: #bbf7d0; }
    .item-card.variance { background: #fefce8; border-color: #fde047; }
    .item-info { flex: 1; }
    .item-sku { font-family: monospace; color: #3b82f6; font-weight: 600; }
    .item-name { color: #1e293b; margin: 0.25rem 0; }
    .item-meta { font-size: 0.75rem; color: #64748b; display: flex; gap: 1rem; }
    .item-count { display: flex; align-items: center; gap: 0.5rem; }
    .count-input { width: 80px; padding: 0.5rem; border: 2px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem; text-align: center; }
    .count-input:focus { outline: none; border-color: #3b82f6; }
    .count-input.has-variance { border-color: #f59e0b; }
    .variance-display { font-size: 0.875rem; font-weight: 600; min-width: 40px; text-align: center; }
    .variance-display.negative { color: #ef4444; }
    .variance-display.positive { color: #10b981; }

    .action-bar { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 0; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn-success { background: #10b981; color: white; }
    .btn:hover:not(:disabled) { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty-state { text-align: center; padding: 2rem; color: #64748b; }
  `]
})
export class StockCountEntryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stockCountsService = inject(StockCountsService);

  loading = signal(true);
  saving = signal(false);
  stockCount = signal<StockCount | null>(null);
  filterMode: 'all' | 'pending' | 'counted' | 'variance' = 'pending';

  scanInput = '';
  scanQuantity = 1;

  totalCount = signal(0);
  countedCount = signal(0);
  pendingCount = signal(0);
  varianceCount = signal(0);
  progressPercent = signal(0);

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
        this.updateCounts();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/stock-counts']);
      }
    });
  }

  updateCounts(): void {
    const sc = this.stockCount();
    if (!sc) return;

    const total = sc.lines.length;
    const counted = sc.lines.filter(l => l.countQuantity1 !== null).length;
    const withVariance = sc.lines.filter(l => l.countQuantity1 !== null && l.variance !== 0).length;

    this.totalCount.set(total);
    this.countedCount.set(counted);
    this.pendingCount.set(total - counted);
    this.varianceCount.set(withVariance);
    this.progressPercent.set(total > 0 ? (counted / total) * 100 : 0);
  }

  filteredLines(): StockCountLine[] {
    const sc = this.stockCount();
    if (!sc) return [];

    switch (this.filterMode) {
      case 'pending':
        return sc.lines.filter(l => l.countQuantity1 === null);
      case 'counted':
        return sc.lines.filter(l => l.countQuantity1 !== null);
      case 'variance':
        return sc.lines.filter(l => l.countQuantity1 !== null && l.variance !== 0);
      default:
        return sc.lines;
    }
  }

  handleScan(): void {
    if (!this.scanInput.trim()) return;

    const sc = this.stockCount();
    if (!sc) return;

    const line = sc.lines.find((l: any) =>
      l.productSKU?.toLowerCase() === this.scanInput.toLowerCase() ||
      l.binCode?.toLowerCase() === this.scanInput.toLowerCase()
    );

    if (line) {
      this.updateLineQuantity(line, this.scanQuantity);
      this.scanInput = '';
      this.scanQuantity = 1;
    } else {
      alert('Product not found in this count');
    }
  }

  updateLineQuantity(line: any, quantity: number | null): void {
    const sc = this.stockCount();
    if (!sc) return;

    // Update locally
    line.countQuantity1 = quantity;
    line.variance = quantity !== null ? quantity - line.systemQuantity : 0;
    line.varianceValue = line.variance * 1; // Simplified for demo

    // Update the signal to trigger UI refresh
    this.stockCount.set({ ...sc, lines: [...sc.lines] });
    this.updateCounts();
  }

  saveProgress(): void {
    const sc = this.stockCount();
    if (!sc) return;

    // Save individual lines - in a real app this would batch update
    this.saving.set(true);
    // For demo: just show success
    setTimeout(() => {
      this.saving.set(false);
      alert('Progress saved successfully');
    }, 500);
  }

  completeCount(): void {
    const sc = this.stockCount();
    if (!sc || this.pendingCount() > 0) return;

    if (confirm('Complete this stock count? All items have been counted.')) {
      this.saveProgress();
      // In real app would call complete endpoint
      this.router.navigate(['/stock-counts', sc.stockCountId]);
    }
  }
}
