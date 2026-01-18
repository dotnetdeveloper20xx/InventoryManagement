namespace StockFlowPro.Application.DTOs.Settings;

public class SystemSettingsDto
{
    public CompanySettingsDto Company { get; set; } = new();
    public InventorySettingsDto Inventory { get; set; } = new();
    public AlertSettingsDto Alerts { get; set; } = new();
    public NumberingSettingsDto Numbering { get; set; } = new();
}

public class CompanySettingsDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? StateProvince { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? TaxId { get; set; }
    public string BaseCurrency { get; set; } = "USD";
    public string DateFormat { get; set; } = "MM/dd/yyyy";
    public string TimeZone { get; set; } = "UTC";
    public int FiscalYearStartMonth { get; set; } = 1;
}

public class InventorySettingsDto
{
    public string DefaultValuationMethod { get; set; } = "FIFO";
    public bool AllowNegativeStock { get; set; }
    public bool AutoPostMovements { get; set; } = true;
    public bool RequireAdjustmentApproval { get; set; } = true;
    public decimal AdjustmentApprovalThreshold { get; set; } = 1000;
    public bool RequireTransferApproval { get; set; } = true;
    public bool RequirePOApproval { get; set; } = true;
    public decimal POApprovalThreshold { get; set; } = 5000;
    public bool TrackBatchByDefault { get; set; }
    public bool TrackExpiryByDefault { get; set; }
    public string DefaultPickingStrategy { get; set; } = "FIFO";
}

public class AlertSettingsDto
{
    public int LowStockThresholdPercent { get; set; } = 25;
    public int CriticalStockThresholdPercent { get; set; } = 10;
    public int ExpiryWarningDays { get; set; } = 30;
    public int ExpiryAlertDays { get; set; } = 7;
    public int OverduePOWarningDays { get; set; } = 3;
    public int OverduePOAlertDays { get; set; } = 7;
    public bool EmailLowStockAlerts { get; set; }
    public bool EmailExpiryAlerts { get; set; }
    public bool EmailPOAlerts { get; set; }
    public string? AlertEmailRecipients { get; set; }
}

public class NumberingSettingsDto
{
    public NumberSeriesDto PurchaseOrderSeries { get; set; } = new() { Prefix = "PO", Format = "PO-{YYYY}-{#####}" };
    public NumberSeriesDto GoodsReceiptSeries { get; set; } = new() { Prefix = "GRN", Format = "GRN-{YYYY}-{#####}" };
    public NumberSeriesDto TransferSeries { get; set; } = new() { Prefix = "TRF", Format = "TRF-{YYYY}-{#####}" };
    public NumberSeriesDto AdjustmentSeries { get; set; } = new() { Prefix = "ADJ", Format = "ADJ-{YYYY}-{#####}" };
    public NumberSeriesDto StockCountSeries { get; set; } = new() { Prefix = "CNT", Format = "CNT-{YYYY}-{#####}" };
    public NumberSeriesDto MovementSeries { get; set; } = new() { Prefix = "MOV", Format = "MOV-{YYYY}-{#####}" };
    public string SKUGenerationRule { get; set; } = "{CAT}-{###}";
    public string BarcodeGenerationRule { get; set; } = "EAN13";
}

public class NumberSeriesDto
{
    public string Prefix { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public int CurrentNumber { get; set; }
    public int IncrementBy { get; set; } = 1;
}

public class UpdateCompanySettingsDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? StateProvince { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? TaxId { get; set; }
    public string BaseCurrency { get; set; } = "USD";
    public string DateFormat { get; set; } = "MM/dd/yyyy";
    public string TimeZone { get; set; } = "UTC";
}

public class UpdateInventorySettingsDto
{
    public string DefaultValuationMethod { get; set; } = "FIFO";
    public bool AllowNegativeStock { get; set; }
    public bool AutoPostMovements { get; set; }
    public bool RequireAdjustmentApproval { get; set; }
    public decimal AdjustmentApprovalThreshold { get; set; }
    public bool RequireTransferApproval { get; set; }
    public bool RequirePOApproval { get; set; }
    public decimal POApprovalThreshold { get; set; }
}

public class UpdateAlertSettingsDto
{
    public int LowStockThresholdPercent { get; set; }
    public int CriticalStockThresholdPercent { get; set; }
    public int ExpiryWarningDays { get; set; }
    public int ExpiryAlertDays { get; set; }
    public int OverduePOWarningDays { get; set; }
    public int OverduePOAlertDays { get; set; }
    public bool EmailLowStockAlerts { get; set; }
    public bool EmailExpiryAlerts { get; set; }
    public bool EmailPOAlerts { get; set; }
    public string? AlertEmailRecipients { get; set; }
}
