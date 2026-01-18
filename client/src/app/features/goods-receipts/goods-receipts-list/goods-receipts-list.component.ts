import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { GoodsReceiptsService } from '../../../core/services/goods-receipts.service';
import { GoodsReceiptListItem } from '../../../core/models/goods-receipt.model';

@Component({
  selector: 'app-goods-receipts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="grn-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Goods Receipts</h1>
          <p>Receive inventory from purchase orders</p>
        </div>
        <a routerLink="new" class="btn btn-primary">+ New Receipt</a>
      </div>

      <app-spinner *ngIf="loading()" message="Loading receipts..."></app-spinner>

      <app-card *ngIf="!loading()" title="Recent Goods Receipts">
        <div class="toolbar">
          <div class="search-box">
            <input type="text" placeholder="Search by GRN# or PO#..." [(ngModel)]="searchTerm" (input)="filterReceipts()">
          </div>
          <div class="filters">
            <select [(ngModel)]="statusFilter" (change)="filterReceipts()">
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Posted">Posted</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>GRN #</th>
                <th>PO #</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Receipt Date</th>
                <th class="text-right">Lines</th>
                <th class="text-right">Total Qty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let grn of filteredReceipts()">
                <td class="grn-number">
                  <a [routerLink]="[grn.goodsReceiptId]">{{ grn.grnNumber }}</a>
                </td>
                <td>{{ grn.poNumber || '-' }}</td>
                <td>{{ grn.supplierName }}</td>
                <td>{{ grn.warehouseName }}</td>
                <td>{{ grn.receiptDate | date:'mediumDate' }}</td>
                <td class="text-right">{{ grn.lineCount }}</td>
                <td class="text-right">{{ grn.totalValue | currency }}</td>
                <td>
                  <span class="status-badge" [class]="grn.status.toLowerCase()">{{ grn.status }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="[grn.goodsReceiptId]" class="btn-icon" title="View">👁</a>
                    <button *ngIf="grn.status === 'Draft'" class="btn-icon" title="Post" (click)="postReceipt(grn.goodsReceiptId)">✓</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="filteredReceipts().length === 0 && !loading()">
          <p>No goods receipts found.</p>
          <a routerLink="new" class="btn btn-primary">Create First Receipt</a>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .grn-page { max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .header-content h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
    .header-content p { margin: 0.25rem 0 0; color: #64748b; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }

    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
    .search-box input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; width: 280px; font-size: 0.875rem; }
    .filters select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .text-right { text-align: right; }
    .grn-number a { color: #3b82f6; text-decoration: none; font-weight: 500; font-family: monospace; }
    .grn-number a:hover { text-decoration: underline; }

    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.draft { background: #fef3c7; color: #92400e; }
    .status-badge.posted { background: #d1fae5; color: #065f46; }
    .status-badge.cancelled { background: #fee2e2; color: #991b1b; }

    .action-buttons { display: flex; gap: 0.5rem; }
    .btn-icon { width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; text-decoration: none; }
    .btn-icon:hover { background: #f1f5f9; }

    .empty-state { text-align: center; padding: 3rem; color: #64748b; }
    .empty-state .btn { margin-top: 1rem; }
  `]
})
export class GoodsReceiptsListComponent implements OnInit {
  private readonly goodsReceiptsService = inject(GoodsReceiptsService);

  loading = signal(true);
  receipts = signal<GoodsReceiptListItem[]>([]);
  filteredReceipts = signal<GoodsReceiptListItem[]>([]);
  searchTerm = '';
  statusFilter = '';

  ngOnInit(): void {
    this.loadReceipts();
  }

  loadReceipts(): void {
    this.loading.set(true);
    this.goodsReceiptsService.getGoodsReceipts({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (data: any) => {
        this.receipts.set(data.items);
        this.filteredReceipts.set(data.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterReceipts(): void {
    let result = this.receipts();
    const search = this.searchTerm.toLowerCase();

    if (search) {
      result = result.filter(r =>
        r.grnNumber.toLowerCase().includes(search) ||
        (r.poNumber && r.poNumber.toLowerCase().includes(search)) ||
        r.supplierName.toLowerCase().includes(search)
      );
    }

    if (this.statusFilter) {
      result = result.filter(r => r.status === this.statusFilter);
    }

    this.filteredReceipts.set(result);
  }

  postReceipt(id: number): void {
    if (confirm('Are you sure you want to post this goods receipt? This will update inventory levels.')) {
      this.goodsReceiptsService.postGoodsReceipt(id).subscribe({
        next: () => this.loadReceipts()
      });
    }
  }
}
