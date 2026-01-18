import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  category: string;
}

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <h1>Reports</h1>
        <p>Generate and view inventory reports</p>
      </div>

      <div class="reports-grid">
        <div *ngFor="let report of reports" class="report-card" [routerLink]="report.route">
          <div class="report-icon">{{ report.icon }}</div>
          <div class="report-content">
            <h3>{{ report.title }}</h3>
            <p>{{ report.description }}</p>
            <span class="category-badge">{{ report.category }}</span>
          </div>
          <div class="report-arrow">→</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page {
      max-width: 1200px;
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

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }

    .report-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
    }

    .report-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }

    .report-icon {
      width: 56px;
      height: 56px;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .report-content {
      flex: 1;
    }

    .report-content h3 {
      margin: 0;
      font-size: 1.125rem;
      color: #1e293b;
    }

    .report-content p {
      margin: 0.25rem 0 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .category-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      background: #f1f5f9;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: #475569;
    }

    .report-arrow {
      font-size: 1.25rem;
      color: #94a3b8;
      flex-shrink: 0;
    }

    .report-card:hover .report-arrow {
      color: #3b82f6;
      transform: translateX(4px);
    }
  `]
})
export class ReportsListComponent {
  reports: ReportCard[] = [
    {
      title: 'Inventory Valuation',
      description: 'View current inventory value by product, category, or warehouse',
      icon: '💰',
      route: '/reports/inventory-valuation',
      category: 'Financial'
    },
    {
      title: 'Stock Movement',
      description: 'Track all inventory movements over a period',
      icon: '📊',
      route: '/reports/stock-movement',
      category: 'Operations'
    },
    {
      title: 'Reorder Report',
      description: 'Products below reorder point needing replenishment',
      icon: '🔔',
      route: '/reports/reorder',
      category: 'Purchasing'
    },
    {
      title: 'ABC Analysis',
      description: 'Classify products by value and movement velocity',
      icon: '📈',
      route: '/reports/abc-analysis',
      category: 'Analytics'
    },
    {
      title: 'Supplier Performance',
      description: 'Evaluate supplier delivery and quality metrics',
      icon: '🚚',
      route: '/reports/supplier-performance',
      category: 'Purchasing'
    },
    {
      title: 'Aging Analysis',
      description: 'Identify slow-moving and obsolete inventory',
      icon: '⏰',
      route: '/reports/aging-analysis',
      category: 'Analytics'
    },
    {
      title: 'Stock On Hand',
      description: 'Current stock levels by product and location',
      icon: '📦',
      route: '/reports/stock-on-hand',
      category: 'Inventory'
    }
  ];
}
