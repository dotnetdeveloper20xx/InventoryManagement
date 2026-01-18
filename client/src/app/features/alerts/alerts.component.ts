import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AlertsService } from '../../core/services/alerts.service';
import { AlertListItem, AlertSummary, AlertFilter } from '../../core/models/alert.model';

type AlertTab = 'all' | 'lowstock' | 'expiry' | 'overstock' | 'system';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="alerts-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Alert Center</h1>
          <p>Manage and respond to inventory alerts</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="generateAlerts()" [disabled]="generating()">
            {{ generating() ? 'Generating...' : 'Generate Alerts' }}
          </button>
          <button class="btn btn-primary" (click)="acknowledgeSelected()" [disabled]="selectedAlerts().length === 0">
            Acknowledge Selected ({{ selectedAlerts().length }})
          </button>
        </div>
      </div>

      <div class="summary-cards" *ngIf="summary()">
        <div class="summary-card" [class.active]="activeTab() === 'all'" (click)="setTab('all')">
          <span class="count">{{ summary()!.totalAlerts }}</span>
          <span class="label">Total Alerts</span>
        </div>
        <div class="summary-card critical" [class.active]="activeTab() === 'lowstock'" (click)="setTab('lowstock')">
          <span class="count">{{ summary()!.criticalCount }}</span>
          <span class="label">Critical</span>
        </div>
        <div class="summary-card warning" [class.active]="activeTab() === 'expiry'" (click)="setTab('expiry')">
          <span class="count">{{ summary()!.warningCount }}</span>
          <span class="label">Warnings</span>
        </div>
        <div class="summary-card info" [class.active]="activeTab() === 'overstock'" (click)="setTab('overstock')">
          <span class="count">{{ summary()!.infoCount }}</span>
          <span class="label">Info</span>
        </div>
        <div class="summary-card" [class.active]="activeTab() === 'system'" (click)="setTab('system')">
          <span class="count">{{ summary()!.unreadAlerts }}</span>
          <span class="label">Unread</span>
        </div>
      </div>

      <app-spinner *ngIf="loading()" message="Loading alerts..."></app-spinner>

      <app-card *ngIf="!loading()" [title]="'Alerts (' + filteredAlerts().length + ')'">
        <div class="toolbar">
          <div class="search-box">
            <input type="text" placeholder="Search alerts..." [(ngModel)]="searchTerm" (input)="onSearch()">
          </div>
          <div class="filters">
            <select [(ngModel)]="filterSeverity" (change)="applyFilters()">
              <option value="">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>
            <select [(ngModel)]="filterRead" (change)="applyFilters()">
              <option [ngValue]="undefined">All Status</option>
              <option [ngValue]="false">Unread</option>
              <option [ngValue]="true">Read</option>
            </select>
          </div>
        </div>

        <div class="alerts-list" *ngIf="filteredAlerts().length > 0">
          <div class="alert-item" *ngFor="let alert of filteredAlerts()" [class.read]="alert.isRead">
            <div class="alert-checkbox">
              <input type="checkbox" [checked]="isSelected(alert.alertId)" (change)="toggleSelect(alert.alertId)" [disabled]="alert.isRead">
            </div>
            <div class="alert-icon" [class]="'severity-' + alert.severity.toLowerCase()">
              <span *ngIf="alert.alertType === 'LowStock'">📉</span>
              <span *ngIf="alert.alertType === 'Expiry'">⏰</span>
              <span *ngIf="alert.alertType === 'Overstock'">📦</span>
              <span *ngIf="alert.alertType !== 'LowStock' && alert.alertType !== 'Expiry' && alert.alertType !== 'Overstock'">⚙️</span>
            </div>
            <div class="alert-content">
              <div class="alert-header">
                <span class="alert-title">{{ alert.title }}</span>
                <span class="severity-badge" [class]="alert.severity.toLowerCase()">{{ alert.severity }}</span>
              </div>
              <p class="alert-message">{{ alert.message }}</p>
              <div class="alert-meta">
                <span *ngIf="alert.entityReference" class="meta-item">Reference: {{ alert.entityReference }}</span>
                <span class="meta-item">{{ alert.createdDate | date:'short' }}</span>
              </div>
            </div>
            <div class="alert-actions">
              <button *ngIf="!alert.isRead" class="btn-icon" title="Mark as Read" (click)="markAsRead(alert.alertId)">✓</button>
              <button *ngIf="!alert.isRead" class="btn-icon" title="Snooze" (click)="snooze(alert.alertId)">⏸</button>
              <button class="btn-icon" title="Dismiss" (click)="dismiss(alert.alertId)">✕</button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredAlerts().length === 0 && !loading()">
          <p>No alerts found matching your criteria.</p>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .alerts-page { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .header-content h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
    .header-content p { margin: 0.25rem 0 0; color: #64748b; }
    .header-actions { display: flex; gap: 0.75rem; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn-secondary:hover:not(:disabled) { background: #f9fafb; }

    .summary-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s; }
    .summary-card:hover { border-color: #3b82f6; }
    .summary-card.active { border-color: #3b82f6; background: #eff6ff; }
    .summary-card.critical .count { color: #ef4444; }
    .summary-card.warning .count { color: #f59e0b; }
    .summary-card.info .count { color: #3b82f6; }
    .summary-card .count { display: block; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .summary-card .label { display: block; font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }

    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
    .search-box input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; width: 250px; font-size: 0.875rem; }
    .filters { display: flex; gap: 0.5rem; }
    .filters select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }

    .alerts-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .alert-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem; border-left: 4px solid #3b82f6; }
    .alert-item.read { opacity: 0.6; border-left-color: #94a3b8; }
    .alert-checkbox { padding-top: 0.25rem; }
    .alert-icon { width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 1.25rem; }
    .alert-icon.severity-critical { background: #fee2e2; }
    .alert-icon.severity-warning { background: #fef3c7; }
    .alert-icon.severity-info { background: #dbeafe; }
    .alert-content { flex: 1; }
    .alert-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; }
    .alert-title { font-weight: 600; color: #1e293b; }
    .severity-badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.625rem; font-weight: 600; text-transform: uppercase; }
    .severity-badge.critical { background: #fee2e2; color: #991b1b; }
    .severity-badge.warning { background: #fef3c7; color: #92400e; }
    .severity-badge.info { background: #dbeafe; color: #1e40af; }
    .alert-message { margin: 0 0 0.5rem; font-size: 0.875rem; color: #475569; }
    .alert-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #94a3b8; }
    .alert-actions { display: flex; gap: 0.5rem; }
    .btn-icon { width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; }
    .btn-icon:hover { background: #f1f5f9; }

    .empty-state { text-align: center; padding: 3rem; color: #64748b; }

    @media (max-width: 768px) {
      .summary-cards { grid-template-columns: repeat(3, 1fr); }
      .page-header { flex-direction: column; gap: 1rem; }
      .toolbar { flex-direction: column; gap: 1rem; align-items: stretch; }
      .search-box input { width: 100%; }
    }
  `]
})
export class AlertsComponent implements OnInit {
  private readonly alertsService = inject(AlertsService);

  loading = signal(true);
  generating = signal(false);
  alerts = signal<AlertListItem[]>([]);
  summary = signal<AlertSummary | null>(null);
  activeTab = signal<AlertTab>('all');
  selectedIds = signal<Set<number>>(new Set());
  searchTerm = '';
  filterSeverity = '';
  filterRead: boolean | undefined = undefined;

  filteredAlerts = computed(() => {
    let result = this.alerts();
    const tab = this.activeTab();
    const search = this.searchTerm.toLowerCase();

    if (tab === 'lowstock') result = result.filter(a => a.alertType === 'LowStock');
    else if (tab === 'expiry') result = result.filter(a => a.alertType === 'Expiry');
    else if (tab === 'overstock') result = result.filter(a => a.alertType === 'Overstock');
    else if (tab === 'system') result = result.filter(a => !a.isRead);

    if (this.filterSeverity) result = result.filter(a => a.severity === this.filterSeverity);
    if (this.filterRead !== undefined) result = result.filter(a => a.isRead === this.filterRead);

    if (search) {
      result = result.filter(a =>
        a.title.toLowerCase().includes(search) ||
        a.message.toLowerCase().includes(search) ||
        (a.entityReference && a.entityReference.toLowerCase().includes(search))
      );
    }

    return result;
  });

  selectedAlerts = computed(() => {
    return Array.from(this.selectedIds());
  });

  ngOnInit(): void {
    this.loadAlerts();
    this.loadSummary();
  }

  loadAlerts(): void {
    this.loading.set(true);
    this.alertsService.getAlerts({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (data: any) => {
        this.alerts.set(data.items || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadSummary(): void {
    this.alertsService.getSummary().subscribe({
      next: (data: any) => this.summary.set(data)
    });
  }

  setTab(tab: AlertTab): void {
    this.activeTab.set(tab);
  }

  onSearch(): void {
    // Computed signal automatically updates
  }

  applyFilters(): void {
    // Computed signal automatically updates
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelect(id: number): void {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  markAsRead(id: number): void {
    this.alertsService.acknowledge({ alertId: id }).subscribe({
      next: () => {
        this.updateAlertStatus(id, true);
        this.loadSummary();
      }
    });
  }

  acknowledgeSelected(): void {
    const ids = this.selectedAlerts();
    if (ids.length === 0) return;

    this.alertsService.bulkAction({ alertIds: ids, action: 'Acknowledge' }).subscribe({
      next: () => {
        ids.forEach(id => this.updateAlertStatus(id, true));
        this.selectedIds.set(new Set());
        this.loadSummary();
      }
    });
  }

  snooze(id: number): void {
    this.alertsService.snooze({ alertId: id, snoozeMinutes: 60 }).subscribe({
      next: () => {
        this.loadAlerts();
        this.loadSummary();
      }
    });
  }

  dismiss(id: number): void {
    this.alertsService.dismiss(id).subscribe({
      next: () => {
        this.alerts.update(list => list.filter(a => a.alertId !== id));
        this.loadSummary();
      }
    });
  }

  generateAlerts(): void {
    this.generating.set(true);
    this.alertsService.generateAlerts().subscribe({
      next: () => {
        this.generating.set(false);
        this.loadAlerts();
        this.loadSummary();
      },
      error: () => this.generating.set(false)
    });
  }

  private updateAlertStatus(id: number, read: boolean): void {
    this.alerts.update(list => list.map(a =>
      a.alertId === id ? { ...a, isRead: read } : a
    ));
  }
}
