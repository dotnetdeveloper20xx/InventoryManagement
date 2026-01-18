using System.Text.Json;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;

namespace StockFlowPro.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, errorCode, message, details) = exception switch
        {
            NotFoundException ex => (404, "NOT_FOUND", ex.Message, null as Dictionary<string, string[]>),
            Application.Common.Exceptions.ValidationException ex => (400, "VALIDATION_ERROR", ex.Message, ex.Errors as Dictionary<string, string[]>),
            BusinessRuleException ex => (422, ex.Code, ex.Message, null),
            ConcurrencyException ex => (409, "CONCURRENCY_CONFLICT", ex.Message, null),
            UnauthorizedException ex => (401, "UNAUTHORIZED", ex.Message, null),
            ForbiddenException ex => (403, "FORBIDDEN", ex.Message, null),
            _ => (500, "INTERNAL_ERROR", "An unexpected error occurred.", null)
        };

        if (statusCode == 500)
        {
            _logger.LogError(exception, "Unhandled exception occurred");
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception: {Message}", exception.Message);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = ApiResponse<object>.FailureResult(errorCode, message, details);

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}
