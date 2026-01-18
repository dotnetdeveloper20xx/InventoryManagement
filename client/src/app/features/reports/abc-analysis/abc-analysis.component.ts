import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ReportsService } from '../../../core/services/reports.service';
import { ABCAnalysisReport } from '../../../core/models/report.model';

@Component({
  selector: 'app-abc-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="report-page">
      <div class="page-header">
        <a routerLink="/reports" class="back-link">← Back to Reports</a>
        <h1>ABC Analysis</h1>
        <p>Classify products by value and movement velocity</p>
      </div>

      <app-spinner *ngIf="loading()" message="Loading report..."></app-spinner>

      <div class="report-content" *ngIf="!loading() && report()">
        <div class="abc-grid">
          <div class="abc-card class-a">
            <h3>Class A</h3>
            <div class="abc-stats">
              <div class="stat"><span class="value">{{ report()!.classA.productCount }}</span><span class="label">Products ({{ report()!.classA.productPercentage | number:'1.0-0' }}%)</span></div>
              <div class="stat"><span class="value">{{ report()!.classA.totalValue | currency }}</span><span class="label">Value ({{ report()!.classA.valuePercentage | number:'1.0-0' }}%)</span></div>
            </div>
            <p class="abc-desc">High value items requiring tight control</p>
          </div>
          <div class="abc-card class-b">
            <h3>Class B</h3>
            <div class="abc-stats">
              <div class="stat"><span class="value">{{ report()!.classB.productCount }}</span><span class="label">Products ({{ report()!.classB.productPercentage | number:'1.0-0' }}%)</span></div>
              <div class="stat"><span class="value">{{ report()!.classB.totalValue | currency }}</span><span class="label">Value ({{ report()!.classB.valuePercentage | number:'1.0-0' }}%)</span></div>
            </div>
            <p class="abc-desc">Moderate value items with regular monitoring</p>
          </div>
          <div class="abc-card class-c">
            <h3>Class C</h3>
            <div class="abc-stats">
              <div class="stat"><span class="value">{{ report()!.classC.productCount }}</span><span class="label">Products ({{ report()!.classC.productPercentage | number:'1.0-0' }}%)</span></div>
              <div class="stat"><span class="value">{{ report()!.classC.totalValue | currency }}</span><span class="label">Value ({{ report()!.classC.valuePercentage | number:'1.0-0' }}%)</span></div>
            </div>
            <p class="abc-desc">Low value items with minimal control</p>
          </div>
        </div>

        <app-card title="Product Classification">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th class="text-right">Annual Value</th>
                  <th class="text-right">Value %</th>
                  <th class="text-right">Cumulative %</th>
                  <th class="text-right">Turnover Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of report()!.items">
                  <td><span class="class-badge" [class]="'class-' + item.classification.toLowerCase()">{{ item.classification }}</span></td>
                  <td class="sku">{{ item.sku }}</td>
                  <td>{{ item.productName }}</td>
                  <td class="text-right">{{ item.annualValue | currency }}</td>
                  <td class="text-right">{{ item.valuePercentage | number:'1.2-2' }}%</td>
                  <td class="text-right">{{ item.cumulativePercentage | number:'1.2-2' }}%</td>
                  <td class="text-right">{{ item.turnoverRate | number:'1.2-2' }}</td>
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
    .abc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .abc-card { background: white; border-radius: 0.5rem; padding: 1.5rem; text-align: center; }
    .abc-card.class-a { border: 2px solid #10b981; }
    .abc-card.class-b { border: 2px solid #3b82f6; }
    .abc-card.class-c { border: 2px solid #f59e0b; }
    .abc-card h3 { margin: 0 0 1rem; font-size: 1.25rem; }
    .class-a h3 { color: #10b981; }
    .class-b h3 { color: #3b82f6; }
    .class-c h3 { color: #f59e0b; }
    .abc-stats { display: flex; justify-content: space-around; margin-bottom: 1rem; }
    .abc-stats .stat { text-align: center; }
    .abc-stats .value { display: block; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .abc-stats .label { display: block; font-size: 0.75rem; color: #64748b; }
    .abc-desc { margin: 0; font-size: 0.875rem; color: #64748b; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .text-right { text-align: right; }
    .sku { font-family: monospace; color: #3b82f6; }
    .class-badge { padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-weight: 600; }
    .class-badge.class-a { background: #d1fae5; color: #065f46; }
    .class-badge.class-b { background: #dbeafe; color: #1e40af; }
    .class-badge.class-c { background: #fef3c7; color: #92400e; }
  `]
})
export class ABCAnalysisComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  loading = signal(true);
  report = signal<ABCAnalysisReport | null>(null);

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.reportsService.getABCAnalysis({}).subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
