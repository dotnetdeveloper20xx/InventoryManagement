import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WarehousesService } from '../warehouses.service';
import { WarehouseDetail, CreateWarehouse, UpdateWarehouse } from '../../../core/models/warehouse.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SpinnerComponent],
  template: `
    <div class="warehouse-form-page">
      <div class="page-header">
        <h1>{{ isEditMode() ? 'Edit Warehouse' : 'New Warehouse' }}</h1>
        <app-button variant="ghost" (clicked)="router.navigate(['/warehouses'])">
          ← Back to Warehouses
        </app-button>
      </div>

      <app-spinner *ngIf="loading()" message="Loading warehouse..."></app-spinner>

      <form *ngIf="!loading()" #warehouseForm="ngForm" (ngSubmit)="onSubmit(!!warehouseForm.valid)" class="form-container">
        <app-card title="Basic Information">
          <div class="form-grid">
            <div class="form-group">
              <label for="warehouseCode">Warehouse Code *</label>
              <input
                type="text"
                id="warehouseCode"
                name="warehouseCode"
                [(ngModel)]="warehouse.warehouseCode"
                required
                [disabled]="isEditMode()"
              />
            </div>
            <div class="form-group">
              <label for="name">Warehouse Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="warehouse.name"
                required
              />
            </div>
            <div class="form-group">
              <label for="type">Type</label>
              <select id="type" name="type" [(ngModel)]="warehouse.type">
                <option value="Main">Main</option>
                <option value="Distribution">Distribution</option>
                <option value="Returns">Returns</option>
              </select>
            </div>
            <div class="form-group">
              <label for="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                [(ngModel)]="warehouse.phone"
              />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="warehouse.email"
              />
            </div>
            <div class="form-group" *ngIf="isEditMode()">
              <label for="isActive">Status</label>
              <select id="isActive" name="isActive" [(ngModel)]="warehouse.isActive">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Inactive</option>
              </select>
            </div>
          </div>
        </app-card>

        <app-card title="Location">
          <div class="form-grid">
            <div class="form-group">
              <label for="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                [(ngModel)]="warehouse.city"
              />
            </div>
            <div class="form-group">
              <label for="stateProvince">State/Province</label>
              <input
                type="text"
                id="stateProvince"
                name="stateProvince"
                [(ngModel)]="warehouse.stateProvince"
              />
            </div>
            <div class="form-group">
              <label for="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                [(ngModel)]="warehouse.country"
              />
            </div>
          </div>
        </app-card>

        <div class="form-actions">
          <app-button variant="ghost" (clicked)="router.navigate(['/warehouses'])">
            Cancel
          </app-button>
          <app-button type="submit" variant="primary" [loading]="saving()" [disabled]="!warehouseForm.valid">
            {{ isEditMode() ? 'Update Warehouse' : 'Create Warehouse' }}
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .warehouse-form-page {
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

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding-top: 1.5rem;
    }

    .checkbox-label input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
    }
  `]
})
export class WarehouseFormComponent implements OnInit {
  @Input() id?: string;

  readonly router = inject(Router);
  private readonly warehousesService = inject(WarehousesService);

  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);

  warehouse: Partial<WarehouseDetail> = {
    warehouseCode: '',
    name: '',
    city: '',
    stateProvince: '',
    country: 'USA',
    phone: '',
    email: '',
    isActive: true,
    type: 'Main'
  };

  ngOnInit(): void {
    if (this.id && this.id !== 'new') {
      this.isEditMode.set(true);
      this.loadWarehouse(parseInt(this.id, 10));
    }
  }

  loadWarehouse(id: number): void {
    this.loading.set(true);
    this.warehousesService.getWarehouse(id).subscribe({
      next: (warehouse) => {
        this.warehouse = { ...warehouse };
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.warehouse = {
          warehouseId: id,
          warehouseCode: 'WH-NYC',
          name: 'Main Warehouse - NYC',
          city: 'New York',
          stateProvince: 'NY',
          country: 'USA',
          phone: '555-0100',
          email: 'nyc@stockflow.com',
          isActive: true,
          typeName: 'Main',
          totalPalletPositions: 1000
        };
      }
    });
  }

  onSubmit(isValid: boolean | null): void {
    if (!isValid) return;

    this.saving.set(true);

    const operation = this.isEditMode()
      ? this.warehousesService.updateWarehouse(this.warehouse.warehouseId!, this.warehouse as UpdateWarehouse)
      : this.warehousesService.createWarehouse(this.warehouse as CreateWarehouse);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/warehouses']);
      },
      error: () => {
        this.saving.set(false);
        this.router.navigate(['/warehouses']);
      }
    });
  }
}
