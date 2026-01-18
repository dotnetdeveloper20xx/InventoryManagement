import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ReportsService } from '../../../core/services/reports.service';
import { StockMovementReport, ReportFilter } from '../../../core/models/report.model';

@Component({
  selector: 'app-stock-movement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="report-page">
      <div class="page-header">
        <div class="header-content">
          <a routerLink="/reports" class="back-link">← Back to Reports</a>
          <h1>Stock Movement Report</h1>
          <p>Track all inventory movements over a period</p>
        </div>
      </div>

      <app-card>
        <div class="filters-row">
          <div class="filter-group">
            <label>From Date</label>
            <input type="date" [(ngModel)]="fromDate" (change)="loadReport()">
          </div>
          <div class="filter-group">
            <label>To Date</label>
            <input type="date" [(ngModel)]="toDate" (change)="loadReport()">
          </div>
        </div>
      </app-card>

      <app-spinner *ngIf="loading()" message="Loading report..."></app-spinner>

      <div class="report-content" *ngIf="!loading() && report()">
        <div class="summary-grid">
          <div class="summary-card inbound">
            <span class="summary-value">{{ report()!.totalInbound | number }}</span>
            <span class="summary-label">Total Inbound</span>
          </div>
          <div class="summary-card outbound">
            <span class="summary-value">{{ report()!.totalOutbound | number }}</span>
            <span class="summary-label">Total Outbound</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">{{ report()!.netMovement | number }}</span>
            <span class="summary-label">Net Movement</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">{{ report()!.totalValue | currency }}</span>
            <span class="summary-label">Total Value</span>
          </div>
        </div>

        <app-card title="Movement Details">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Movement #</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>From</th>
                  <th>To</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of report()!.movements">
                  <td class="ref">{{ item.movementNumber }}</td>
                  <td>{{ item.movementDate | date:'short' }}</td>
                  <td><span class="type-badge" [class]="item.movementType.toLowerCase()">{{ item.movementType }}</span></td>
                  <td class="sku">{{ item.sku }}</td>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.fromWarehouse || '-' }}</td>
                  <td>{{ item.toWarehouse || '-' }}</td>
                  <td class="text-right">{{ item.quantity | number }}</td>
                  <td class="text-right">{{ item.totalCost | currency }}</td>
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
    .header-content h1 { margin: 0.5rem 0 0; font-size: 1.75rem; color: #1e293b; }
    .header-content p { margin: 0.25rem 0 0; color: #64748b; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .filters-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-group label { font-size: 0.875rem; color: #64748b; }
    .filter-group input { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.25rem; }
    .report-content { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .summary-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.5rem; text-align: center; }
    .summary-card.inbound { border-left: 4px solid #10b981; }
    .summary-card.outbound { border-left: 4px solid #f59e0b; }
    .summary-value { display: block; font-size: 1.5rem; font-weight: 700; }
    .summary-label { display: block; font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .text-right { text-align: right; }
    .sku { font-family: monospace; color: #3b82f6; }
    .ref { font-family: monospace; }
    .type-badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; }
    .type-badge.purchasereceipt { background: #d1fae5; color: #065f46; }
    .type-badge.transferin { background: #dbeafe; color: #1e40af; }
    .type-badge.transferout { background: #fef3c7; color: #92400e; }
    .type-badge.adjustmentin { background: #e0e7ff; color: #3730a3; }
    .type-badge.adjustmentout { background: #fee2e2; color: #991b1b; }
  `]
})
export class StockMovementComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);

  loading = signal(true);
  report = signal<StockMovementReport | null>(null);
  fromDate = '';
  toDate = '';

  ngOnInit(): void {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.fromDate = lastWeek.toISOString().split('T')[0];
    this.toDate = today.toISOString().split('T')[0];
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    const filter: ReportFilter = {
      fromDate: this.fromDate ? new Date(this.fromDate) : undefined,
      toDate: this.toDate ? new Date(this.toDate) : undefined
    };
    this.reportsService.getStockMovement(filter).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
