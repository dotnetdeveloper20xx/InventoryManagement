import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ReportsService } from '../../core/services/reports.service';
import { AlertsService } from '../../core/services/alerts.service';
import { DashboardStats, MovementTrendDto, CategoryValueDto, RecentActivityDto } from '../../core/models/report.model';
import { AlertSummary } from '../../core/models/alert.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to StockFlow Pro - Inventory Management System</p>
      </div>

      <app-spinner *ngIf="loading()" message="Loading dashboard..."></app-spinner>

      <div class="dashboard-content" *ngIf="!loading()">
        <!-- Main Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon products">📦</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalProducts || 0 }}</span>
              <span class="stat-label">Total Products</span>
            </div>
          </div>
          <div class="stat-card" [class.warning]="(stats()?.lowStockItems || 0) > 0">
            <div class="stat-icon low-stock">⚠️</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.lowStockItems || 0 }}</span>
              <span class="stat-label">Low Stock Items</span>
            </div>
          </div>
          <div class="stat-card" [class.danger]="(stats()?.outOfStockItems || 0) > 0">
            <div class="stat-icon out-stock">🚫</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.outOfStockItems || 0 }}</span>
              <span class="stat-label">Out of Stock</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warehouses">🏭</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalWarehouses || 0 }}</span>
              <span class="stat-label">Warehouses</span>
            </div>
          </div>
        </div>

        <!-- Financial Stats -->
        <div class="stats-grid">
          <div class="stat-card large">
            <div class="stat-icon money">💰</div>
            <div class="stat-info">
              <span class="stat-value">{{ formatCurrency(stats()?.inventoryValue || 0) }}</span>
              <span class="stat-label">Inventory Value</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon suppliers">🚚</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalSuppliers || 0 }}</span>
              <span class="stat-label">Active Suppliers</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon pending">📋</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.pendingPOs || 0 }}</span>
              <span class="stat-label">Pending POs</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon movements">🔄</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.recentMovements || 0 }}</span>
              <span class="stat-label">Recent Movements</span>
            </div>
          </div>
        </div>

        <!-- Alerts Summary -->
        <div class="alerts-banner" *ngIf="alertSummary() && alertSummary()!.totalAlerts > 0">
          <div class="alert-item critical" *ngIf="alertSummary()!.criticalCount > 0">
            <span class="alert-count">{{ alertSummary()!.criticalCount }}</span>
            <span class="alert-label">Critical Alerts</span>
          </div>
          <div class="alert-item warning" *ngIf="alertSummary()!.warningCount > 0">
            <span class="alert-count">{{ alertSummary()!.warningCount }}</span>
            <span class="alert-label">Warnings</span>
          </div>
          <div class="alert-item info" *ngIf="alertSummary()!.infoCount > 0">
            <span class="alert-count">{{ alertSummary()!.infoCount }}</span>
            <span class="alert-label">Info</span>
          </div>
          <a routerLink="/alerts" class="view-alerts-btn">View All Alerts</a>
        </div>

        <!-- Quick Actions -->
        <div class="section">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <a routerLink="/products" class="action-card">
              <span class="action-icon">➕</span>
              <span class="action-label">Add Product</span>
            </a>
            <a routerLink="/purchase-orders" class="action-card">
              <span class="action-icon">📝</span>
              <span class="action-label">Create PO</span>
            </a>
            <a routerLink="/goods-receipts" class="action-card">
              <span class="action-icon">📥</span>
              <span class="action-label">Receive Goods</span>
            </a>
            <a routerLink="/transfers" class="action-card">
              <span class="action-icon">🔄</span>
              <span class="action-label">New Transfer</span>
            </a>
            <a routerLink="/stock-counts" class="action-card">
              <span class="action-icon">📊</span>
              <span class="action-label">Stock Count</span>
            </a>
            <a routerLink="/reports" class="action-card">
              <span class="action-icon">📈</span>
              <span class="action-label">Reports</span>
            </a>
          </div>
        </div>

        <div class="charts-row">
          <!-- Stock Value by Category Chart -->
          <app-card title="Stock Value by Category" class="chart-card">
            <div class="category-chart">
              <div class="chart-bars">
                <div *ngFor="let cat of stats()?.stockValueByCategory || []" class="bar-item">
                  <div class="bar-label">{{ cat.categoryName }}</div>
                  <div class="bar-container">
                    <div class="bar" [style.width.%]="cat.percentage"></div>
                  </div>
                  <div class="bar-value">{{ formatCurrency(cat.value) }}</div>
                </div>
                <div *ngIf="!stats()?.stockValueByCategory?.length" class="no-data">
                  No category data available
                </div>
              </div>
            </div>
          </app-card>

          <!-- Top Moving Products -->
          <app-card title="Top Moving Products" class="chart-card">
            <div class="top-products">
              <div *ngFor="let product of stats()?.topMovingProducts || []; let i = index" class="product-item">
                <span class="rank">#{{ i + 1 }}</span>
                <div class="product-info">
                  <span class="product-name">{{ product.productName }}</span>
                  <span class="product-sku">{{ product.sku }}</span>
                </div>
                <span class="movement-count">{{ product.totalQuantity }} units</span>
              </div>
              <div *ngIf="!stats()?.topMovingProducts?.length" class="no-data">
                No movement data available
              </div>
            </div>
          </app-card>
        </div>

        <!-- Movement Trends Chart -->
        <app-card title="Stock Movement Trends (Last 7 Days)">
          <div class="trends-chart">
            <div class="trend-bars">
              <div *ngFor="let trend of stats()?.movementTrends || []" class="trend-item">
                <div class="trend-date">{{ formatDate(trend.date) }}</div>
                <div class="trend-bar-container">
                  <div class="trend-bar inbound" [style.height.px]="getTrendHeight(trend.inbound, 'inbound')"></div>
                  <div class="trend-bar outbound" [style.height.px]="getTrendHeight(trend.outbound, 'outbound')"></div>
                </div>
                <div class="trend-values">
                  <span class="inbound-val">+{{ trend.inbound }}</span>
                  <span class="outbound-val">-{{ trend.outbound }}</span>
                </div>
              </div>
            </div>
            <div class="trend-legend">
              <span class="legend-item"><span class="legend-color inbound"></span> Inbound</span>
              <span class="legend-item"><span class="legend-color outbound"></span> Outbound</span>
            </div>
          </div>
        </app-card>

        <!-- Recent Activity -->
        <app-card title="Recent Activity">
          <div class="activity-list">
            <div *ngFor="let activity of stats()?.recentActivity || []" class="activity-item">
              <span class="activity-icon">{{ getActivityIcon(activity.type) }}</span>
              <div class="activity-content">
                <span class="activity-description">{{ activity.description }}</span>
                <span class="activity-meta">
                  <span class="activity-ref">{{ activity.reference }}</span>
                  <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                </span>
              </div>
            </div>
            <div *ngIf="!stats()?.recentActivity?.length" class="no-activity">
              No recent activity
            </div>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      color: #1e293b;
    }

    .page-header p {
      margin: 0.5rem 0 0;
      color: #64748b;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .stat-card.warning {
      border-left: 4px solid #f59e0b;
    }

    .stat-card.danger {
      border-left: 4px solid #ef4444;
    }

    .stat-card.large {
      grid-column: span 1;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: #f1f5f9;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .alerts-banner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 0.5rem;
      padding: 1rem 1.5rem;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert-item.critical .alert-count {
      background: #ef4444;
      color: white;
    }

    .alert-item.warning .alert-count {
      background: #f59e0b;
      color: white;
    }

    .alert-item.info .alert-count {
      background: #3b82f6;
      color: white;
    }

    .alert-count {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-weight: 600;
    }

    .alert-label {
      color: #92400e;
      font-weight: 500;
    }

    .view-alerts-btn {
      margin-left: auto;
      background: #f59e0b;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      text-decoration: none;
      font-weight: 500;
    }

    .section h2 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
      color: #1e293b;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1.25rem;
      text-align: center;
      text-decoration: none;
      transition: all 0.15s;
      cursor: pointer;
    }

    .action-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
    }

    .action-icon {
      font-size: 1.75rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .action-label {
      color: #1e293b;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .chart-card {
      min-height: 300px;
    }

    .category-chart, .top-products {
      padding: 0.5rem 0;
    }

    .bar-item {
      display: grid;
      grid-template-columns: 120px 1fr 100px;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .bar-label {
      font-size: 0.875rem;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-container {
      height: 24px;
      background: #e2e8f0;
      border-radius: 0.25rem;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #6366f1);
      border-radius: 0.25rem;
      transition: width 0.3s;
    }

    .bar-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      text-align: right;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .product-item:last-child {
      border-bottom: none;
    }

    .rank {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #475569;
      font-size: 0.875rem;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-weight: 500;
      color: #1e293b;
    }

    .product-sku {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .movement-count {
      font-weight: 600;
      color: #3b82f6;
    }

    .trends-chart {
      padding: 1rem 0;
    }

    .trend-bars {
      display: flex;
      gap: 1rem;
      height: 180px;
      align-items: flex-end;
      padding-bottom: 2rem;
    }

    .trend-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .trend-date {
      font-size: 0.75rem;
      color: #64748b;
      position: absolute;
      bottom: 0;
    }

    .trend-bar-container {
      display: flex;
      gap: 4px;
      align-items: flex-end;
      height: 120px;
    }

    .trend-bar {
      width: 20px;
      border-radius: 0.25rem 0.25rem 0 0;
      min-height: 4px;
    }

    .trend-bar.inbound {
      background: #10b981;
    }

    .trend-bar.outbound {
      background: #f59e0b;
    }

    .trend-values {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }

    .inbound-val {
      color: #10b981;
    }

    .outbound-val {
      color: #f59e0b;
    }

    .trend-legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 0.25rem;
    }

    .legend-color.inbound {
      background: #10b981;
    }

    .legend-color.outbound {
      background: #f59e0b;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      font-size: 1.25rem;
    }

    .activity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .activity-description {
      color: #1e293b;
    }

    .activity-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
    }

    .activity-ref {
      color: #3b82f6;
    }

    .activity-time {
      color: #94a3b8;
    }

    .no-activity, .no-data {
      text-align: center;
      color: #94a3b8;
      padding: 2rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly alertsService = inject(AlertsService);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  alertSummary = signal<AlertSummary | null>(null);
  maxTrendValue = signal(100);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    forkJoin({
      stats: this.reportsService.getDashboardStats(),
      alerts: this.alertsService.getSummary()
    }).subscribe({
      next: ({ stats, alerts }) => {
        this.stats.set(stats);
        this.alertSummary.set(alerts);

        // Calculate max trend value for chart scaling
        if (stats.movementTrends?.length) {
          const maxInbound = Math.max(...stats.movementTrends.map(t => t.inbound));
          const maxOutbound = Math.max(...stats.movementTrends.map(t => t.outbound));
          this.maxTrendValue.set(Math.max(maxInbound, maxOutbound, 1));
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        // Fallback to mock data
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    this.stats.set({
      totalProducts: 156,
      activeProducts: 142,
      totalCategories: 12,
      totalSuppliers: 24,
      totalWarehouses: 3,
      totalSKUs: 156,
      inventoryValue: 1250000,
      stockOnHand: 45000,
      lowStockItems: 12,
      outOfStockItems: 3,
      expiringItems: 5,
      pendingPOs: 8,
      pendingReceipts: 4,
      pendingTransfers: 2,
      recentMovements: 34,
      alertsCount: 15,
      criticalAlertsCount: 3,
      movementTrends: [
        { date: '2025-01-11', inbound: 45, outbound: 32 },
        { date: '2025-01-12', inbound: 52, outbound: 41 },
        { date: '2025-01-13', inbound: 38, outbound: 45 },
        { date: '2025-01-14', inbound: 67, outbound: 38 },
        { date: '2025-01-15', inbound: 49, outbound: 52 },
        { date: '2025-01-16', inbound: 58, outbound: 44 },
        { date: '2025-01-17', inbound: 42, outbound: 35 }
      ],
      stockValueByCategory: [
        { categoryName: 'Electronics', value: 450000, percentage: 36 },
        { categoryName: 'Furniture', value: 280000, percentage: 22 },
        { categoryName: 'Office Supplies', value: 180000, percentage: 14 },
        { categoryName: 'Hardware', value: 150000, percentage: 12 },
        { categoryName: 'Software', value: 120000, percentage: 10 },
        { categoryName: 'Other', value: 70000, percentage: 6 }
      ],
      topMovingProducts: [
        { productId: 1, sku: 'ELEC-001', productName: 'MacBook Pro 14"', totalMovements: 45, totalQuantity: 124 },
        { productId: 2, sku: 'ELEC-015', productName: 'Dell XPS 15', totalMovements: 38, totalQuantity: 98 },
        { productId: 3, sku: 'FURN-003', productName: 'Ergonomic Chair', totalMovements: 32, totalQuantity: 76 },
        { productId: 4, sku: 'SUPP-008', productName: 'Printer Paper A4', totalMovements: 28, totalQuantity: 450 },
        { productId: 5, sku: 'ELEC-022', productName: 'Wireless Mouse', totalMovements: 25, totalQuantity: 210 }
      ],
      recentActivity: [
        { activityId: 1, type: 'receipt', description: 'Received 50 units of MacBook Pro 14"', reference: 'GRN-2025-00142', timestamp: new Date(), userName: 'admin' },
        { activityId: 2, type: 'order', description: 'Purchase Order PO-2025-0042 created', reference: 'PO-2025-00042', timestamp: new Date(Date.now() - 3600000), userName: 'admin' },
        { activityId: 3, type: 'adjustment', description: 'Stock adjustment for Dell XPS 15', reference: 'ADJ-2025-00015', timestamp: new Date(Date.now() - 7200000), userName: 'admin' },
        { activityId: 4, type: 'transfer', description: 'Transfer completed: Main Warehouse to Branch', reference: 'TRF-2025-00028', timestamp: new Date(Date.now() - 14400000), userName: 'admin' }
      ]
    });

    this.alertSummary.set({
      totalAlerts: 15,
      unreadAlerts: 8,
      criticalCount: 3,
      warningCount: 7,
      infoCount: 5,
      byType: []
    });

    this.maxTrendValue.set(67);
    this.loading.set(false);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getTrendHeight(value: number, type: 'inbound' | 'outbound'): number {
    const maxHeight = 100;
    return Math.max(4, (value / this.maxTrendValue()) * maxHeight);
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      receipt: '📥',
      order: '📝',
      adjustment: '📊',
      transfer: '🔄',
      shipment: '🚚',
      count: '📋'
    };
    return icons[type] || '📌';
  }
}
