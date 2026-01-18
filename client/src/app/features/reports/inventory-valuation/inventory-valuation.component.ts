import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ReportsService } from '../../../core/services/reports.service';
import { WarehousesService } from '../../warehouses/warehouses.service';
import { InventoryValuationReport, ReportFilter } from '../../../core/models/report.model';

@Component({
  selector: 'app-inventory-valuation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="report-page">
      <div class="page-header">
        <div class="header-content">
          <a routerLink="/reports" class="back-link">← Back to Reports</a>
          <h1>Inventory Valuation Report</h1>
          <p>Current inventory value by product and category</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportReport()">Export CSV</button>
          <button class="btn-primary" (click)="loadReport()">Refresh</button>
        </div>
      </div>

      <!-- Filters -->
      <app-card>
        <div class="filters-row">
          <div class="filter-group">
            <label>Warehouse</label>
            <select [(ngModel)]="filter.warehouseId" (change)="loadReport()">
              <option [value]="undefined">All Warehouses</option>
              <option *ngFor="let wh of warehouses()" [value]="wh.id">{{ wh.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Category</label>
            <select [(ngModel)]="filter.categoryId" (change)="loadReport()">
              <option [value]="undefined">All Categories</option>
            </select>
          </div>
        </div>
      </app-card>

      <app-spinner *ngIf="loading()" message="Loading report..."></app-spinner>

      <div class="report-content" *ngIf="!loading() && report()">
        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="summary-card">
            <span class="summary-value">{{ report()!.totalSKUs | number }}</span>
            <span class="summary-label">Total SKUs</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">{{ report()!.totalQuantity | number }}</span>
            <span class="summary-label">Total Units</span>
          </div>
          <div class="summary-card highlight">
            <span class="summary-value">{{ report()!.totalValue | currency }}</span>
            <span class="summary-label">Total Value</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">{{ report()!.averageUnitCost | currency }}</span>
            <span class="summary-label">Avg Unit Cost</span>
          </div>
        </div>

        <!-- Category Summary -->
        <app-card title="Value by Category">
          <div class="category-bars">
            <div *ngFor="let cat of report()!.summaryByCategory" class="category-bar-item">
              <span class="cat-name">{{ cat.categoryName }}</span>
              <div class="cat-bar-container">
                <div class="cat-bar" [style.width.%]="cat.percentage"></div>
              </div>
              <span class="cat-value">{{ cat.value | currency }}</span>
              <span class="cat-percent">{{ cat.percentage | number:'1.1-1' }}%</span>
            </div>
          </div>
        </app-card>

        <!-- Detail Table -->
        <app-card title="Inventory Details">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Warehouse</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Unit Cost</th>
                  <th class="text-right">Total Value</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of report()!.items">
                  <td class="sku">{{ item.sku }}</td>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.categoryName }}</td>
                  <td>{{ item.warehouseName }}</td>
                  <td class="text-right">{{ item.quantityOnHand | number }}</td>
                  <td class="text-right">{{ item.unitCost | currency }}</td>
                  <td class="text-right font-bold">{{ item.totalValue | currency }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4"><strong>Total</strong></td>
                  <td class="text-right"><strong>{{ report()!.totalQuantity | number }}</strong></td>
                  <td></td>
                  <td class="text-right"><strong>{{ report()!.totalValue | currency }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .report-page { max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .header-content h1 { margin: 0.5rem 0 0; font-size: 1.75rem; color: #1e293b; }
    .header-content p { margin: 0.25rem 0 0; color: #64748b; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .header-actions { display: flex; gap: 0.5rem; }
    .btn-primary { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; }
    .btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; }
    .filters-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; min-width: 200px; }
    .filter-group label { font-size: 0.875rem; color: #64748b; }
    .filter-group select { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.25rem; }
    .report-content { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .summary-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.5rem; text-align: center; }
    .summary-card.highlight { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; }
    .summary-value { display: block; font-size: 1.5rem; font-weight: 700; }
    .summary-label { display: block; font-size: 0.875rem; opacity: 0.8; margin-top: 0.25rem; }
    .category-bars { padding: 0.5rem 0; }
    .category-bar-item { display: grid; grid-template-columns: 140px 1fr 100px 60px; gap: 1rem; align-items: center; margin-bottom: 0.75rem; }
    .cat-name { font-size: 0.875rem; color: #475569; }
    .cat-bar-container { height: 20px; background: #e2e8f0; border-radius: 0.25rem; overflow: hidden; }
    .cat-bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #6366f1); border-radius: 0.25rem; }
    .cat-value { font-size: 0.875rem; font-weight: 600; text-align: right; }
    .cat-percent { font-size: 0.75rem; color: #64748b; text-align: right; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .data-table tfoot td { background: #f8fafc; border-top: 2px solid #e2e8f0; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 600; }
    .sku { font-family: monospace; color: #3b82f6; }
  `]
})
export class InventoryValuationComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly warehousesService = inject(WarehousesService);

  loading = signal(true);
  report = signal<InventoryValuationReport | null>(null);
  warehouses = signal<Array<{ id: number; name: string }>>([]);
  filter: ReportFilter = {};

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadReport();
  }

  loadWarehouses(): void {
    this.warehousesService.getWarehouses({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (data: any) => this.warehouses.set(data.items.map((w: any) => ({ id: w.warehouseId, name: w.name }))),
      error: (err: any) => console.error('Failed to load warehouses', err)
    });
  }

  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getInventoryValuation(this.filter).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load report', err);
        this.loading.set(false);
      }
    });
  }

  exportReport(): void {
    // Export functionality
    console.log('Exporting report...');
  }
}
