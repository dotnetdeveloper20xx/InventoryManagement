import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { StockCountsService } from '../../../core/services/stock-counts.service';
import { WarehousesService } from '../../warehouses/warehouses.service';
import { ZonesService } from '../../../core/services/zones.service';
import { CategoriesService } from '../../categories/categories.service';
import { CreateStockCount } from '../../../core/models/stock-count.model';

@Component({
  selector: 'app-stock-count-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="stock-count-form-page">
      <div class="page-header">
        <a routerLink="/stock-counts" class="back-link">← Back to Stock Counts</a>
        <h1>New Stock Count</h1>
        <p>Create a new physical inventory count</p>
      </div>

      <app-spinner *ngIf="loading()" message="Loading..."></app-spinner>

      <div class="form-content" *ngIf="!loading()">
        <app-card title="Count Configuration">
          <form class="count-form" (ngSubmit)="createCount()">
            <div class="form-row">
              <div class="form-group">
                <label>Count Type *</label>
                <select [(ngModel)]="formData.countType" name="countType" required>
                  <option value="Full">Full Count - All products in warehouse</option>
                  <option value="Cycle">Cycle Count - Selected products/zones</option>
                  <option value="Spot">Spot Check - Quick verification</option>
                </select>
              </div>
              <div class="form-group">
                <label>Count Date *</label>
                <input type="date" [(ngModel)]="formData.countDate" name="countDate" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Warehouse *</label>
                <select [(ngModel)]="formData.warehouseId" name="warehouseId" required (change)="onWarehouseChange()">
                  <option [ngValue]="0">Select Warehouse</option>
                  <option *ngFor="let w of warehouses()" [ngValue]="w.id">{{ w.name }}</option>
                </select>
              </div>
              <div class="form-group" *ngIf="formData.countType !== 'Full'">
                <label>Zone (Optional)</label>
                <select [(ngModel)]="formData.zoneId" name="zoneId">
                  <option [ngValue]="undefined">All Zones</option>
                  <option *ngFor="let z of zones()" [ngValue]="z.id">{{ z.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-row" *ngIf="formData.countType !== 'Full'">
              <div class="form-group">
                <label>Category Filter (Optional)</label>
                <select [(ngModel)]="formData.categoryId" name="categoryId">
                  <option [ngValue]="undefined">All Categories</option>
                  <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>ABC Classification (Optional)</label>
                <select [(ngModel)]="formData.abcClassification" name="abcClassification">
                  <option value="">All Classifications</option>
                  <option value="A">Class A - High Value</option>
                  <option value="B">Class B - Medium Value</option>
                  <option value="C">Class C - Low Value</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="formData.notes" name="notes" rows="3" placeholder="Any additional notes about this count..."></textarea>
            </div>

            <div class="count-preview" *ngIf="formData.warehouseId > 0">
              <h4>Count Preview</h4>
              <div class="preview-stats">
                <div class="preview-stat">
                  <span class="value">{{ estimatedItems() }}</span>
                  <span class="label">Estimated Items</span>
                </div>
                <div class="preview-stat">
                  <span class="value">{{ estimatedDuration() }}</span>
                  <span class="label">Estimated Duration</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <a routerLink="/stock-counts" class="btn btn-secondary">Cancel</a>
              <button type="submit" class="btn btn-primary" [disabled]="!canCreate() || saving()">
                {{ saving() ? 'Creating...' : 'Create Stock Count' }}
              </button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    .stock-count-form-page { max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0.5rem 0 0; font-size: 1.75rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    .back-link { color: #3b82f6; text-decoration: none; font-size: 0.875rem; }

    .count-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

    .count-preview { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; }
    .count-preview h4 { margin: 0 0 0.75rem; font-size: 0.875rem; color: #475569; }
    .preview-stats { display: flex; gap: 2rem; }
    .preview-stat { text-align: center; }
    .preview-stat .value { display: block; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .preview-stat .label { display: block; font-size: 0.75rem; color: #64748b; }

    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn:hover:not(:disabled) { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class StockCountFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly stockCountsService = inject(StockCountsService);
  private readonly warehousesService = inject(WarehousesService);
  private readonly zonesService = inject(ZonesService);
  private readonly categoriesService = inject(CategoriesService);

  loading = signal(true);
  saving = signal(false);
  warehouses = signal<any[]>([]);
  zones = signal<any[]>([]);
  categories = signal<any[]>([]);

  formData: any = {
    warehouseId: 0,
    countType: 'Cycle',
    countDate: new Date().toISOString().split('T')[0],
    zoneId: undefined,
    categoryId: undefined,
    abcClassification: '',
    notes: ''
  };

  ngOnInit(): void {
    this.loadReferenceData();
  }

  loadReferenceData(): void {
    Promise.all([
      this.warehousesService.getWarehouses({ pageNumber: 1, pageSize: 100 }).toPromise(),
      this.categoriesService.getCategories({ pageNumber: 1, pageSize: 100 }).toPromise()
    ]).then(([warehouses, categories]: any) => {
      this.warehouses.set(warehouses?.items || []);
      this.categories.set(categories?.items || []);
      this.loading.set(false);
    }).catch(() => this.loading.set(false));
  }

  onWarehouseChange(): void {
    if (this.formData.warehouseId > 0) {
      this.zonesService.getZonesByWarehouse(this.formData.warehouseId).subscribe({
        next: (data: any) => this.zones.set(data)
      });
    } else {
      this.zones.set([]);
    }
  }

  estimatedItems(): number {
    // In real app would call API to get actual count
    if (this.formData.countType === 'Full') return 500;
    if (this.formData.countType === 'Cycle') return 150;
    return 25;
  }

  estimatedDuration(): string {
    const items = this.estimatedItems();
    const hours = Math.ceil(items / 50); // Assume 50 items per hour
    if (hours < 1) return '< 1 hour';
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
  }

  canCreate(): boolean {
    return this.formData.warehouseId > 0 && !!this.formData.countDate;
  }

  createCount(): void {
    if (!this.canCreate()) return;
    this.saving.set(true);
    this.stockCountsService.createStockCount(this.formData as any).subscribe({
      next: (result: any) => {
        this.saving.set(false);
        this.router.navigate(['/stock-counts', result.stockCountId, 'count']);
      },
      error: () => this.saving.set(false)
    });
  }
}
