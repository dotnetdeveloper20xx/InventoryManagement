import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TransfersService } from '../../../core/services/transfers.service';
import { Transfer } from '../../../core/models/transfer.model';

@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div class="transfer-detail-page">
      <div class="page-header">
        <a routerLink="/transfers" class="back-link">← Back to Transfers</a>
        <div class="header-row">
          <div class="header-content">
            <h1>{{ transfer()?.transferNumber }}</h1>
            <span class="status-badge" [class]="transfer()?.status?.toLowerCase()">{{ transfer()?.status }}</span>
          </div>
          <div class="header-actions">
            <button *ngIf="transfer()?.status === 'Pending'" class="btn btn-success" (click)="approve()" [disabled]="processing()">Approve</button>
            <button *ngIf="transfer()?.status === 'Pending'" class="btn btn-danger" (click)="reject()" [disabled]="processing()">Reject</button>
            <button *ngIf="transfer()?.status === 'Approved'" class="btn btn-primary" (click)="ship()" [disabled]="processing()">Mark as Shipped</button>
            <button *ngIf="transfer()?.status === 'Shipped'" class="btn btn-success" (click)="receive()" [disabled]="processing()">Receive</button>
            <button *ngIf="canCancel()" class="btn btn-secondary" (click)="cancel()" [disabled]="processing()">Cancel</button>
          </div>
        </div>
      </div>

      <app-spinner *ngIf="loading()" message="Loading transfer..."></app-spinner>

      <div class="detail-content" *ngIf="!loading() && transfer()">
        <div class="transfer-flow">
          <div class="flow-step" [class.completed]="isStepCompleted('created')">
            <div class="step-icon">📝</div>
            <div class="step-label">Created</div>
            <div class="step-date">{{ transfer()!.requestDate | date:'shortDate' }}</div>
          </div>
          <div class="flow-connector" [class.active]="isStepCompleted('approved')"></div>
          <div class="flow-step" [class.completed]="isStepCompleted('approved')" [class.rejected]="transfer()!.status === 'Rejected'">
            <div class="step-icon">{{ transfer()!.status === 'Rejected' ? '✕' : '✓' }}</div>
            <div class="step-label">{{ transfer()!.status === 'Rejected' ? 'Rejected' : 'Approved' }}</div>
            <div class="step-date" *ngIf="transfer()!.approvedDate">{{ transfer()!.approvedDate | date:'shortDate' }}</div>
          </div>
          <div class="flow-connector" [class.active]="isStepCompleted('shipped')"></div>
          <div class="flow-step" [class.completed]="isStepCompleted('shipped')">
            <div class="step-icon">📦</div>
            <div class="step-label">Shipped</div>
            <div class="step-date" *ngIf="transfer()!.shippedDate">{{ transfer()!.shippedDate | date:'shortDate' }}</div>
          </div>
          <div class="flow-connector" [class.active]="isStepCompleted('completed')"></div>
          <div class="flow-step" [class.completed]="isStepCompleted('completed')">
            <div class="step-icon">📥</div>
            <div class="step-label">Received</div>
            <div class="step-date" *ngIf="transfer()!.receivedDate">{{ transfer()!.receivedDate | date:'shortDate' }}</div>
          </div>
        </div>

        <div class="info-grid">
          <app-card title="Source">
            <div class="warehouse-info">
              <div class="warehouse-name">{{ transfer()!.sourceWarehouseName }}</div>
              <div class="warehouse-label">From Warehouse</div>
            </div>
          </app-card>
          <app-card title="Destination">
            <div class="warehouse-info">
              <div class="warehouse-name">{{ transfer()!.destinationWarehouseName }}</div>
              <div class="warehouse-label">To Warehouse</div>
            </div>
          </app-card>
        </div>

        <app-card title="Transfer Lines">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>From Bin</th>
                  <th>To Bin</th>
                  <th class="text-right">Requested</th>
                  <th class="text-right">Shipped</th>
                  <th class="text-right">Received</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let line of transfer()!.lines">
                  <td class="sku">{{ line.productSKU }}</td>
                  <td>{{ line.productName }}</td>
                  <td>{{ line.sourceBinCode || '-' }}</td>
                  <td>{{ line.destinationBinCode || '-' }}</td>
                  <td class="text-right">{{ line.requestedQuantity }}</td>
                  <td class="text-right">{{ line.shippedQuantity ?? '-' }}</td>
                  <td class="text-right" [class.variance]="line.receivedQuantity !== null && line.receivedQuantity !== line.requestedQuantity">
                    {{ line.receivedQuantity ?? '-' }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4"><strong>Totals</strong></td>
                  <td class="text-right"><strong>{{ getRequestedTotal() }}</strong></td>
                  <td class="text-right"><strong>{{ getShippedTotal() }}</strong></td>
                  <td class="text-right"><strong>{{ getReceivedTotal() }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </app-card>

        <div class="info-grid" *ngIf="transfer()!.notes || transfer()!.approvedBy">
          <app-card *ngIf="transfer()!.notes" title="Notes">
            <p class="notes-text">{{ transfer()!.notes }}</p>
          </app-card>
          <app-card title="Audit Trail">
            <div class="audit-list">
              <div class="audit-item">
                <span class="audit-action">Created by</span>
                <span class="audit-user">{{ transfer()!.requestedBy || 'System' }}</span>
                <span class="audit-date">{{ transfer()!.requestDate | date:'medium' }}</span>
              </div>
              <div class="audit-item" *ngIf="transfer()!.approvedBy">
                <span class="audit-action">{{ transfer()!.status === 'Rejected' ? 'Rejected by' : 'Approved by' }}</span>
                <span class="audit-user">{{ transfer()!.approvedBy }}</span>
                <span class="audit-date">{{ transfer()!.approvedDate | date:'medium' }}</span>
              </div>
              <div class="audit-item" *ngIf="transfer()!.shippedDate">
                <span class="audit-action">Shipped</span>
                <span class="audit-date">{{ transfer()!.shippedDate | date:'medium' }}</span>
              </div>
              <div class="audit-item" *ngIf="transfer()!.receivedDate">
                <span class="audit-action">Received</span>
                <span class="audit-date">{{ transfer()!.receivedDate | date:'medium' }}</span>
              </div>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transfer-detail-page { max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
    .header-content { display: flex; align-items: center; gap: 1rem; }
    .header-content h1 { margin: 0; font-size: 1.75rem; color: #1e293b; font-family: monospace; }
    .header-actions { display: flex; gap: 0.5rem; }

    .status-badge { padding: 0.375rem 1rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.approved { background: #dbeafe; color: #1e40af; }
    .status-badge.shipped { background: #ede9fe; color: #6d28d9; }
    .status-badge.completed { background: #d1fae5; color: #065f46; }
    .status-badge.rejected, .status-badge.cancelled { background: #fee2e2; color: #991b1b; }

    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-success { background: #10b981; color: white; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn:hover:not(:disabled) { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .detail-content { display: flex; flex-direction: column; gap: 1.5rem; }

    .transfer-flow { display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .flow-step { text-align: center; padding: 0 1rem; }
    .flow-step .step-icon { width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 50%; font-size: 1.25rem; margin: 0 auto 0.5rem; }
    .flow-step.completed .step-icon { background: #d1fae5; }
    .flow-step.rejected .step-icon { background: #fee2e2; }
    .flow-step .step-label { font-size: 0.875rem; font-weight: 500; color: #475569; }
    .flow-step .step-date { font-size: 0.75rem; color: #94a3b8; }
    .flow-connector { width: 60px; height: 2px; background: #e2e8f0; }
    .flow-connector.active { background: #10b981; }

    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .warehouse-info { text-align: center; padding: 1rem; }
    .warehouse-name { font-size: 1.25rem; font-weight: 600; color: #1e293b; }
    .warehouse-label { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .data-table tfoot td { border-top: 2px solid #e2e8f0; background: #f8fafc; }
    .text-right { text-align: right; }
    .sku { font-family: monospace; color: #3b82f6; }
    .variance { color: #f59e0b; font-weight: 600; }

    .notes-text { margin: 0; color: #475569; white-space: pre-wrap; }

    .audit-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .audit-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .audit-action { color: #64748b; }
    .audit-user { font-weight: 500; color: #1e293b; }
    .audit-date { color: #94a3b8; font-size: 0.75rem; margin-left: auto; }

    @media (max-width: 768px) {
      .info-grid { grid-template-columns: 1fr; }
      .header-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .transfer-flow { flex-wrap: wrap; gap: 0.5rem; }
      .flow-connector { display: none; }
    }
  `]
})
export class TransferDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transfersService = inject(TransfersService);

  loading = signal(true);
  processing = signal(false);
  transfer = signal<Transfer | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadTransfer(id);
    }
  }

  loadTransfer(id: number): void {
    this.loading.set(true);
    this.transfersService.getTransfer(id).subscribe({
      next: (data: any) => {
        this.transfer.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/transfers']);
      }
    });
  }

  isStepCompleted(step: string): boolean {
    const t = this.transfer();
    if (!t) return false;

    const statusOrder = ['Pending', 'Approved', 'Shipped', 'Completed'];
    const stepMap: Record<string, number> = {
      'created': 0,
      'approved': 1,
      'shipped': 2,
      'completed': 3
    };

    const currentIndex = statusOrder.indexOf(t.status);
    return currentIndex >= stepMap[step];
  }

  canCancel(): boolean {
    const status = this.transfer()?.status;
    return status === 'Pending' || status === 'Approved';
  }

  getRequestedTotal(): number {
    const t = this.transfer();
    if (!t) return 0;
    return t.lines.reduce((sum: number, l: any) => sum + (l.requestedQuantity || 0), 0);
  }

  getShippedTotal(): string {
    const t = this.transfer();
    if (!t) return '-';
    const total = t.lines.reduce((sum: number, l: any) => sum + (l.shippedQuantity || 0), 0);
    return total > 0 ? total.toString() : '-';
  }

  getReceivedTotal(): string {
    const t = this.transfer();
    if (!t) return '-';
    const total = t.lines.reduce((sum: number, l: any) => sum + (l.receivedQuantity || 0), 0);
    return total > 0 ? total.toString() : '-';
  }

  approve(): void {
    const t = this.transfer();
    if (!t) return;

    if (confirm('Approve this transfer?')) {
      this.processing.set(true);
      this.transfersService.approveTransfer(t.transferId, { transferId: t.transferId }).subscribe({
        next: () => {
          this.processing.set(false);
          this.loadTransfer(t.transferId);
        },
        error: () => this.processing.set(false)
      });
    }
  }

  reject(): void {
    const t = this.transfer();
    if (!t) return;

    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      this.processing.set(true);
      this.transfersService.rejectTransfer(t.transferId, reason).subscribe({
        next: () => {
          this.processing.set(false);
          this.loadTransfer(t.transferId);
        },
        error: () => this.processing.set(false)
      });
    }
  }

  ship(): void {
    const t = this.transfer();
    if (!t) return;

    if (confirm('Mark this transfer as shipped?')) {
      this.processing.set(true);
      this.transfersService.shipTransfer(t.transferId, {
        transferId: t.transferId,
        shippedDate: new Date()
      }).subscribe({
        next: () => {
          this.processing.set(false);
          this.loadTransfer(t.transferId);
        },
        error: () => this.processing.set(false)
      });
    }
  }

  receive(): void {
    const t = this.transfer();
    if (!t) return;

    if (confirm('Receive this transfer? All quantities will be marked as fully received.')) {
      this.processing.set(true);
      this.transfersService.receiveTransfer(t.transferId, {
        transferId: t.transferId,
        receivedDate: new Date(),
        lines: t.lines.map(l => ({ transferLineId: l.transferLineId, receivedQuantity: l.approvedQuantity || l.requestedQuantity }))
      }).subscribe({
        next: () => {
          this.processing.set(false);
          this.loadTransfer(t.transferId);
        },
        error: () => this.processing.set(false)
      });
    }
  }

  cancel(): void {
    const t = this.transfer();
    if (!t) return;

    const reason = prompt('Please provide a reason for cancellation:');
    if (reason !== null) {
      this.processing.set(true);
      this.transfersService.cancelTransfer(t.transferId, reason).subscribe({
        next: () => {
          this.processing.set(false);
          this.loadTransfer(t.transferId);
        },
        error: () => this.processing.set(false)
      });
    }
  }
}
