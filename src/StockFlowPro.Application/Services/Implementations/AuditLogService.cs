using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.AuditLog;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Data;

namespace StockFlowPro.Application.Services.Implementations;

public class AuditLogService : IAuditLogService
{
    private readonly StockFlowDbContext _context;

    public AuditLogService(StockFlowDbContext context)
    {
        _context = context;
    }

    public async Task<AuditLogDetailDto?> GetByIdAsync(long id, CancellationToken ct = default)
    {
        var log = await _context.AuditLogs
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.AuditLogId == id, ct);

        if (log == null) return null;

        return new AuditLogDetailDto
        {
            AuditLogId = log.AuditLogId,
            EntityType = log.EntityType,
            EntityId = log.EntityId,
            EntityReference = log.EntityReference,
            Action = log.Action.ToString(),
            Changes = ParseChanges(log.OldValues, log.NewValues),
            UserName = log.Username ?? log.User?.Username,
            IpAddress = log.IpAddress,
            Timestamp = log.Timestamp
        };
    }

    public async Task<PaginatedResponse<AuditLogListDto>> GetPagedAsync(AuditLogFilterDto filter, CancellationToken ct = default)
    {
        var query = _context.AuditLogs.AsQueryable();

        if (!string.IsNullOrEmpty(filter.EntityType))
            query = query.Where(a => a.EntityType == filter.EntityType);
        if (filter.EntityId.HasValue)
            query = query.Where(a => a.EntityId == filter.EntityId.Value);
        if (!string.IsNullOrEmpty(filter.Action) && Enum.TryParse<AuditAction>(filter.Action, out var action))
            query = query.Where(a => a.Action == action);
        if (filter.UserId.HasValue)
            query = query.Where(a => a.UserId == filter.UserId.Value);
        if (filter.FromDate.HasValue)
            query = query.Where(a => a.Timestamp >= filter.FromDate.Value);
        if (filter.ToDate.HasValue)
            query = query.Where(a => a.Timestamp <= filter.ToDate.Value);
        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(a =>
                a.EntityReference != null && a.EntityReference.Contains(filter.Search) ||
                a.Username != null && a.Username.Contains(filter.Search));

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new AuditLogListDto
            {
                AuditLogId = a.AuditLogId,
                EntityType = a.EntityType,
                EntityReference = a.EntityReference,
                Action = a.Action.ToString(),
                UserName = a.Username,
                Timestamp = a.Timestamp,
                Summary = a.ActionDescription ?? GetActionSummary(a)
            })
            .ToListAsync(ct);

        return new PaginatedResponse<AuditLogListDto>(items, totalCount, filter.PageNumber, filter.PageSize);
    }

    public async Task<EntityAuditHistoryDto> GetEntityHistoryAsync(string entityType, int entityId, CancellationToken ct = default)
    {
        var logs = await _context.AuditLogs
            .Where(a => a.EntityType == entityType && a.EntityId == entityId)
            .OrderByDescending(a => a.Timestamp)
            .Take(100)
            .Select(a => new AuditLogListDto
            {
                AuditLogId = a.AuditLogId,
                EntityType = a.EntityType,
                EntityReference = a.EntityReference,
                Action = a.Action.ToString(),
                UserName = a.Username,
                Timestamp = a.Timestamp,
                Summary = a.ActionDescription
            })
            .ToListAsync(ct);

        var firstLog = logs.LastOrDefault();

        return new EntityAuditHistoryDto
        {
            EntityType = entityType,
            EntityId = entityId,
            EntityReference = firstLog?.EntityReference,
            History = logs
        };
    }

    public async Task<AuditSummaryDto> GetSummaryAsync(DateTime fromDate, DateTime toDate, CancellationToken ct = default)
    {
        var logs = await _context.AuditLogs
            .Include(a => a.User)
            .Where(a => a.Timestamp >= fromDate && a.Timestamp <= toDate)
            .ToListAsync(ct);

        var byAction = logs
            .GroupBy(a => a.Action)
            .Select(g => new AuditActionSummaryDto
            {
                Action = g.Key.ToString(),
                Count = g.Count()
            })
            .ToList();

        var byEntity = logs
            .GroupBy(a => a.EntityType)
            .Select(g => new AuditEntitySummaryDto
            {
                EntityType = g.Key,
                Count = g.Count()
            })
            .ToList();

        var byUser = logs
            .Where(a => a.UserId > 0)
            .GroupBy(a => new { a.UserId, Username = a.Username ?? a.User?.Username ?? "Unknown" })
            .Select(g => new AuditUserSummaryDto
            {
                UserId = g.Key.UserId,
                UserName = g.Key.Username,
                ActionCount = g.Count(),
                LastActivity = g.Max(a => a.Timestamp)
            })
            .OrderByDescending(u => u.ActionCount)
            .ToList();

        return new AuditSummaryDto
        {
            FromDate = fromDate,
            ToDate = toDate,
            TotalActions = logs.Count,
            ByAction = byAction,
            ByEntity = byEntity,
            ByUser = byUser
        };
    }

    public async Task LogAsync(string entityType, int entityId, string action, object? oldValues, object? newValues, CancellationToken ct = default)
    {
        var auditLog = new AuditLog
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = Enum.TryParse<AuditAction>(action, out var auditAction) ? auditAction : AuditAction.View,
            OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
            NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
            ChangedFields = GetChangedFields(oldValues, newValues),
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(ct);
    }

    private static List<AuditFieldChangeDto> ParseChanges(string? oldValuesJson, string? newValuesJson)
    {
        var changes = new List<AuditFieldChangeDto>();

        if (string.IsNullOrEmpty(oldValuesJson) && string.IsNullOrEmpty(newValuesJson))
            return changes;

        try
        {
            var oldDict = !string.IsNullOrEmpty(oldValuesJson)
                ? JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(oldValuesJson)
                : new Dictionary<string, JsonElement>();

            var newDict = !string.IsNullOrEmpty(newValuesJson)
                ? JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(newValuesJson)
                : new Dictionary<string, JsonElement>();

            var allKeys = (oldDict?.Keys ?? Enumerable.Empty<string>())
                .Union(newDict?.Keys ?? Enumerable.Empty<string>())
                .Distinct();

            foreach (var key in allKeys)
            {
                var oldValue = oldDict?.TryGetValue(key, out var oldVal) == true ? oldVal.ToString() : null;
                var newValue = newDict?.TryGetValue(key, out var newVal) == true ? newVal.ToString() : null;

                if (oldValue != newValue)
                {
                    changes.Add(new AuditFieldChangeDto
                    {
                        FieldName = key,
                        OldValue = oldValue,
                        NewValue = newValue
                    });
                }
            }
        }
        catch
        {
            // If parsing fails, return empty list
        }

        return changes;
    }

    private static string? GetChangedFields(object? oldValues, object? newValues)
    {
        if (oldValues == null && newValues == null) return null;

        try
        {
            var oldJson = oldValues != null ? JsonSerializer.Serialize(oldValues) : "{}";
            var newJson = newValues != null ? JsonSerializer.Serialize(newValues) : "{}";

            var oldDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(oldJson);
            var newDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(newJson);

            var changedFields = new List<string>();

            var allKeys = (oldDict?.Keys ?? Enumerable.Empty<string>())
                .Union(newDict?.Keys ?? Enumerable.Empty<string>())
                .Distinct();

            foreach (var key in allKeys)
            {
                var oldValue = oldDict?.TryGetValue(key, out var oldVal) == true ? oldVal.ToString() : null;
                var newValue = newDict?.TryGetValue(key, out var newVal) == true ? newVal.ToString() : null;

                if (oldValue != newValue)
                {
                    changedFields.Add(key);
                }
            }

            return changedFields.Count > 0 ? string.Join(",", changedFields) : null;
        }
        catch
        {
            return null;
        }
    }

    private static string GetActionSummary(AuditLog log)
    {
        return $"{log.Action} {log.EntityType} {log.EntityReference ?? $"#{log.EntityId}"}";
    }
}
