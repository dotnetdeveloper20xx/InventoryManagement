using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Users;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Authenticate user and return JWT token
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> Login(
        [FromBody] LoginDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(dto, cancellationToken);
        return OkResponse(result, "Login successful.");
    }

    /// <summary>
    /// Logout current user
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Logout(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId.HasValue)
        {
            await _authService.LogoutAsync(userId.Value, cancellationToken);
        }
        return OkResponse<object>(null!, "Logout successful.");
    }

    /// <summary>
    /// Refresh JWT token
    /// </summary>
    [HttpPost("refresh")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> RefreshToken(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return UnauthorizedResponse<LoginResponseDto>("User not authenticated.");
        }

        var result = await _authService.RefreshTokenAsync(userId.Value, cancellationToken);
        if (result == null)
        {
            return UnauthorizedResponse<LoginResponseDto>("User not found or inactive.");
        }

        return OkResponse(result, "Token refreshed successfully.");
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }
}
