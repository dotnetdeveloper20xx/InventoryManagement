import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ReportsService } from '../../../core/services/reports.service';
import { ReorderReport } from '../../../core/models/report.model';

@Component({
  selector: 'app-reorder-report',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="report-page">
      <div class="page-header">
        <a routerLink="/reports" class="back-link">← Back to Reports</a>
        <h1>Reorder Report</h1>
        <p>Products below reorder point needing replenishment</p>
      </div>

      <app-spinner *ngIf="loading()" message="Loading report..."></app-spinner>

      <div class="report-content" *ngIf="!loading() && report()">
        <div class="summary-grid">
          <div class="summary-card warning">
            <span class="summary-value">{{ report()!.totalItems }}</span>
            <span class="summary-label">Items to Reorder</span>
          </div>
          <div class="summary-card danger">
            <span class="summary-value">{{ report()!.criticalItems }}</span>
            <span class="summary-label">Critical Items</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">{{ report()!.estimatedOrderValue | currency }}</span>
            <span class="summary-label">Est. Order Value</span>
          </div>
        </div>

        <app-card title="Items to Reorder">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th class="text-right">Current</th>
                  <th class="text-right">Reorder Pt</th>
                  <th class="text-right">Order Qty</th>
                  <th>Supplier</th>
                  <th class="text-right">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of report()!.items">
                  <td><span class="priority-badge" [class]="item.priority.toLowerCase()">{{ item.priority }}</span></td>
                  <td class="sku">{{ item.sku }}</td>
                  <td>{{ item.productName }}</td>
                  <td class="text-right" [class.critical]="item.currentStock <= item.safetyStock">{{ item.currentStock }}</td>
                  <td class="text-right">{{ item.reorderPoint }}</td>
                  <td class="text-right font-bold">{{ item.quantityToOrder }}</td>
                  <td>{{ item.preferredSupplierName || 'N/A' }}</td>
                  <td class="text-right">{{ item.estimatedCost | currency }}</td>
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
    .summary-card.warning { border-left: 4px solid #f59e0b; }
    .summary-card.danger { border-left: 4px solid #ef4444; }
    .summary-value { display: block; font-size: 1.5rem; font-weight: 700; }
    .summary-label { display: block; font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 600; }
    .sku { font-family: monospace; color: #3b82f6; }
    .critical { color: #ef4444; font-weight: 600; }
    .priority-badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; }
    .priority-badge.critical { background: #fee2e2; color: #991b1b; }
    .priority-badge.high { background: #fef3c7; color: #92400e; }
    .priority-badge.medium { background: #dbeafe; color: #1e40af; }
    .priority-badge.low { background: #f1f5f9; color: #475569; }
  `]
})
export class ReorderReportComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  loading = signal(true);
  report = signal<ReorderReport | null>(null);

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getReorderReport({}).subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
