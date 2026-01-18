import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SuppliersService } from '../suppliers.service';
import { SupplierDetail, CreateSupplier, UpdateSupplier } from '../../../core/models/supplier.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SpinnerComponent],
  template: `
    <div class="supplier-form-page">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Supplier' : 'New Supplier' }}</h1>
        <app-button variant="ghost" (clicked)="router.navigate(['/suppliers'])">
          ← Back to Suppliers
        </app-button>
      </div>

      <app-spinner *ngIf="loading()" message="Loading supplier..."></app-spinner>

      <form *ngIf="!loading()" #supplierForm="ngForm" (ngSubmit)="onSubmit(!!supplierForm.valid)" class="form-container">
        <app-card title="Basic Information">
          <div class="form-grid">
            <div class="form-group">
              <label for="supplierCode">Supplier Code *</label>
              <input
                type="text"
                id="supplierCode"
                name="supplierCode"
                [(ngModel)]="supplier.supplierCode"
                required
                [disabled]="isEditMode()"
              />
            </div>
            <div class="form-group">
              <label for="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                [(ngModel)]="supplier.companyName"
                required
              />
            </div>
            <div class="form-group">
              <label for="primaryContactName">Contact Name</label>
              <input
                type="text"
                id="primaryContactName"
                name="primaryContactName"
                [(ngModel)]="supplier.primaryContactName"
              />
            </div>
            <div class="form-group">
              <label for="primaryContactEmail">Email</label>
              <input
                type="email"
                id="primaryContactEmail"
                name="primaryContactEmail"
                [(ngModel)]="supplier.primaryContactEmail"
              />
            </div>
            <div class="form-group">
              <label for="primaryContactPhone">Phone</label>
              <input
                type="tel"
                id="primaryContactPhone"
                name="primaryContactPhone"
                [(ngModel)]="supplier.primaryContactPhone"
              />
            </div>
            <div class="form-group" *ngIf="isEditMode()">
              <label for="status">Status</label>
              <select id="status" name="status" [(ngModel)]="supplier.status">
                <option value="Active">Active</option>
                <option value="OnHold">On Hold</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </app-card>

        <app-card title="Business Details">
          <div class="form-grid">
            <div class="form-group">
              <label for="currency">Currency</label>
              <select id="currency" name="currency" [(ngModel)]="supplier.currency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div class="form-group">
              <label for="defaultLeadTimeDays">Lead Time (Days)</label>
              <input
                type="number"
                id="defaultLeadTimeDays"
                name="defaultLeadTimeDays"
                [(ngModel)]="supplier.defaultLeadTimeDays"
                min="0"
              />
            </div>
          </div>
        </app-card>

        <app-card title="Location">
          <div class="form-grid">
            <div class="form-group">
              <label for="billingCity">City</label>
              <input
                type="text"
                id="billingCity"
                name="billingCity"
                [(ngModel)]="supplier.billingCity"
              />
            </div>
            <div class="form-group">
              <label for="billingCountry">Country</label>
              <input
                type="text"
                id="billingCountry"
                name="billingCountry"
                [(ngModel)]="supplier.billingCountry"
              />
            </div>
          </div>
        </app-card>

        <div class="form-actions">
          <app-button variant="ghost" (clicked)="router.navigate(['/suppliers'])">
            Cancel
          </app-button>
          <app-button type="submit" variant="primary" [loading]="saving()" [disabled]="!supplierForm.valid">
            {{ isEditMode() ? 'Update Supplier' : 'Create Supplier' }}
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .supplier-form-page {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      color: #1e293b;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group input:disabled {
      background-color: #f1f5f9;
      cursor: not-allowed;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
    }
  `]
})
export class SupplierFormComponent implements OnInit {
  @Input() id?: string;

  readonly router = inject(Router);
  private readonly suppliersService = inject(SuppliersService);

  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);

  supplier: Partial<SupplierDetail> = {
    supplierCode: '',
    companyName: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    billingCity: '',
    billingCountry: 'USA',
    currency: 'USD',
    defaultLeadTimeDays: undefined,
    status: 'Active'
  };

  ngOnInit(): void {
    if (this.id && this.id !== 'new') {
      this.isEditMode.set(true);
      this.loadSupplier(parseInt(this.id, 10));
    }
  }

  loadSupplier(id: number): void {
    this.loading.set(true);
    this.suppliersService.getSupplier(id).subscribe({
      next: (supplier) => {
        this.supplier = { ...supplier };
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.supplier = {
          supplierId: id,
          supplierCode: 'SUP-001',
          companyName: 'Tech Distributors Inc',
          primaryContactName: 'John Smith',
          primaryContactEmail: 'john@techdist.com',
          primaryContactPhone: '555-0101',
          billingCity: 'San Jose',
          billingCountry: 'USA',
          currency: 'USD',
          defaultLeadTimeDays: 5,
          status: 'Active'
        };
      }
    });
  }

  onSubmit(isValid: boolean | null): void {
    if (!isValid) return;

    this.saving.set(true);

    const operation = this.isEditMode()
      ? this.suppliersService.updateSupplier(this.supplier.supplierId!, this.supplier as UpdateSupplier)
      : this.suppliersService.createSupplier(this.supplier as CreateSupplier);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/suppliers']);
      },
      error: () => {
        this.saving.set(false);
        this.router.navigate(['/suppliers']);
      }
    });
  }
}
