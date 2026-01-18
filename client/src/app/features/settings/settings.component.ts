import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { SettingsService } from '../../core/services/settings.service';
import { SystemSettings, CompanySettings, InventorySettings, AlertSettings, NumberingSettings, NumberSeries } from '../../core/models/settings.model';

type SettingsTab = 'company' | 'inventory' | 'alerts' | 'numbering';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, SpinnerComponent],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>System Settings</h1>
        <p>Configure application preferences and defaults</p>
      </div>

      <app-spinner *ngIf="loading()" message="Loading settings..."></app-spinner>

      <div class="settings-content" *ngIf="!loading() && settings()">
        <div class="tabs">
          <button class="tab" [class.active]="activeTab() === 'company'" (click)="activeTab.set('company')">Company</button>
          <button class="tab" [class.active]="activeTab() === 'inventory'" (click)="activeTab.set('inventory')">Inventory</button>
          <button class="tab" [class.active]="activeTab() === 'alerts'" (click)="activeTab.set('alerts')">Alerts</button>
          <button class="tab" [class.active]="activeTab() === 'numbering'" (click)="activeTab.set('numbering')">Numbering</button>
        </div>

        <!-- Company Settings -->
        <app-card *ngIf="activeTab() === 'company'" title="Company Information">
          <form class="settings-form" (ngSubmit)="saveCompanySettings()">
            <div class="form-row">
              <div class="form-group">
                <label>Company Name</label>
                <input type="text" [(ngModel)]="companySettings.companyName" name="companyName" required>
              </div>
              <div class="form-group">
                <label>Tax ID</label>
                <input type="text" [(ngModel)]="companySettings.taxId" name="taxId">
              </div>
            </div>
            <div class="form-group">
              <label>Address</label>
              <textarea [(ngModel)]="companySettings.address" name="address" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone</label>
                <input type="text" [(ngModel)]="companySettings.phone" name="phone">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="companySettings.email" name="email">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Base Currency</label>
                <select [(ngModel)]="companySettings.baseCurrency" name="baseCurrency">
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              <div class="form-group">
                <label>Fiscal Year Start</label>
                <select [(ngModel)]="companySettings.fiscalYearStartMonth" name="fiscalYearStartMonth">
                  <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save Company Settings' }}
              </button>
            </div>
          </form>
        </app-card>

        <!-- Inventory Settings -->
        <app-card *ngIf="activeTab() === 'inventory'" title="Inventory Configuration">
          <form class="settings-form" (ngSubmit)="saveInventorySettings()">
            <div class="form-row">
              <div class="form-group">
                <label>Default Valuation Method</label>
                <select [(ngModel)]="inventorySettings.defaultValuationMethod" name="valuationMethod">
                  <option value="FIFO">FIFO (First In, First Out)</option>
                  <option value="LIFO">LIFO (Last In, First Out)</option>
                  <option value="Average">Weighted Average</option>
                  <option value="Standard">Standard Cost</option>
                </select>
              </div>
              <div class="form-group">
                <label>Default Picking Strategy</label>
                <select [(ngModel)]="inventorySettings.defaultPickingStrategy" name="pickingStrategy">
                  <option value="FIFO">FIFO</option>
                  <option value="LIFO">LIFO</option>
                  <option value="FEFO">FEFO (First Expired, First Out)</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Adjustment Approval Threshold</label>
                <input type="number" [(ngModel)]="inventorySettings.adjustmentApprovalThreshold" name="adjThreshold" min="0">
              </div>
              <div class="form-group">
                <label>PO Approval Threshold</label>
                <input type="number" [(ngModel)]="inventorySettings.poApprovalThreshold" name="poThreshold" min="0">
              </div>
            </div>
            <div class="form-row checkboxes">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="inventorySettings.allowNegativeStock" name="negativeStock">
                Allow Negative Stock
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="inventorySettings.autoPostMovements" name="autoPost">
                Auto-Post Movements
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="inventorySettings.requireAdjustmentApproval" name="reqAdjApproval">
                Require Adjustment Approval
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="inventorySettings.requireTransferApproval" name="reqTransferApproval">
                Require Transfer Approval
              </label>
            </div>
            <div class="form-row checkboxes">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="inventorySettings.requirePOApproval" name="reqPOApproval">
                Require PO Approval
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="inventorySettings.trackBatchByDefault" name="batchTracking">
                Track Batch by Default
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="inventorySettings.trackExpiryByDefault" name="expiryTracking">
                Track Expiry by Default
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save Inventory Settings' }}
              </button>
            </div>
          </form>
        </app-card>

        <!-- Alert Settings -->
        <app-card *ngIf="activeTab() === 'alerts'" title="Alert Configuration">
          <form class="settings-form" (ngSubmit)="saveAlertSettings()">
            <div class="form-row">
              <div class="form-group">
                <label>Low Stock Threshold (%)</label>
                <input type="number" [(ngModel)]="alertSettings.lowStockThresholdPercent" name="lowStockPercent" min="0" max="100">
              </div>
              <div class="form-group">
                <label>Critical Stock Threshold (%)</label>
                <input type="number" [(ngModel)]="alertSettings.criticalStockThresholdPercent" name="criticalStockPercent" min="0" max="100">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Expiry Warning Days</label>
                <input type="number" [(ngModel)]="alertSettings.expiryWarningDays" name="expiryWarning" min="1" max="365">
              </div>
              <div class="form-group">
                <label>Expiry Alert Days</label>
                <input type="number" [(ngModel)]="alertSettings.expiryAlertDays" name="expiryAlert" min="1" max="365">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Overdue PO Warning Days</label>
                <input type="number" [(ngModel)]="alertSettings.overduePOWarningDays" name="poWarning" min="1" max="90">
              </div>
              <div class="form-group">
                <label>Overdue PO Alert Days</label>
                <input type="number" [(ngModel)]="alertSettings.overduePOAlertDays" name="poAlert" min="1" max="90">
              </div>
            </div>
            <div class="form-row checkboxes">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="alertSettings.emailLowStockAlerts" name="emailLowStock">
                Email Low Stock Alerts
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="alertSettings.emailExpiryAlerts" name="emailExpiry">
                Email Expiry Alerts
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="alertSettings.emailPOAlerts" name="emailPO">
                Email PO Alerts
              </label>
            </div>
            <div class="form-group">
              <label>Alert Email Recipients (comma-separated)</label>
              <input type="text" [(ngModel)]="alertSettings.alertEmailRecipients" name="emailRecipients" placeholder="admin@company.com, inventory@company.com">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save Alert Settings' }}
              </button>
            </div>
          </form>
        </app-card>

        <!-- Numbering Settings -->
        <app-card *ngIf="activeTab() === 'numbering'" title="Document Numbering">
          <div class="settings-form">
            <div class="numbering-section">
              <h4>Purchase Orders</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Prefix</label>
                  <input type="text" [(ngModel)]="numberingSettings.purchaseOrderSeries.prefix" name="poPrefix" maxlength="10">
                </div>
                <div class="form-group">
                  <label>Current Number</label>
                  <input type="number" [(ngModel)]="numberingSettings.purchaseOrderSeries.currentNumber" name="poNumber" min="1">
                </div>
              </div>
            </div>
            <div class="numbering-section">
              <h4>Goods Receipts</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Prefix</label>
                  <input type="text" [(ngModel)]="numberingSettings.goodsReceiptSeries.prefix" name="grPrefix" maxlength="10">
                </div>
                <div class="form-group">
                  <label>Current Number</label>
                  <input type="number" [(ngModel)]="numberingSettings.goodsReceiptSeries.currentNumber" name="grNumber" min="1">
                </div>
              </div>
            </div>
            <div class="numbering-section">
              <h4>Stock Transfers</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Prefix</label>
                  <input type="text" [(ngModel)]="numberingSettings.transferSeries.prefix" name="trPrefix" maxlength="10">
                </div>
                <div class="form-group">
                  <label>Current Number</label>
                  <input type="number" [(ngModel)]="numberingSettings.transferSeries.currentNumber" name="trNumber" min="1">
                </div>
              </div>
            </div>
            <div class="numbering-section">
              <h4>Stock Counts</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Prefix</label>
                  <input type="text" [(ngModel)]="numberingSettings.stockCountSeries.prefix" name="scPrefix" maxlength="10">
                </div>
                <div class="form-group">
                  <label>Current Number</label>
                  <input type="number" [(ngModel)]="numberingSettings.stockCountSeries.currentNumber" name="scNumber" min="1">
                </div>
              </div>
            </div>
            <p class="info-text">Note: Numbering settings are configured on the server and shown here for reference.</p>
          </div>
        </app-card>
      </div>

      <div class="save-notification" *ngIf="saveMessage()" [class.error]="saveError()">
        {{ saveMessage() }}
      </div>
    </div>
  `,
  styles: [`
    .settings-page { max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
    .page-header p { margin: 0.25rem 0 0; color: #64748b; }
    .settings-content { display: flex; flex-direction: column; gap: 1.5rem; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .tab { padding: 0.75rem 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
    .tab:hover { background: #f8fafc; }
    .tab.active { background: #3b82f6; color: white; border-color: #3b82f6; }
    .settings-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .form-row.checkboxes { display: flex; flex-wrap: wrap; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer; }
    .checkbox-label input[type="checkbox"] { width: 1rem; height: 1rem; accent-color: #3b82f6; }
    .numbering-section { padding: 1rem; background: #f8fafc; border-radius: 0.5rem; }
    .numbering-section h4 { margin: 0 0 0.75rem; font-size: 0.875rem; color: #475569; }
    .numbering-section .form-row { margin-bottom: 0; }
    .form-actions { display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid #e2e8f0; }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover:not(:disabled) { background: #2563eb; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .save-notification { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; background: #10b981; color: white; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; }
    .save-notification.error { background: #ef4444; }
    .info-text { margin: 1rem 0 0; font-size: 0.875rem; color: #64748b; font-style: italic; }
    @keyframes slideIn { from { transform: translateY(1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class SettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  loading = signal(true);
  saving = signal(false);
  settings = signal<SystemSettings | null>(null);
  activeTab = signal<SettingsTab>('company');
  saveMessage = signal<string>('');
  saveError = signal(false);

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  private defaultNumberSeries(): NumberSeries {
    return { prefix: '', format: '{prefix}{number:6}', currentNumber: 1001, incrementBy: 1 };
  }

  companySettings: CompanySettings = {
    companyName: '',
    logoUrl: '',
    address: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    baseCurrency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeZone: 'UTC',
    fiscalYearStartMonth: 1
  };

  inventorySettings: InventorySettings = {
    defaultValuationMethod: 'FIFO',
    allowNegativeStock: false,
    autoPostMovements: false,
    requireAdjustmentApproval: false,
    adjustmentApprovalThreshold: 1000,
    requireTransferApproval: false,
    requirePOApproval: false,
    poApprovalThreshold: 5000,
    trackBatchByDefault: false,
    trackExpiryByDefault: false,
    defaultPickingStrategy: 'FIFO'
  };

  alertSettings: AlertSettings = {
    lowStockThresholdPercent: 20,
    criticalStockThresholdPercent: 10,
    expiryWarningDays: 30,
    expiryAlertDays: 7,
    overduePOWarningDays: 7,
    overduePOAlertDays: 14,
    emailLowStockAlerts: true,
    emailExpiryAlerts: true,
    emailPOAlerts: false,
    alertEmailRecipients: ''
  };

  numberingSettings: NumberingSettings = {
    purchaseOrderSeries: this.defaultNumberSeries(),
    goodsReceiptSeries: this.defaultNumberSeries(),
    transferSeries: this.defaultNumberSeries(),
    adjustmentSeries: this.defaultNumberSeries(),
    stockCountSeries: this.defaultNumberSeries(),
    movementSeries: this.defaultNumberSeries(),
    skuGenerationRule: 'AUTO',
    barcodeGenerationRule: 'EAN13'
  };

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.settingsService.getAllSettings().subscribe({
      next: (data: any) => {
        this.settings.set(data);
        if (data.company) this.companySettings = { ...this.companySettings, ...data.company };
        if (data.inventory) this.inventorySettings = { ...this.inventorySettings, ...data.inventory };
        if (data.alerts) this.alertSettings = { ...this.alertSettings, ...data.alerts };
        if (data.numbering) this.numberingSettings = { ...this.numberingSettings, ...data.numbering };
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showMessage('Failed to load settings', true);
      }
    });
  }

  saveCompanySettings(): void {
    this.saving.set(true);
    this.settingsService.updateCompanySettings(this.companySettings as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.showMessage('Company settings saved successfully');
      },
      error: () => {
        this.saving.set(false);
        this.showMessage('Failed to save company settings', true);
      }
    });
  }

  saveInventorySettings(): void {
    this.saving.set(true);
    this.settingsService.updateInventorySettings(this.inventorySettings as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.showMessage('Inventory settings saved successfully');
      },
      error: () => {
        this.saving.set(false);
        this.showMessage('Failed to save inventory settings', true);
      }
    });
  }

  saveAlertSettings(): void {
    this.saving.set(true);
    this.settingsService.updateAlertSettings(this.alertSettings as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.showMessage('Alert settings saved successfully');
      },
      error: () => {
        this.saving.set(false);
        this.showMessage('Failed to save alert settings', true);
      }
    });
  }

  private showMessage(message: string, isError = false): void {
    this.saveMessage.set(message);
    this.saveError.set(isError);
    setTimeout(() => this.saveMessage.set(''), 3000);
  }
}
