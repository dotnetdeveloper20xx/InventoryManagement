import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { StockCountsService } from '../../../core/services/stock-counts.service';
import { StockCount } from '../../../core/models/stock-count.model';

@Component({
  selector: 'app-stock-counts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="stock-counts-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Stock Counts</h1>
          <p>Physical inventory counts and adjustments</p>
        </div>
        <a routerLink="new" class="btn btn-primary">+ New Stock Count</a>
      </div>

      <div class="summary-cards" *ngIf="!loading()">
        <div class="summary-card">
          <span class="count">{{ inProgressCount() }}</span>
          <span class="label">In Progress</span>
        </div>
        <div class="summary-card">
          <span class="count">{{ completedThisMonth() }}</span>
          <span class="label">Completed This Month</span>
        </div>
        <div class="summary-card highlight">
          <span class="count">{{ totalVariance() | currency }}</span>
          <span class="label">Total Variance</span>
        </div>
      </div>

      <app-spinner *ngIf="loading()" message="Loading stock counts..."></app-spinner>

      <app-card *ngIf="!loading()" title="Stock Count History">
        <div class="toolbar">
          <div class="search-box">
            <input type="text" placeholder="Search by count# or warehouse..." [(ngModel)]="searchTerm" (input)="filterCounts()">
          </div>
          <div class="filters">
            <select [(ngModel)]="statusFilter" (change)="filterCounts()">
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select [(ngModel)]="typeFilter" (change)="filterCounts()">
              <option value="">All Types</option>
              <option value="Full">Full Count</option>
              <option value="Cycle">Cycle Count</option>
              <option value="Spot">Spot Check</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Count #</th>
                <th>Type</th>
                <th>Warehouse</th>
                <th>Count Date</th>
                <th class="text-right">Items</th>
                <th class="text-right">Variance Qty</th>
                <th class="text-right">Variance Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sc of filteredCounts()">
                <td class="count-number">
                  <a [routerLink]="[sc.stockCountId]">{{ sc.countNumber }}</a>
                </td>
                <td>
                  <span class="type-badge" [class]="sc.countType.toLowerCase()">{{ sc.countType }}</span>
                </td>
                <td>{{ sc.warehouseName }}</td>
                <td>{{ sc.countDate | date:'mediumDate' }}</td>
                <td class="text-right">{{ sc.totalLines }}</td>
                <td class="text-right" [class.negative]="sc.varianceLines < 0" [class.positive]="sc.varianceLines > 0">
                  {{ sc.varianceLines > 0 ? '+' : '' }}{{ sc.varianceLines }}
                </td>
                <td class="text-right" [class.negative]="sc.totalVarianceValue < 0" [class.positive]="sc.totalVarianceValue > 0">
                  {{ sc.totalVarianceValue | currency }}
                </td>
                <td>
                  <span class="status-badge" [class]="sc.status.toLowerCase().replace(' ', '-')">{{ sc.status }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="[sc.stockCountId]" class="btn-icon" title="View">👁</a>
                    <a *ngIf="sc.status === 'InProgress'" [routerLink]="[sc.stockCountId, 'count']" class="btn-icon" title="Continue Counting">📝</a>
                    <button *ngIf="sc.status === 'Completed'" class="btn-icon" title="Post" (click)="postCount(sc.stockCountId)">✓</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="filteredCounts().length === 0 && !loading()">
          <p>No stock counts found.</p>
          <a routerLink="new" class="btn btn-primary">Start First Count</a>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .stock-counts-page { max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .header-content h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
    .header-content p { margin: 0.25rem 0 0; color: #64748b; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }

    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.25rem; text-align: center; }
    .summary-card.highlight { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; }
    .summary-card .count { display: block; font-size: 1.5rem; font-weight: 700; }
    .summary-card .label { display: block; font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem; }

    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
    .search-box input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; width: 280px; font-size: 0.875rem; }
    .filters { display: flex; gap: 0.5rem; }
    .filters select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .text-right { text-align: right; }
    .count-number a { color: #3b82f6; text-decoration: none; font-weight: 500; font-family: monospace; }
    .count-number a:hover { text-decoration: underline; }
    .negative { color: #ef4444; }
    .positive { color: #10b981; }

    .type-badge { padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500; }
    .type-badge.full { background: #dbeafe; color: #1e40af; }
    .type-badge.cycle { background: #fef3c7; color: #92400e; }
    .type-badge.spot { background: #f1f5f9; color: #475569; }

    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.draft { background: #f1f5f9; color: #475569; }
    .status-badge.inprogress, .status-badge.in-progress { background: #fef3c7; color: #92400e; }
    .status-badge.completed { background: #d1fae5; color: #065f46; }
    .status-badge.posted { background: #dbeafe; color: #1e40af; }
    .status-badge.cancelled { background: #fee2e2; color: #991b1b; }

    .action-buttons { display: flex; gap: 0.5rem; }
    .btn-icon { width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; text-decoration: none; }
    .btn-icon:hover { background: #f1f5f9; }

    .empty-state { text-align: center; padding: 3rem; color: #64748b; }
    .empty-state .btn { margin-top: 1rem; }
  `]
})
export class StockCountsListComponent implements OnInit {
  private readonly stockCountsService = inject(StockCountsService);

  loading = signal(true);
  counts = signal<StockCount[]>([]);
  filteredCounts = signal<StockCount[]>([]);
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';

  inProgressCount = signal(0);
  completedThisMonth = signal(0);
  totalVariance = signal(0);

  ngOnInit(): void {
    this.loadCounts();
  }

  loadCounts(): void {
    this.loading.set(true);
    this.stockCountsService.getStockCounts({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (data: any) => {
        this.counts.set(data.items);
        this.filteredCounts.set(data.items);
        this.calculateSummary(data.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  calculateSummary(counts: StockCount[]): void {
    this.inProgressCount.set(counts.filter(c => c.status === 'InProgress').length);

    const now = new Date();
    const thisMonth = counts.filter(c => {
      const d = new Date(c.countDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.status === 'Completed';
    });
    this.completedThisMonth.set(thisMonth.length);

    const variance = counts
      .filter(c => c.status === 'Completed' || c.status === 'Posted')
      .reduce((sum, c) => sum + c.totalVarianceValue, 0);
    this.totalVariance.set(variance);
  }

  filterCounts(): void {
    let result = this.counts();
    const search = this.searchTerm.toLowerCase();

    if (search) {
      result = result.filter(c =>
        c.countNumber.toLowerCase().includes(search) ||
        c.warehouseName.toLowerCase().includes(search)
      );
    }

    if (this.statusFilter) {
      result = result.filter(c => c.status === this.statusFilter);
    }

    if (this.typeFilter) {
      result = result.filter(c => c.countType === this.typeFilter);
    }

    this.filteredCounts.set(result);
  }

  postCount(id: number): void {
    if (confirm('Are you sure you want to post this stock count? This will adjust inventory levels.')) {
      this.stockCountsService.postStockCount(id, { stockCountId: id }).subscribe({
        next: () => this.loadCounts()
      });
    }
  }
}
