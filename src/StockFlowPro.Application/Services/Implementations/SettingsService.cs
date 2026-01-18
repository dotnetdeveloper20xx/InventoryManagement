using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.DTOs.Settings;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class SettingsService : ISettingsService
{
    private readonly StockFlowDbContext _context;

    public SettingsService(StockFlowDbContext context)
    {
        _context = context;
    }

    public async Task<SystemSettingsDto> GetAllSettingsAsync(CancellationToken ct = default)
    {
        return new SystemSettingsDto
        {
            Company = await GetCompanySettingsAsync(ct),
            Inventory = await GetInventorySettingsAsync(ct),
            Alerts = await GetAlertSettingsAsync(ct),
            Numbering = await GetNumberingSettingsAsync(ct)
        };
    }

    public async Task<CompanySettingsDto> GetCompanySettingsAsync(CancellationToken ct = default)
    {
        var settings = await GetSettingsByCategoryAsync("Company", ct);

        return new CompanySettingsDto
        {
            CompanyName = GetSettingValue(settings, "CompanyName", "StockFlow Pro"),
            LogoUrl = GetSettingValue(settings, "LogoUrl"),
            Address = GetSettingValue(settings, "Address"),
            City = GetSettingValue(settings, "City"),
            StateProvince = GetSettingValue(settings, "StateProvince"),
            PostalCode = GetSettingValue(settings, "PostalCode"),
            Country = GetSettingValue(settings, "Country"),
            Phone = GetSettingValue(settings, "Phone"),
            Email = GetSettingValue(settings, "Email"),
            Website = GetSettingValue(settings, "Website"),
            TaxId = GetSettingValue(settings, "TaxId"),
            BaseCurrency = GetSettingValue(settings, "BaseCurrency", "USD"),
            DateFormat = GetSettingValue(settings, "DateFormat", "MM/dd/yyyy"),
            TimeZone = GetSettingValue(settings, "TimeZone", "UTC"),
            FiscalYearStartMonth = GetSettingValueInt(settings, "FiscalYearStartMonth", 1)
        };
    }

    public async Task<InventorySettingsDto> GetInventorySettingsAsync(CancellationToken ct = default)
    {
        var settings = await GetSettingsByCategoryAsync("Inventory", ct);

        return new InventorySettingsDto
        {
            DefaultValuationMethod = GetSettingValue(settings, "DefaultValuationMethod", "FIFO"),
            AllowNegativeStock = GetSettingValueBool(settings, "AllowNegativeStock", false),
            AutoPostMovements = GetSettingValueBool(settings, "AutoPostMovements", true),
            RequireAdjustmentApproval = GetSettingValueBool(settings, "RequireAdjustmentApproval", true),
            AdjustmentApprovalThreshold = GetSettingValueDecimal(settings, "AdjustmentApprovalThreshold", 1000),
            RequireTransferApproval = GetSettingValueBool(settings, "RequireTransferApproval", true),
            RequirePOApproval = GetSettingValueBool(settings, "RequirePOApproval", true),
            POApprovalThreshold = GetSettingValueDecimal(settings, "POApprovalThreshold", 5000),
            TrackBatchByDefault = GetSettingValueBool(settings, "TrackBatchByDefault", false),
            TrackExpiryByDefault = GetSettingValueBool(settings, "TrackExpiryByDefault", false),
            DefaultPickingStrategy = GetSettingValue(settings, "DefaultPickingStrategy", "FIFO")
        };
    }

    public async Task<AlertSettingsDto> GetAlertSettingsAsync(CancellationToken ct = default)
    {
        var settings = await GetSettingsByCategoryAsync("Alerts", ct);

        return new AlertSettingsDto
        {
            LowStockThresholdPercent = GetSettingValueInt(settings, "LowStockThresholdPercent", 25),
            CriticalStockThresholdPercent = GetSettingValueInt(settings, "CriticalStockThresholdPercent", 10),
            ExpiryWarningDays = GetSettingValueInt(settings, "ExpiryWarningDays", 30),
            ExpiryAlertDays = GetSettingValueInt(settings, "ExpiryAlertDays", 7),
            OverduePOWarningDays = GetSettingValueInt(settings, "OverduePOWarningDays", 3),
            OverduePOAlertDays = GetSettingValueInt(settings, "OverduePOAlertDays", 7),
            EmailLowStockAlerts = GetSettingValueBool(settings, "EmailLowStockAlerts", false),
            EmailExpiryAlerts = GetSettingValueBool(settings, "EmailExpiryAlerts", false),
            EmailPOAlerts = GetSettingValueBool(settings, "EmailPOAlerts", false),
            AlertEmailRecipients = GetSettingValue(settings, "AlertEmailRecipients")
        };
    }

    public async Task UpdateCompanySettingsAsync(UpdateCompanySettingsDto dto, CancellationToken ct = default)
    {
        await SaveSettingAsync("Company", "CompanyName", dto.CompanyName, ct);
        await SaveSettingAsync("Company", "LogoUrl", dto.LogoUrl, ct);
        await SaveSettingAsync("Company", "Address", dto.Address, ct);
        await SaveSettingAsync("Company", "City", dto.City, ct);
        await SaveSettingAsync("Company", "StateProvince", dto.StateProvince, ct);
        await SaveSettingAsync("Company", "PostalCode", dto.PostalCode, ct);
        await SaveSettingAsync("Company", "Country", dto.Country, ct);
        await SaveSettingAsync("Company", "Phone", dto.Phone, ct);
        await SaveSettingAsync("Company", "Email", dto.Email, ct);
        await SaveSettingAsync("Company", "Website", dto.Website, ct);
        await SaveSettingAsync("Company", "TaxId", dto.TaxId, ct);
        await SaveSettingAsync("Company", "BaseCurrency", dto.BaseCurrency, ct);
        await SaveSettingAsync("Company", "DateFormat", dto.DateFormat, ct);
        await SaveSettingAsync("Company", "TimeZone", dto.TimeZone, ct);

        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateInventorySettingsAsync(UpdateInventorySettingsDto dto, CancellationToken ct = default)
    {
        await SaveSettingAsync("Inventory", "DefaultValuationMethod", dto.DefaultValuationMethod, ct);
        await SaveSettingAsync("Inventory", "AllowNegativeStock", dto.AllowNegativeStock.ToString(), ct);
        await SaveSettingAsync("Inventory", "AutoPostMovements", dto.AutoPostMovements.ToString(), ct);
        await SaveSettingAsync("Inventory", "RequireAdjustmentApproval", dto.RequireAdjustmentApproval.ToString(), ct);
        await SaveSettingAsync("Inventory", "AdjustmentApprovalThreshold", dto.AdjustmentApprovalThreshold.ToString(), ct);
        await SaveSettingAsync("Inventory", "RequireTransferApproval", dto.RequireTransferApproval.ToString(), ct);
        await SaveSettingAsync("Inventory", "RequirePOApproval", dto.RequirePOApproval.ToString(), ct);
        await SaveSettingAsync("Inventory", "POApprovalThreshold", dto.POApprovalThreshold.ToString(), ct);

        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAlertSettingsAsync(UpdateAlertSettingsDto dto, CancellationToken ct = default)
    {
        await SaveSettingAsync("Alerts", "LowStockThresholdPercent", dto.LowStockThresholdPercent.ToString(), ct);
        await SaveSettingAsync("Alerts", "CriticalStockThresholdPercent", dto.CriticalStockThresholdPercent.ToString(), ct);
        await SaveSettingAsync("Alerts", "ExpiryWarningDays", dto.ExpiryWarningDays.ToString(), ct);
        await SaveSettingAsync("Alerts", "ExpiryAlertDays", dto.ExpiryAlertDays.ToString(), ct);
        await SaveSettingAsync("Alerts", "OverduePOWarningDays", dto.OverduePOWarningDays.ToString(), ct);
        await SaveSettingAsync("Alerts", "OverduePOAlertDays", dto.OverduePOAlertDays.ToString(), ct);
        await SaveSettingAsync("Alerts", "EmailLowStockAlerts", dto.EmailLowStockAlerts.ToString(), ct);
        await SaveSettingAsync("Alerts", "EmailExpiryAlerts", dto.EmailExpiryAlerts.ToString(), ct);
        await SaveSettingAsync("Alerts", "EmailPOAlerts", dto.EmailPOAlerts.ToString(), ct);
        await SaveSettingAsync("Alerts", "AlertEmailRecipients", dto.AlertEmailRecipients, ct);

        await _context.SaveChangesAsync(ct);
    }

    public async Task<string> GenerateNextNumberAsync(string seriesType, CancellationToken ct = default)
    {
        var series = await _context.NumberSeries
            .FirstOrDefaultAsync(s => s.EntityType == seriesType, ct);

        if (series == null)
        {
            series = new NumberSeries
            {
                EntityType = seriesType,
                Prefix = seriesType.ToUpper()[..3],
                CurrentNumber = 0,
                NumberPadding = 5
            };
            _context.NumberSeries.Add(series);
        }

        series.CurrentNumber++;

        var year = DateTime.UtcNow.Year;
        var number = series.CurrentNumber.ToString().PadLeft(series.NumberPadding, '0');

        await _context.SaveChangesAsync(ct);

        return $"{series.Prefix}-{year}-{number}";
    }

    private async Task<NumberingSettingsDto> GetNumberingSettingsAsync(CancellationToken ct = default)
    {
        var series = await _context.NumberSeries.ToListAsync(ct);

        return new NumberingSettingsDto
        {
            PurchaseOrderSeries = MapNumberSeries(series.FirstOrDefault(s => s.EntityType == "PurchaseOrder")),
            GoodsReceiptSeries = MapNumberSeries(series.FirstOrDefault(s => s.EntityType == "GoodsReceipt")),
            TransferSeries = MapNumberSeries(series.FirstOrDefault(s => s.EntityType == "Transfer")),
            AdjustmentSeries = MapNumberSeries(series.FirstOrDefault(s => s.EntityType == "Adjustment")),
            StockCountSeries = MapNumberSeries(series.FirstOrDefault(s => s.EntityType == "StockCount")),
            MovementSeries = MapNumberSeries(series.FirstOrDefault(s => s.EntityType == "Movement")),
            SKUGenerationRule = "{CAT}-{###}",
            BarcodeGenerationRule = "EAN13"
        };
    }

    private static NumberSeriesDto MapNumberSeries(NumberSeries? series)
    {
        if (series == null)
        {
            return new NumberSeriesDto
            {
                Prefix = "XXX",
                Format = "{PREFIX}-{YYYY}-{#####}",
                CurrentNumber = 0,
                IncrementBy = 1
            };
        }

        return new NumberSeriesDto
        {
            Prefix = series.Prefix,
            Format = $"{series.Prefix}-{{YYYY}}-{{{'#'.ToString().PadLeft(series.NumberPadding, '#')}}}",
            CurrentNumber = series.CurrentNumber,
            IncrementBy = 1
        };
    }

    private async Task<List<SystemSetting>> GetSettingsByCategoryAsync(string category, CancellationToken ct)
    {
        return await _context.SystemSettings
            .Where(s => s.Category == category)
            .ToListAsync(ct);
    }

    private async Task SaveSettingAsync(string category, string key, string? value, CancellationToken ct)
    {
        var setting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.Category == category && s.Key == key, ct);

        if (setting == null)
        {
            setting = new SystemSetting
            {
                Category = category,
                Key = key,
                Value = value,
                ModifiedDate = DateTime.UtcNow
            };
            _context.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            setting.ModifiedDate = DateTime.UtcNow;
        }
    }

    private static string GetSettingValue(List<SystemSetting> settings, string key, string defaultValue = "")
    {
        return settings.FirstOrDefault(s => s.Key == key)?.Value ?? defaultValue;
    }

    private static bool GetSettingValueBool(List<SystemSetting> settings, string key, bool defaultValue = false)
    {
        var value = settings.FirstOrDefault(s => s.Key == key)?.Value;
        return bool.TryParse(value, out var result) ? result : defaultValue;
    }

    private static int GetSettingValueInt(List<SystemSetting> settings, string key, int defaultValue = 0)
    {
        var value = settings.FirstOrDefault(s => s.Key == key)?.Value;
        return int.TryParse(value, out var result) ? result : defaultValue;
    }

    private static decimal GetSettingValueDecimal(List<SystemSetting> settings, string key, decimal defaultValue = 0)
    {
        var value = settings.FirstOrDefault(s => s.Key == key)?.Value;
        return decimal.TryParse(value, out var result) ? result : defaultValue;
    }
}
