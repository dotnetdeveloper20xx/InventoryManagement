using AutoMapper;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Users;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Repositories.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace StockFlowPro.Application.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<UserDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
        return user == null ? null : _mapper.Map<UserDetailDto>(user);
    }

    public async Task<UserDto?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByUsernameAsync(username, cancellationToken);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<PaginatedResponse<UserDto>> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var allUsers = await _unitOfWork.Users.GetAllAsync(cancellationToken);
        var query = allUsers.AsQueryable();

        var totalCount = query.Count();
        var items = query
            .OrderBy(u => u.Username)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PaginatedResponse<UserDto>(
            _mapper.Map<List<UserDto>>(items),
            totalCount,
            pageNumber,
            pageSize
        );
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        if (await _unitOfWork.Users.ExistsByUsernameAsync(dto.Username, cancellationToken))
        {
            throw new ValidationException("Username", "A user with this username already exists.");
        }

        if (await _unitOfWork.Users.ExistsByEmailAsync(dto.Email, cancellationToken))
        {
            throw new ValidationException("Email", "A user with this email already exists.");
        }

        var user = _mapper.Map<User>(dto);
        user.PasswordHash = HashPassword(dto.Password);
        user.CreatedDate = DateTime.UtcNow;
        user.IsActive = true;

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateAsync(UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(dto.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", dto.UserId);
        }

        _mapper.Map(dto, user);
        user.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserDto>(user);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", id);
        }

        // Soft delete
        user.IsActive = false;
        user.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ValidateCredentialsAsync(string username, string password, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByUsernameAsync(username, cancellationToken);
        if (user == null || !user.IsActive)
        {
            return false;
        }

        if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
        {
            return false;
        }

        var passwordHash = HashPassword(password);
        if (user.PasswordHash != passwordHash)
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                user.IsLocked = true;
            }
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return false;
        }

        user.FailedLoginAttempts = 0;
        user.LastLoginDate = DateTime.UtcNow;
        user.IsLocked = false;
        user.LockoutEnd = null;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", userId);
        }

        var currentPasswordHash = HashPassword(dto.CurrentPassword);
        if (user.PasswordHash != currentPasswordHash)
        {
            throw new BusinessRuleException("INVALID_PASSWORD", "Current password is incorrect.");
        }

        user.PasswordHash = HashPassword(dto.NewPassword);
        user.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task LockUserAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", id);
        }

        user.IsLocked = true;
        user.LockoutEnd = DateTime.UtcNow.AddYears(100);
        user.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task UnlockUserAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", id);
        }

        user.IsLocked = false;
        user.LockoutEnd = null;
        user.FailedLoginAttempts = 0;
        user.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
