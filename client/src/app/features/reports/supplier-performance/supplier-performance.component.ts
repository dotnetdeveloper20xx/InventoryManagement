import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ReportsService } from '../../../core/services/reports.service';
import { SupplierPerformanceReport } from '../../../core/models/report.model';

@Component({
  selector: 'app-supplier-performance',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="report-page">
      <div class="page-header">
        <a routerLink="/reports" class="back-link">← Back to Reports</a>
        <h1>Supplier Performance</h1>
        <p>Evaluate supplier delivery and quality metrics</p>
      </div>
      <app-spinner *ngIf="loading()" message="Loading report..."></app-spinner>
      <div class="report-content" *ngIf="!loading() && report()">
        <div class="summary-grid">
          <div class="summary-card"><span class="summary-value">{{ report()!.totalSuppliers }}</span><span class="summary-label">Suppliers</span></div>
          <div class="summary-card"><span class="summary-value">{{ report()!.totalOrders }}</span><span class="summary-label">Total Orders</span></div>
          <div class="summary-card"><span class="summary-value">{{ report()!.averageOnTimeRate | number:'1.0-0' }}%</span><span class="summary-label">Avg On-Time</span></div>
          <div class="summary-card"><span class="summary-value">{{ report()!.averageLeadTime | number:'1.1-1' }} days</span><span class="summary-label">Avg Lead Time</span></div>
        </div>
        <app-card title="Supplier Rankings">
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Rank</th><th>Supplier</th><th class="text-right">Orders</th><th class="text-right">Value</th><th class="text-right">On-Time %</th><th class="text-right">Lead Time</th><th class="text-right">Quality</th></tr></thead>
              <tbody>
                <tr *ngFor="let s of report()!.suppliers">
                  <td class="rank">{{ s.ranking }}</td>
                  <td>{{ s.supplierName }}</td>
                  <td class="text-right">{{ s.totalOrders }}</td>
                  <td class="text-right">{{ s.totalValue | currency }}</td>
                  <td class="text-right" [class.good]="s.onTimeRate >= 90" [class.bad]="s.onTimeRate < 70">{{ s.onTimeRate | number:'1.0-0' }}%</td>
                  <td class="text-right">{{ s.averageLeadTime | number:'1.1-1' }} days</td>
                  <td class="text-right">{{ s.qualityScore | number:'1.0-0' }}/100</td>
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
    .summary-value { display: block; font-size: 1.5rem; font-weight: 700; }
    .summary-label { display: block; font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .text-right { text-align: right; }
    .rank { font-weight: 600; color: #3b82f6; }
    .good { color: #10b981; }
    .bad { color: #ef4444; }
  `]
})
export class SupplierPerformanceComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  loading = signal(true);
  report = signal<SupplierPerformanceReport | null>(null);
  ngOnInit(): void { this.loadReport(); }
  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getSupplierPerformance({}).subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
