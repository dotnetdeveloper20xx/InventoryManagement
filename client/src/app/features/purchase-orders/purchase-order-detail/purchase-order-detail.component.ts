import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchaseOrdersService } from '../purchase-orders.service';
import { PurchaseOrderDetail, POStatus } from '../../../core/models/purchase-order.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, SpinnerComponent, ModalComponent],
  template: `
    <div class="po-detail-page">
      <div class="page-header">
        <div>
          <h1>{{ order()?.poNumber || 'Purchase Order' }}</h1>
          <span class="status-badge" [class]="getStatusClass(order()?.status || '')">{{ order()?.statusName }}</span>
        </div>
        <div class="header-actions">
          <app-button variant="ghost" (clicked)="router.navigate(['/purchase-orders'])">
            ← Back to List
          </app-button>
          <app-button *ngIf="order()?.status === POStatus.Draft" variant="secondary" (clicked)="router.navigate(['/purchase-orders', id, 'edit'])">
            Edit
          </app-button>
          <app-button *ngIf="order()?.status === POStatus.Draft" variant="primary" [loading]="processing()" (clicked)="submitOrder()">
            Submit
          </app-button>
          <app-button *ngIf="order()?.status === POStatus.Submitted" variant="primary" [loading]="processing()" (clicked)="approveOrder()">
            Approve
          </app-button>
          <app-button *ngIf="canReceive()" variant="primary" (clicked)="showReceiveModal.set(true)">
            Receive Items
          </app-button>
          <app-button *ngIf="canCancel()" variant="danger" [loading]="processing()" (clicked)="cancelOrder()">
            Cancel
          </app-button>
        </div>
      </div>

      <app-spinner *ngIf="loading()" message="Loading order..."></app-spinner>

      <div *ngIf="!loading() && order()" class="detail-content">
        <div class="info-grid">
          <app-card title="Order Information">
            <div class="info-rows">
              <div class="info-row">
                <span class="label">Order Number</span>
                <span class="value">{{ order()?.poNumber }}</span>
              </div>
              <div class="info-row">
                <span class="label">Order Date</span>
                <span class="value">{{ order()?.orderDate | date:'mediumDate' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Expected Delivery</span>
                <span class="value">{{ order()?.expectedDeliveryDate ? (order()?.expectedDeliveryDate | date:'mediumDate') : '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Created Date</span>
                <span class="value">{{ order()?.createdDate | date:'mediumDate' }}</span>
              </div>
            </div>
          </app-card>

          <app-card title="Supplier & Warehouse">
            <div class="info-rows">
              <div class="info-row">
                <span class="label">Supplier</span>
                <span class="value">{{ order()?.supplierName }}</span>
              </div>
              <div class="info-row">
                <span class="label">Receiving Warehouse</span>
                <span class="value">{{ order()?.warehouseName }}</span>
              </div>
            </div>
          </app-card>
        </div>

        <app-card title="Line Items">
          <table class="items-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th class="right">Ordered</th>
                <th class="right">Received</th>
                <th class="right">Unit Cost</th>
                <th class="right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of order()?.lineItems">
                <td>{{ item.sku }}</td>
                <td>{{ item.productName }}</td>
                <td class="right">{{ item.quantityOrdered }}</td>
                <td class="right">{{ item.quantityReceived }}</td>
                <td class="right">{{ item.unitCost | currency }}</td>
                <td class="right">{{ item.lineTotal | currency }}</td>
              </tr>
            </tbody>
          </table>

          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ order()?.subtotal | currency }}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>{{ order()?.taxAmount | currency }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>{{ order()?.shippingCost | currency }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ order()?.totalAmount | currency }}</span>
            </div>
          </div>
        </app-card>

        <app-card *ngIf="order()?.notes" title="Notes">
          <p class="notes-text">{{ order()?.notes }}</p>
        </app-card>
      </div>

      <!-- Receive Modal -->
      <app-modal
        [isOpen]="showReceiveModal()"
        title="Receive Items"
        (closed)="showReceiveModal.set(false)"
      >
        <p>This feature allows you to receive items against this purchase order.</p>
        <p>For demo purposes, clicking "Receive All" will mark all items as received.</p>
        <div modal-footer>
          <app-button variant="ghost" (clicked)="showReceiveModal.set(false)">Cancel</app-button>
          <app-button variant="primary" [loading]="processing()" (clicked)="receiveAll()">Receive All</app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .po-detail-page {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      color: #1e293b;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.draft { background-color: #f3f4f6; color: #4b5563; }
    .status-badge.submitted { background-color: #fef3c7; color: #92400e; }
    .status-badge.approved { background-color: #dbeafe; color: #1e40af; }
    .status-badge.ordered { background-color: #e0e7ff; color: #3730a3; }
    .status-badge.partially-received { background-color: #fed7aa; color: #9a3412; }
    .status-badge.received { background-color: #dcfce7; color: #166534; }
    .status-badge.cancelled { background-color: #fee2e2; color: #991b1b; }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
    }

    .info-row .label {
      color: #64748b;
      font-size: 0.875rem;
    }

    .info-row .value {
      font-weight: 500;
      color: #1e293b;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table th,
    .items-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .items-table th {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }

    .items-table .right {
      text-align: right;
    }

    .order-summary {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .summary-row {
      display: flex;
      gap: 2rem;
      font-size: 0.875rem;
    }

    .summary-row span:first-child {
      color: #64748b;
      min-width: 80px;
      text-align: right;
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 1rem;
    }

    .summary-row.total span:first-child {
      color: #1e293b;
    }

    .notes-text {
      margin: 0;
      color: #374151;
      white-space: pre-wrap;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PurchaseOrderDetailComponent implements OnInit {
  @Input() id?: string;

  readonly router = inject(Router);
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);

  order = signal<PurchaseOrderDetail | null>(null);
  loading = signal(true);
  processing = signal(false);
  showReceiveModal = signal(false);

  POStatus = POStatus;

  ngOnInit(): void {
    if (this.id) {
      this.loadOrder(parseInt(this.id, 10));
    }
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.purchaseOrdersService.getPurchaseOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // Mock data for demo
        this.order.set({
          purchaseOrderId: id,
          poNumber: 'PO-2025-0042',
          supplierId: 1,
          supplierName: 'Tech Distributors Inc',
          warehouseId: 1,
          warehouseName: 'Main Warehouse - NYC',
          orderDate: new Date(),
          expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: POStatus.Approved,
          statusName: 'Approved',
          subtotal: 15000,
          taxAmount: 1200,
          shippingCost: 150,
          totalAmount: 16350,
          lineCount: 3,
          createdDate: new Date(),
          notes: 'Rush order - needed by end of week',
          lineItems: [
            { lineItemId: 1, purchaseOrderId: id, productId: 1, productName: 'MacBook Pro 14"', sku: 'LAP-001', quantityOrdered: 5, quantityReceived: 0, unitCost: 1999, lineTotal: 9995 },
            { lineItemId: 2, purchaseOrderId: id, productId: 2, productName: 'Dell XPS 15', sku: 'LAP-002', quantityOrdered: 3, quantityReceived: 0, unitCost: 1499, lineTotal: 4497 },
            { lineItemId: 3, purchaseOrderId: id, productId: 4, productName: 'Logitech MX Master 3', sku: 'ACC-001', quantityOrdered: 10, quantityReceived: 0, unitCost: 99, lineTotal: 990 }
          ]
        });
      }
    });
  }

  canReceive(): boolean {
    const status = this.order()?.status;
    return status === POStatus.Approved || status === POStatus.Ordered || status === POStatus.PartiallyReceived;
  }

  canCancel(): boolean {
    const status = this.order()?.status;
    return status === POStatus.Draft || status === POStatus.Submitted || status === POStatus.Approved;
  }

  submitOrder(): void {
    if (!this.id) return;
    this.processing.set(true);
    this.purchaseOrdersService.submitPurchaseOrder(parseInt(this.id, 10)).subscribe({
      next: () => {
        this.processing.set(false);
        this.loadOrder(parseInt(this.id!, 10));
      },
      error: () => {
        this.processing.set(false);
      }
    });
  }

  approveOrder(): void {
    if (!this.id) return;
    this.processing.set(true);
    this.purchaseOrdersService.approvePurchaseOrder(parseInt(this.id, 10)).subscribe({
      next: () => {
        this.processing.set(false);
        this.loadOrder(parseInt(this.id!, 10));
      },
      error: () => {
        this.processing.set(false);
      }
    });
  }

  receiveAll(): void {
    if (!this.id || !this.order()) return;
    this.processing.set(true);

    const receipt = {
      receiptDate: new Date(),
      lineItems: this.order()!.lineItems.map(li => ({
        lineItemId: li.lineItemId,
        quantityReceived: li.quantityOrdered - li.quantityReceived
      }))
    };

    this.purchaseOrdersService.receivePurchaseOrder(parseInt(this.id, 10), receipt).subscribe({
      next: () => {
        this.processing.set(false);
        this.showReceiveModal.set(false);
        this.loadOrder(parseInt(this.id!, 10));
      },
      error: () => {
        this.processing.set(false);
        this.showReceiveModal.set(false);
      }
    });
  }

  cancelOrder(): void {
    if (!this.id) return;
    this.processing.set(true);
    this.purchaseOrdersService.cancelPurchaseOrder(parseInt(this.id, 10)).subscribe({
      next: () => {
        this.processing.set(false);
        this.loadOrder(parseInt(this.id!, 10));
      },
      error: () => {
        this.processing.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case POStatus.Draft: return 'draft';
      case POStatus.Submitted: return 'submitted';
      case POStatus.Approved: return 'approved';
      case POStatus.Ordered: return 'ordered';
      case POStatus.PartiallyReceived: return 'partially-received';
      case POStatus.Received: return 'received';
      case POStatus.Cancelled: return 'cancelled';
      default: return '';
    }
  }
}
