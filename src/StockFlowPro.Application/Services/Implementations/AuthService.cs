using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Users;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Infrastructure.Repositories.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StockFlowPro.Application.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthService(IUserService userService, IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _userService = userService;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var isValid = await _userService.ValidateCredentialsAsync(dto.Username, dto.Password, cancellationToken);
        if (!isValid)
        {
            throw new UnauthorizedException("Invalid username or password.");
        }

        var user = await _userService.GetByUsernameAsync(dto.Username, cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedException("User not found.");
        }

        var token = GenerateJwtToken(user);

        var jwtSettings = _configuration.GetSection("JwtSettings");
        var expirationHours = int.Parse(jwtSettings["ExpirationHours"] ?? "8");

        return new LoginResponseDto
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(expirationHours),
            User = user
        };
    }

    public async Task<LoginResponseDto?> RefreshTokenAsync(int userId, CancellationToken cancellationToken = default)
    {
        var userDetail = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (userDetail == null || !userDetail.IsActive)
        {
            return null;
        }

        var user = new UserDto
        {
            UserId = userDetail.UserId,
            Username = userDetail.Username,
            Email = userDetail.Email,
            FirstName = userDetail.FirstName,
            LastName = userDetail.LastName,
            RoleId = userDetail.RoleId,
            RoleName = userDetail.Role?.RoleName ?? "User"
        };

        var token = GenerateJwtToken(user);

        var jwtSettings = _configuration.GetSection("JwtSettings");
        var expirationHours = int.Parse(jwtSettings["ExpirationHours"] ?? "8");

        return new LoginResponseDto
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(expirationHours),
            User = user
        };
    }

    public async Task LogoutAsync(int userId, CancellationToken cancellationToken = default)
    {
        // In a real application, you might want to:
        // - Invalidate the JWT token by adding it to a blacklist
        // - Clear any refresh tokens
        // - Log the logout event
        await Task.CompletedTask;
    }

    public string GenerateJwtToken(UserDto user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey must be configured in appsettings.json under JwtSettings:SecretKey");
        var issuer = jwtSettings["Issuer"] ?? "StockFlowPro";
        var audience = jwtSettings["Audience"] ?? "StockFlowProClient";
        var expirationHours = int.Parse(jwtSettings["ExpirationHours"] ?? "8");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
            new Claim(ClaimTypes.Surname, user.LastName ?? string.Empty),
            new Claim(ClaimTypes.Role, user.RoleName ?? "User"),
            new Claim("role_id", user.RoleId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
