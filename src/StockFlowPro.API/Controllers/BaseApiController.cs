using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected ActionResult<ApiResponse<T>> OkResponse<T>(T data, string? message = null)
    {
        return Ok(ApiResponse<T>.SuccessResult(data, message));
    }

    protected ActionResult<ApiResponse<T>> CreatedResponse<T>(T data, string? routeName = null, object? routeValues = null)
    {
        var response = ApiResponse<T>.SuccessResult(data, "Created successfully");
        if (routeName != null)
        {
            return CreatedAtAction(routeName, routeValues, response);
        }
        return StatusCode(201, response);
    }

    protected ActionResult<ApiResponse<T>> NotFoundResponse<T>(string message)
    {
        return NotFound(ApiResponse<T>.FailureResult("NOT_FOUND", message));
    }

    protected ActionResult<ApiResponse<T>> BadRequestResponse<T>(string message, Dictionary<string, string[]>? details = null)
    {
        return BadRequest(ApiResponse<T>.FailureResult("VALIDATION_ERROR", message, details));
    }

    protected ActionResult<ApiResponse<T>> UnauthorizedResponse<T>(string message)
    {
        return Unauthorized(ApiResponse<T>.FailureResult("UNAUTHORIZED", message));
    }

    protected ActionResult<ApiResponse<T>> ForbiddenResponse<T>(string message)
    {
        return StatusCode(403, ApiResponse<T>.FailureResult("FORBIDDEN", message));
    }
}
