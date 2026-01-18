import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AuditLogsService } from '../../../core/services/audit-logs.service';
import { AuditLogListItem, AuditLogDetail } from '../../../core/models/audit-log.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="audit-logs-page">
      <div class="page-header">
        <h1>Audit Logs</h1>
        <p>Track all system changes and user activities</p>
      </div>

      <app-card title="Filters">
        <div class="filters-row">
          <div class="filter-group">
            <label>Entity Type</label>
            <select [(ngModel)]="filters.entityType" (change)="loadLogs()">
              <option value="">All Types</option>
              <option value="Product">Products</option>
              <option value="Inventory">Inventory</option>
              <option value="PurchaseOrder">Purchase Orders</option>
              <option value="GoodsReceipt">Goods Receipts</option>
              <option value="Transfer">Transfers</option>
              <option value="StockCount">Stock Counts</option>
              <option value="Warehouse">Warehouses</option>
              <option value="Supplier">Suppliers</option>
              <option value="Category">Categories</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Action</label>
            <select [(ngModel)]="filters.action" (change)="loadLogs()">
              <option value="">All Actions</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
              <option value="StatusChange">Status Change</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Date From</label>
            <input type="date" [(ngModel)]="filters.fromDate" (change)="loadLogs()">
          </div>
          <div class="filter-group">
            <label>Date To</label>
            <input type="date" [(ngModel)]="filters.toDate" (change)="loadLogs()">
          </div>
          <div class="filter-group">
            <label>Search</label>
            <input type="text" [(ngModel)]="filters.search" placeholder="Search..." (input)="loadLogs()">
          </div>
        </div>
      </app-card>

      <app-spinner *ngIf="loading()" message="Loading audit logs..."></app-spinner>

      <app-card *ngIf="!loading()" [title]="'Activity Log (' + logs().length + ' entries)'">
        <div class="logs-list">
          <div class="log-item" *ngFor="let log of logs()" (click)="selectLog(log)">
            <div class="log-icon" [class]="getActionClass(log.action)">
              {{ getActionIcon(log.action) }}
            </div>
            <div class="log-content">
              <div class="log-header">
                <span class="log-action">{{ log.action }}</span>
                <span class="log-entity">{{ log.entityType }}</span>
                <span class="log-entity-ref">{{ log.entityReference }}</span>
              </div>
              <p class="log-description">{{ log.summary }}</p>
              <div class="log-meta">
                <span class="log-user">{{ log.userName }}</span>
                <span class="log-date">{{ log.timestamp | date:'medium' }}</span>
              </div>
            </div>
            <div class="log-arrow">→</div>
          </div>
        </div>

        <div class="empty-state" *ngIf="logs().length === 0 && !loading()">
          <p>No audit logs found matching your criteria.</p>
        </div>

        <div class="pagination" *ngIf="logs().length > 0">
          <button class="btn btn-secondary" [disabled]="currentPage === 1" (click)="prevPage()">Previous</button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn btn-secondary" [disabled]="currentPage >= totalPages" (click)="nextPage()">Next</button>
        </div>
      </app-card>

      <!-- Log Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedLog()" (click)="selectedLog.set(null)">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Audit Log Details</h3>
            <button class="btn-close" (click)="selectedLog.set(null)">×</button>
          </div>

          <div class="detail-section" *ngIf="logDetail()">
            <h4>General Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Action</span>
                <span class="value">{{ logDetail()!.action }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Entity Type</span>
                <span class="value">{{ logDetail()!.entityType }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Entity ID</span>
                <span class="value">{{ logDetail()!.entityId }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Reference</span>
                <span class="value">{{ logDetail()!.entityReference }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Timestamp</span>
                <span class="value">{{ logDetail()!.timestamp | date:'full' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">User</span>
                <span class="value">{{ logDetail()!.userName }}</span>
              </div>
              <div class="detail-item" *ngIf="logDetail()!.ipAddress">
                <span class="label">IP Address</span>
                <span class="value">{{ logDetail()!.ipAddress }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="logDetail() && logDetail()!.changes && logDetail()!.changes.length > 0">
            <h4>Field Changes</h4>
            <table class="changes-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let change of logDetail()!.changes">
                  <td class="field-name">{{ change.fieldName }}</td>
                  <td class="old-value">{{ change.oldValue || '-' }}</td>
                  <td class="new-value">{{ change.newValue || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-logs-page { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }

    .filters-row { display: flex; flex-wrap: wrap; gap: 1rem; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; min-width: 150px; }
    .filter-group label { font-size: 0.75rem; font-weight: 500; color: #64748b; }
    .filter-group input, .filter-group select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }

    .logs-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .log-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
    .log-item:hover { background: #f1f5f9; }

    .log-icon { width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 1rem; }
    .log-icon.create { background: #d1fae5; color: #065f46; }
    .log-icon.update { background: #dbeafe; color: #1e40af; }
    .log-icon.delete { background: #fee2e2; color: #991b1b; }
    .log-icon.statuschange { background: #fef3c7; color: #92400e; }

    .log-content { flex: 1; }
    .log-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
    .log-action { font-weight: 600; color: #1e293b; }
    .log-entity { color: #3b82f6; font-size: 0.875rem; }
    .log-entity-ref { font-family: monospace; color: #64748b; font-size: 0.75rem; }
    .log-description { margin: 0 0 0.5rem; font-size: 0.875rem; color: #475569; }
    .log-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #94a3b8; }
    .log-user { font-weight: 500; color: #64748b; }
    .log-arrow { color: #94a3b8; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .page-info { font-size: 0.875rem; color: #64748b; }

    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 0.5rem; width: 700px; max-width: 90vw; max-height: 90vh; overflow-y: auto; }
    .modal-content.large { width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .modal-header h3 { margin: 0; font-size: 1.125rem; color: #1e293b; }
    .btn-close { width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; border: none; background: transparent; font-size: 1.5rem; cursor: pointer; color: #64748b; border-radius: 0.25rem; }
    .btn-close:hover { background: #f1f5f9; }

    .detail-section { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .detail-section:last-child { border-bottom: none; }
    .detail-section h4 { margin: 0 0 0.75rem; font-size: 0.875rem; color: #64748b; text-transform: uppercase; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .detail-item { display: flex; flex-direction: column; gap: 0.125rem; }
    .detail-item .label { font-size: 0.75rem; color: #94a3b8; }
    .detail-item .value { font-size: 0.875rem; color: #1e293b; }

    .changes-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .changes-table th, .changes-table td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .changes-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .field-name { font-weight: 500; }
    .old-value { color: #ef4444; background: #fef2f2; }
    .new-value { color: #10b981; background: #f0fdf4; }

    .empty-state { text-align: center; padding: 3rem; color: #64748b; }

    @media (max-width: 768px) {
      .filters-row { flex-direction: column; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  private readonly auditLogsService = inject(AuditLogsService);

  loading = signal(true);
  logs = signal<AuditLogListItem[]>([]);
  selectedLog = signal<AuditLogListItem | null>(null);
  logDetail = signal<AuditLogDetail | null>(null);

  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  filters = {
    entityType: '',
    action: '',
    fromDate: '',
    toDate: '',
    search: ''
  };

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.auditLogsService.getAuditLogs({
      entityType: this.filters.entityType || undefined,
      action: this.filters.action || undefined,
      fromDate: this.filters.fromDate ? new Date(this.filters.fromDate) : undefined,
      toDate: this.filters.toDate ? new Date(this.filters.toDate) : undefined,
      search: this.filters.search || undefined,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (data: any) => {
        this.logs.set(data.items || []);
        this.totalPages = Math.ceil((data.totalCount || 0) / this.pageSize);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'Create': return '+';
      case 'Update': return '~';
      case 'Delete': return 'x';
      case 'StatusChange': return '*';
      default: return '>';
    }
  }

  getActionClass(action: string): string {
    return action.toLowerCase().replace(' ', '');
  }

  selectLog(log: AuditLogListItem): void {
    this.selectedLog.set(log);
    this.auditLogsService.getAuditLog(log.auditLogId).subscribe({
      next: (detail: any) => this.logDetail.set(detail)
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadLogs();
    }
  }
}
