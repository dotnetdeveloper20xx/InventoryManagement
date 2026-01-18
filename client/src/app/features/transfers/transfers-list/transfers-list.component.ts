import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TransfersService } from '../../../core/services/transfers.service';
import { Transfer, TransferListItem } from '../../../core/models/transfer.model';

@Component({
  selector: 'app-transfers-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="transfers-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Stock Transfers</h1>
          <p>Move inventory between warehouses</p>
        </div>
        <a routerLink="new" class="btn btn-primary">+ New Transfer</a>
      </div>

      <div class="status-cards">
        <div class="status-card" [class.active]="statusFilter === ''" (click)="setStatusFilter('')">
          <span class="count">{{ transfers().length }}</span>
          <span class="label">All</span>
        </div>
        <div class="status-card pending" [class.active]="statusFilter === 'Pending'" (click)="setStatusFilter('Pending')">
          <span class="count">{{ getStatusCount('Pending') }}</span>
          <span class="label">Pending</span>
        </div>
        <div class="status-card approved" [class.active]="statusFilter === 'Approved'" (click)="setStatusFilter('Approved')">
          <span class="count">{{ getStatusCount('Approved') }}</span>
          <span class="label">Approved</span>
        </div>
        <div class="status-card shipped" [class.active]="statusFilter === 'Shipped'" (click)="setStatusFilter('Shipped')">
          <span class="count">{{ getStatusCount('Shipped') }}</span>
          <span class="label">In Transit</span>
        </div>
        <div class="status-card completed" [class.active]="statusFilter === 'Completed'" (click)="setStatusFilter('Completed')">
          <span class="count">{{ getStatusCount('Completed') }}</span>
          <span class="label">Completed</span>
        </div>
      </div>

      <app-spinner *ngIf="loading()" message="Loading transfers..."></app-spinner>

      <app-card *ngIf="!loading()" title="Transfer Orders">
        <div class="toolbar">
          <div class="search-box">
            <input type="text" placeholder="Search by transfer# or warehouse..." [(ngModel)]="searchTerm" (input)="filterTransfers()">
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Transfer #</th>
                <th>From</th>
                <th>To</th>
                <th>Request Date</th>
                <th class="text-right">Lines</th>
                <th class="text-right">Total Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let transfer of filteredTransfers()">
                <td class="transfer-number">
                  <a [routerLink]="[transfer.transferId]">{{ transfer.transferNumber }}</a>
                </td>
                <td>{{ transfer.sourceWarehouseName }}</td>
                <td>{{ transfer.destinationWarehouseName }}</td>
                <td>{{ transfer.requestDate | date:'mediumDate' }}</td>
                <td class="text-right">{{ transfer.lineCount }}</td>
                <td class="text-right">{{ transfer.totalQuantity }}</td>
                <td>
                  <span class="status-badge" [class]="transfer.status.toLowerCase()">{{ transfer.status }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="[transfer.transferId]" class="btn-icon" title="View">👁</a>
                    <button *ngIf="transfer.status === 'Pending'" class="btn-icon approve" title="Approve" (click)="approveTransfer(transfer.transferId)">✓</button>
                    <button *ngIf="transfer.status === 'Approved'" class="btn-icon ship" title="Ship" (click)="shipTransfer(transfer.transferId)">📦</button>
                    <button *ngIf="transfer.status === 'Shipped'" class="btn-icon receive" title="Receive" (click)="receiveTransfer(transfer.transferId)">📥</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="filteredTransfers().length === 0 && !loading()">
          <p>No transfers found.</p>
          <a routerLink="new" class="btn btn-primary">Create First Transfer</a>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .transfers-page { max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .header-content h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
    .header-content p { margin: 0.25rem 0 0; color: #64748b; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }

    .status-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    .status-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s; }
    .status-card:hover { border-color: #3b82f6; }
    .status-card.active { border-color: #3b82f6; background: #eff6ff; }
    .status-card .count { display: block; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .status-card .label { display: block; font-size: 0.75rem; color: #64748b; }
    .status-card.pending .count { color: #f59e0b; }
    .status-card.approved .count { color: #3b82f6; }
    .status-card.shipped .count { color: #8b5cf6; }
    .status-card.completed .count { color: #10b981; }

    .toolbar { display: flex; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
    .search-box input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; width: 300px; font-size: 0.875rem; }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .text-right { text-align: right; }
    .transfer-number a { color: #3b82f6; text-decoration: none; font-weight: 500; font-family: monospace; }
    .transfer-number a:hover { text-decoration: underline; }

    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.approved { background: #dbeafe; color: #1e40af; }
    .status-badge.shipped { background: #ede9fe; color: #6d28d9; }
    .status-badge.completed { background: #d1fae5; color: #065f46; }
    .status-badge.cancelled { background: #fee2e2; color: #991b1b; }
    .status-badge.rejected { background: #fee2e2; color: #991b1b; }

    .action-buttons { display: flex; gap: 0.5rem; }
    .btn-icon { width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; text-decoration: none; }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-icon.approve:hover { background: #d1fae5; }
    .btn-icon.ship:hover { background: #ede9fe; }
    .btn-icon.receive:hover { background: #dbeafe; }

    .empty-state { text-align: center; padding: 3rem; color: #64748b; }
    .empty-state .btn { margin-top: 1rem; }

    @media (max-width: 768px) {
      .status-cards { grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class TransfersListComponent implements OnInit {
  private readonly transfersService = inject(TransfersService);

  loading = signal(true);
  transfers = signal<TransferListItem[]>([]);
  filteredTransfers = signal<TransferListItem[]>([]);
  searchTerm = '';
  statusFilter = '';

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.loading.set(true);
    this.transfersService.getTransfers({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (data: any) => {
        this.transfers.set(data.items);
        this.filterTransfers();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getStatusCount(status: string): number {
    return this.transfers().filter(t => t.status === status).length;
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.filterTransfers();
  }

  filterTransfers(): void {
    let result = this.transfers();
    const search = this.searchTerm.toLowerCase();

    if (this.statusFilter) {
      result = result.filter(t => t.status === this.statusFilter);
    }

    if (search) {
      result = result.filter(t =>
        t.transferNumber.toLowerCase().includes(search) ||
        t.sourceWarehouseName.toLowerCase().includes(search) ||
        t.destinationWarehouseName.toLowerCase().includes(search)
      );
    }

    this.filteredTransfers.set(result);
  }

  approveTransfer(id: number): void {
    if (confirm('Approve this transfer?')) {
      this.transfersService.approveTransfer(id, { transferId: id }).subscribe({
        next: () => this.loadTransfers()
      });
    }
  }

  shipTransfer(id: number): void {
    if (confirm('Mark this transfer as shipped?')) {
      this.transfersService.shipTransfer(id, { transferId: id, shippedDate: new Date() }).subscribe({
        next: () => this.loadTransfers()
      });
    }
  }

  receiveTransfer(id: number): void {
    if (confirm('Receive this transfer?')) {
      this.transfersService.receiveTransfer(id, { transferId: id, receivedDate: new Date(), lines: [] }).subscribe({
        next: () => this.loadTransfers()
      });
    }
  }
}
