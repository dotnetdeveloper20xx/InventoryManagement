import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ReportsService } from '../../../core/services/reports.service';
import { AgingAnalysisReport } from '../../../core/models/report.model';

@Component({
  selector: 'app-aging-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="report-page">
      <div class="page-header">
        <a routerLink="/reports" class="back-link">← Back to Reports</a>
        <h1>Aging Analysis</h1>
        <p>Identify slow-moving and obsolete inventory</p>
      </div>
      <app-spinner *ngIf="loading()" message="Loading report..."></app-spinner>
      <div class="report-content" *ngIf="!loading() && report()">
        <div class="buckets-grid">
          <div *ngFor="let bucket of report()!.buckets" class="bucket-card">
            <h4>{{ bucket.bucketName }}</h4>
            <div class="bucket-value">{{ bucket.totalValue | currency }}</div>
            <div class="bucket-meta">{{ bucket.itemCount }} items · {{ bucket.valuePercentage | number:'1.0-0' }}%</div>
          </div>
        </div>
        <app-card title="Aging Details">
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>SKU</th><th>Product</th><th>Warehouse</th><th class="text-right">Qty</th><th class="text-right">Value</th><th class="text-right">Days in Stock</th><th>Age Bucket</th></tr></thead>
              <tbody>
                <tr *ngFor="let item of report()!.items">
                  <td class="sku">{{ item.sku }}</td>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.warehouseName }}</td>
                  <td class="text-right">{{ item.quantity }}</td>
                  <td class="text-right">{{ item.value | currency }}</td>
                  <td class="text-right">{{ item.daysInInventory }}</td>
                  <td><span class="age-badge">{{ item.ageBucket }}</span></td>
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
    .buckets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
    .bucket-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; text-align: center; }
    .bucket-card h4 { margin: 0 0 0.5rem; font-size: 0.875rem; color: #64748b; }
    .bucket-value { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .bucket-meta { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .text-right { text-align: right; }
    .sku { font-family: monospace; color: #3b82f6; }
    .age-badge { padding: 0.125rem 0.5rem; background: #f1f5f9; border-radius: 9999px; font-size: 0.75rem; }
  `]
})
export class AgingAnalysisComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  loading = signal(true);
  report = signal<AgingAnalysisReport | null>(null);
  ngOnInit(): void { this.loadReport(); }
  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getAgingAnalysis({}).subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
