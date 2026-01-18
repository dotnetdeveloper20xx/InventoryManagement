using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Users;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get paginated list of users
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<UserDto>>>> GetUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _userService.GetPagedAsync(pageNumber, pageSize, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> GetUser(int id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFoundResponse<UserDetailDto>($"User with ID {id} not found.");
        }
        return OkResponse(user);
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return UnauthorizedResponse<UserDetailDto>("User not authenticated.");
        }

        var user = await _userService.GetByIdAsync(userId.Value, cancellationToken);
        if (user == null)
        {
            return NotFoundResponse<UserDetailDto>("Current user not found.");
        }
        return OkResponse(user);
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser(
        [FromBody] CreateUserDto dto,
        CancellationToken cancellationToken)
    {
        var user = await _userService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(user, nameof(GetUser), new { id = user.UserId });
    }

    /// <summary>
    /// Update an existing user
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(
        int id,
        [FromBody] UpdateUserDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.UserId)
        {
            return BadRequestResponse<UserDto>("ID mismatch between route and body.");
        }

        var user = await _userService.UpdateAsync(dto, cancellationToken);
        return OkResponse(user, "User updated successfully.");
    }

    /// <summary>
    /// Delete a user
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteUser(int id, CancellationToken cancellationToken)
    {
        await _userService.DeleteAsync(id, cancellationToken);
        return OkResponse<object>(null!, "User deleted successfully.");
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("{id:int}/change-password")]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword(
        int id,
        [FromBody] ChangePasswordDto dto,
        CancellationToken cancellationToken)
    {
        await _userService.ChangePasswordAsync(id, dto, cancellationToken);
        return OkResponse<object>(null!, "Password changed successfully.");
    }

    /// <summary>
    /// Lock a user account
    /// </summary>
    [HttpPost("{id:int}/lock")]
    public async Task<ActionResult<ApiResponse<object>>> LockUser(int id, CancellationToken cancellationToken)
    {
        await _userService.LockUserAsync(id, cancellationToken);
        return OkResponse<object>(null!, "User account locked.");
    }

    /// <summary>
    /// Unlock a user account
    /// </summary>
    [HttpPost("{id:int}/unlock")]
    public async Task<ActionResult<ApiResponse<object>>> UnlockUser(int id, CancellationToken cancellationToken)
    {
        await _userService.UnlockUserAsync(id, cancellationToken);
        return OkResponse<object>(null!, "User account unlocked.");
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
