import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ReportsService } from '../../../core/services/reports.service';
import { StockOnHandReport } from '../../../core/models/report.model';

@Component({
  selector: 'app-stock-on-hand',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="report-page">
      <div class="page-header">
        <a routerLink="/reports" class="back-link">← Back to Reports</a>
        <h1>Stock On Hand</h1>
        <p>Current stock levels by product and location</p>
      </div>
      <app-spinner *ngIf="loading()" message="Loading report..."></app-spinner>
      <div class="report-content" *ngIf="!loading() && report()">
        <div class="summary-grid">
          <div class="summary-card"><span class="summary-value">{{ report()!.totalProducts }}</span><span class="summary-label">Products</span></div>
          <div class="summary-card"><span class="summary-value">{{ report()!.totalQuantity | number }}</span><span class="summary-label">Total Units</span></div>
          <div class="summary-card highlight"><span class="summary-value">{{ report()!.totalValue | currency }}</span><span class="summary-label">Total Value</span></div>
        </div>
        <app-card title="Stock Details">
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Warehouse</th><th>Bin</th><th class="text-right">On Hand</th><th class="text-right">Reserved</th><th class="text-right">Available</th><th class="text-right">Value</th><th>Status</th></tr></thead>
              <tbody>
                <tr *ngFor="let item of report()!.items">
                  <td class="sku">{{ item.sku }}</td>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.categoryName }}</td>
                  <td>{{ item.warehouseName }}</td>
                  <td>{{ item.binLocation || '-' }}</td>
                  <td class="text-right">{{ item.quantityOnHand }}</td>
                  <td class="text-right">{{ item.quantityReserved }}</td>
                  <td class="text-right font-bold">{{ item.quantityAvailable }}</td>
                  <td class="text-right">{{ item.totalValue | currency }}</td>
                  <td><span class="status-badge" [class]="item.stockStatus.toLowerCase().replace(' ', '-')">{{ item.stockStatus }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .report-page { max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0.5rem 0 0; font-size: 1.75rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .report-content { display: flex; flex-direction: column; gap: 1.5rem; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .summary-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.5rem; text-align: center; }
    .summary-card.highlight { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; }
    .summary-value { display: block; font-size: 1.5rem; font-weight: 700; }
    .summary-label { display: block; font-size: 0.875rem; opacity: 0.8; margin-top: 0.25rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 600; }
    .sku { font-family: monospace; color: #3b82f6; }
    .status-badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; }
    .status-badge.in-stock { background: #d1fae5; color: #065f46; }
    .status-badge.low-stock { background: #fef3c7; color: #92400e; }
    .status-badge.out-of-stock { background: #fee2e2; color: #991b1b; }
  `]
})
export class StockOnHandComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  loading = signal(true);
  report = signal<StockOnHandReport | null>(null);
  ngOnInit(): void { this.loadReport(); }
  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getStockOnHand({}).subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
