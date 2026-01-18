import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ZonesService } from '../../../core/services/zones.service';
import { BinsService } from '../../../core/services/bins.service';
import { WarehousesService } from '../../warehouses/warehouses.service';
import { Zone, ZoneListItem, Bin, BinListItem, BulkCreateBins } from '../../../core/models/zone-bin.model';

@Component({
  selector: 'app-zones-management',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="zones-page">
      <div class="page-header">
        <h1>Zone & Bin Management</h1>
        <p>Configure warehouse zones and storage bins</p>
      </div>

      <div class="warehouse-selector">
        <label>Select Warehouse:</label>
        <select [(ngModel)]="selectedWarehouseId" (change)="onWarehouseChange()">
          <option [ngValue]="0">-- Select a Warehouse --</option>
          <option *ngFor="let w of warehouses()" [ngValue]="w.id">{{ w.name }}</option>
        </select>
      </div>

      <app-spinner *ngIf="loading()" message="Loading zones..."></app-spinner>

      <div class="zones-content" *ngIf="!loading() && selectedWarehouseId > 0">
        <div class="zones-panel">
          <app-card title="Zones">
            <div class="panel-toolbar">
              <button class="btn btn-primary btn-sm" (click)="showZoneForm = true">+ Add Zone</button>
            </div>

            <div class="zone-list">
              <div class="zone-item" *ngFor="let zone of zones()" [class.active]="selectedZone?.zoneId === zone.zoneId" (click)="selectZone(zone)">
                <div class="zone-info">
                  <span class="zone-name">{{ zone.zoneName }}</span>
                  <span class="zone-code">{{ zone.zoneCode }}</span>
                </div>
                <div class="zone-meta">
                  <span class="bin-count">{{ zone.binCount }} bins</span>
                  <span class="zone-type" [class]="zone.zoneType.toLowerCase()">{{ zone.zoneType }}</span>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="zones().length === 0">
              <p>No zones configured for this warehouse.</p>
            </div>
          </app-card>
        </div>

        <div class="bins-panel">
          <app-card [title]="selectedZone ? 'Bins in ' + selectedZone.zoneName : 'Select a Zone'">
            <div class="panel-toolbar" *ngIf="selectedZone">
              <button class="btn btn-secondary btn-sm" (click)="showBinForm = true">+ Add Bin</button>
              <button class="btn btn-secondary btn-sm" (click)="showBulkCreateForm = true">Bulk Create</button>
            </div>

            <div class="bins-grid" *ngIf="selectedZone && bins().length > 0">
              <div class="bin-card" *ngFor="let bin of bins()" [class.occupied]="bin.totalQuantity > 0" [class.inactive]="!bin.isActive">
                <div class="bin-location">{{ bin.fullLocationCode }}</div>
                <div class="bin-capacity">
                  <div class="capacity-bar">
                    <div class="capacity-fill" [style.width.%]="getCapacityPercent(bin)"></div>
                  </div>
                  <span class="capacity-text">{{ bin.totalQuantity }}/{{ bin.productCount }}</span>
                </div>
                <div class="bin-type">{{ bin.binType }}</div>
                <div class="bin-actions">
                  <button class="btn-icon" (click)="editBin(bin)" title="Edit">✏️</button>
                  <button class="btn-icon" (click)="toggleBinActive(bin)" [title]="bin.isActive ? 'Deactivate' : 'Activate'">
                    {{ bin.isActive ? '🔒' : '🔓' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="selectedZone && bins().length === 0">
              <p>No bins in this zone.</p>
              <button class="btn btn-primary" (click)="showBulkCreateForm = true">Create Bins</button>
            </div>

            <div class="empty-state" *ngIf="!selectedZone">
              <p>Select a zone to view its bins.</p>
            </div>
          </app-card>
        </div>
      </div>

      <!-- Zone Form Modal -->
      <div class="modal-overlay" *ngIf="showZoneForm" (click)="showZoneForm = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ editingZone ? 'Edit Zone' : 'Add Zone' }}</h3>
          <form (ngSubmit)="saveZone()">
            <div class="form-group">
              <label>Zone Name *</label>
              <input type="text" [(ngModel)]="zoneForm.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Zone Code *</label>
              <input type="text" [(ngModel)]="zoneForm.code" name="code" required maxlength="10" style="text-transform: uppercase;">
            </div>
            <div class="form-group">
              <label>Zone Type</label>
              <select [(ngModel)]="zoneForm.zoneType" name="zoneType">
                <option value="Storage">Storage</option>
                <option value="Picking">Picking</option>
                <option value="Receiving">Receiving</option>
                <option value="Shipping">Shipping</option>
                <option value="Staging">Staging</option>
                <option value="QC">Quality Control</option>
              </select>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="zoneForm.description" name="description" rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="showZoneForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Bin Form Modal -->
      <div class="modal-overlay" *ngIf="showBinForm" (click)="showBinForm = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ editingBin ? 'Edit Bin' : 'Add Bin' }}</h3>
          <form (ngSubmit)="saveBin()">
            <div class="form-group">
              <label>Bin Location *</label>
              <input type="text" [(ngModel)]="binForm.location" name="location" required placeholder="e.g., A-01-01">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Bin Type</label>
                <select [(ngModel)]="binForm.binType" name="binType">
                  <option value="Standard">Standard</option>
                  <option value="Pallet">Pallet</option>
                  <option value="Shelf">Shelf</option>
                  <option value="Floor">Floor</option>
                  <option value="Bulk">Bulk</option>
                </select>
              </div>
              <div class="form-group">
                <label>Max Capacity</label>
                <input type="number" [(ngModel)]="binForm.maxCapacity" name="maxCapacity" min="1">
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="showBinForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Bulk Create Modal -->
      <div class="modal-overlay" *ngIf="showBulkCreateForm" (click)="showBulkCreateForm = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Bulk Create Bins</h3>
          <form (ngSubmit)="bulkCreateBins()">
            <div class="form-group">
              <label>Location Prefix *</label>
              <input type="text" [(ngModel)]="bulkForm.locationPrefix" name="prefix" required placeholder="e.g., A">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Rows</label>
                <input type="number" [(ngModel)]="bulkForm.rowCount" name="rows" min="1" max="99">
              </div>
              <div class="form-group">
                <label>Columns</label>
                <input type="number" [(ngModel)]="bulkForm.columnCount" name="cols" min="1" max="99">
              </div>
              <div class="form-group">
                <label>Levels</label>
                <input type="number" [(ngModel)]="bulkForm.levelCount" name="levels" min="1" max="10">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Bin Type</label>
                <select [(ngModel)]="bulkForm.binType" name="binType">
                  <option value="Standard">Standard</option>
                  <option value="Pallet">Pallet</option>
                  <option value="Shelf">Shelf</option>
                </select>
              </div>
              <div class="form-group">
                <label>Max Capacity</label>
                <input type="number" [(ngModel)]="bulkForm.maxCapacity" name="maxCapacity" min="1">
              </div>
            </div>
            <div class="preview-text">
              Will create {{ getBulkCount() }} bins ({{ bulkForm.locationPrefix }}-01-01 to {{ bulkForm.locationPrefix }}-{{ padZero(bulkForm.rowCount) }}-{{ padZero(bulkForm.columnCount) }})
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="showBulkCreateForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Create {{ getBulkCount() }} Bins</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .zones-page { max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }

    .warehouse-selector { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding: 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .warehouse-selector label { font-weight: 500; color: #374151; }
    .warehouse-selector select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; min-width: 250px; }

    .zones-content { display: grid; grid-template-columns: 350px 1fr; gap: 1.5rem; }
    .zones-panel, .bins-panel { min-height: 500px; }

    .panel-toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }

    .zone-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .zone-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; }
    .zone-item:hover { border-color: #3b82f6; }
    .zone-item.active { border-color: #3b82f6; background: #eff6ff; }
    .zone-name { font-weight: 600; color: #1e293b; }
    .zone-code { font-family: monospace; color: #64748b; margin-left: 0.5rem; font-size: 0.75rem; }
    .zone-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
    .bin-count { font-size: 0.75rem; color: #64748b; }
    .zone-type { font-size: 0.625rem; padding: 0.125rem 0.375rem; border-radius: 0.25rem; background: #f1f5f9; color: #475569; text-transform: uppercase; }
    .zone-type.storage { background: #dbeafe; color: #1e40af; }
    .zone-type.picking { background: #d1fae5; color: #065f46; }
    .zone-type.receiving { background: #fef3c7; color: #92400e; }
    .zone-type.shipping { background: #ede9fe; color: #6d28d9; }

    .bins-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; }
    .bin-card { padding: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.375rem; text-align: center; }
    .bin-card.occupied { border-color: #3b82f6; background: #f0f9ff; }
    .bin-card.inactive { opacity: 0.5; background: #f1f5f9; }
    .bin-location { font-weight: 600; font-family: monospace; color: #1e293b; margin-bottom: 0.5rem; }
    .bin-capacity { margin-bottom: 0.5rem; }
    .capacity-bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
    .capacity-fill { height: 100%; background: #3b82f6; transition: width 0.3s; }
    .capacity-text { font-size: 0.625rem; color: #64748b; }
    .bin-type { font-size: 0.625rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem; }
    .bin-actions { display: flex; justify-content: center; gap: 0.25rem; }

    .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn-icon { width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; border: none; background: transparent; cursor: pointer; font-size: 0.75rem; border-radius: 0.25rem; }
    .btn-icon:hover { background: #f1f5f9; }

    .empty-state { text-align: center; padding: 2rem; color: #64748b; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 0.5rem; padding: 1.5rem; width: 400px; max-width: 90vw; }
    .modal-content h3 { margin: 0 0 1rem; font-size: 1.125rem; color: #1e293b; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .form-row.three-col { grid-template-columns: repeat(3, 1fr); }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .preview-text { font-size: 0.75rem; color: #64748b; background: #f8fafc; padding: 0.5rem; border-radius: 0.25rem; margin-bottom: 0.5rem; }

    @media (max-width: 900px) {
      .zones-content { grid-template-columns: 1fr; }
    }
  `]
})
export class ZonesManagementComponent implements OnInit {
  private readonly zonesService = inject(ZonesService);
  private readonly binsService = inject(BinsService);
  private readonly warehousesService = inject(WarehousesService);

  loading = signal(true);
  warehouses = signal<any[]>([]);
  zones = signal<ZoneListItem[]>([]);
  bins = signal<BinListItem[]>([]);

  selectedWarehouseId = 0;
  selectedZone: ZoneListItem | null = null;

  showZoneForm = false;
  showBinForm = false;
  showBulkCreateForm = false;
  editingZone: Zone | null = null;
  editingBin: BinListItem | null = null;

  zoneForm = { name: '', code: '', zoneType: 'Storage', description: '' };
  binForm = { location: '', binType: 'Standard', maxCapacity: 100 };
  bulkForm: BulkCreateBins = {
    zoneId: 0,
    locationPrefix: '',
    rowCount: 5,
    columnCount: 5,
    levelCount: 1,
    binType: 'Standard',
    maxCapacity: 100
  };

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.warehousesService.getWarehouses({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (data: any) => {
        this.warehouses.set(data.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onWarehouseChange(): void {
    if (this.selectedWarehouseId > 0) {
      this.loadZones();
    } else {
      this.zones.set([]);
      this.bins.set([]);
      this.selectedZone = null;
    }
  }

  loadZones(): void {
    this.loading.set(true);
    this.zonesService.getZonesByWarehouse(this.selectedWarehouseId).subscribe({
      next: (data: ZoneListItem[]) => {
        this.zones.set(data);
        this.loading.set(false);
        if (this.selectedZone) {
          const updated = data.find(z => z.zoneId === this.selectedZone!.zoneId);
          if (updated) {
            this.selectZone(updated as Zone);
          }
        }
      },
      error: () => this.loading.set(false)
    });
  }

  selectZone(zone: ZoneListItem): void {
    this.selectedZone = zone;
    this.loadBins();
  }

  loadBins(): void {
    if (!this.selectedZone) return;
    this.binsService.getBinsByZone(this.selectedZone.zoneId).subscribe({
      next: (data: BinListItem[]) => this.bins.set(data)
    });
  }

  getCapacityPercent(bin: BinListItem): number {
    if (bin.productCount === 0) return 0;
    return Math.min(100, (bin.totalQuantity / Math.max(1, bin.productCount * 100)) * 100);
  }

  saveZone(): void {
    if (this.editingZone) {
      const updateData = {
        zoneId: this.editingZone.zoneId,
        zoneCode: this.zoneForm.code,
        zoneName: this.zoneForm.name,
        zoneType: this.zoneForm.zoneType,
        description: this.zoneForm.description,
        isActive: this.editingZone.isActive
      };
      this.zonesService.updateZone(this.editingZone.zoneId, updateData).subscribe({
        next: () => {
          this.showZoneForm = false;
          this.editingZone = null;
          this.loadZones();
        }
      });
    } else {
      const createData = {
        zoneCode: this.zoneForm.code,
        zoneName: this.zoneForm.name,
        warehouseId: this.selectedWarehouseId,
        zoneType: this.zoneForm.zoneType,
        description: this.zoneForm.description
      };
      this.zonesService.createZone(createData).subscribe({
        next: () => {
          this.showZoneForm = false;
          this.loadZones();
        }
      });
    }
    this.zoneForm = { name: '', code: '', zoneType: 'Storage', description: '' };
  }

  saveBin(): void {
    if (!this.selectedZone) return;

    if (this.editingBin) {
      const updateData = {
        binId: this.editingBin.binId,
        binCode: this.editingBin.binCode,
        binType: this.binForm.binType,
        status: this.editingBin.status,
        isActive: this.editingBin.isActive,
        maxWeight: this.binForm.maxCapacity
      };
      this.binsService.updateBin(this.editingBin.binId, updateData).subscribe({
        next: () => {
          this.showBinForm = false;
          this.editingBin = null;
          this.loadBins();
        }
      });
    } else {
      const createData = {
        binCode: this.binForm.location,
        zoneId: this.selectedZone.zoneId,
        binType: this.binForm.binType,
        maxWeight: this.binForm.maxCapacity
      };
      this.binsService.createBin(createData).subscribe({
        next: () => {
          this.showBinForm = false;
          this.loadBins();
          this.loadZones(); // Refresh zone bin counts
        }
      });
    }
    this.binForm = { location: '', binType: 'Standard', maxCapacity: 100 };
  }

  editBin(bin: BinListItem): void {
    this.editingBin = bin;
    this.binForm = {
      location: bin.fullLocationCode,
      binType: bin.binType,
      maxCapacity: 100
    };
    this.showBinForm = true;
  }

  toggleBinActive(bin: BinListItem): void {
    this.binsService.updateBin(bin.binId, { binId: bin.binId, binCode: bin.binCode, binType: bin.binType, status: bin.status, isActive: !bin.isActive }).subscribe({
      next: () => this.loadBins()
    });
  }

  getBulkCount(): number {
    return this.bulkForm.rowCount * this.bulkForm.columnCount * this.bulkForm.levelCount;
  }

  padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  bulkCreateBins(): void {
    if (!this.selectedZone) return;

    this.bulkForm.zoneId = this.selectedZone.zoneId;
    this.binsService.bulkCreateBins(this.bulkForm).subscribe({
      next: () => {
        this.showBulkCreateForm = false;
        this.loadBins();
        this.loadZones();
        this.bulkForm = {
          zoneId: 0,
          locationPrefix: '',
          rowCount: 5,
          columnCount: 5,
          levelCount: 1,
          binType: 'Standard',
          maxCapacity: 100
        };
      }
    });
  }
}
