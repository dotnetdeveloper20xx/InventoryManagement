using AutoMapper;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Suppliers;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Infrastructure.Repositories.Interfaces;

namespace StockFlowPro.Application.Services.Implementations;

public class SupplierService : ISupplierService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SupplierService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<SupplierDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var supplier = await _unitOfWork.Suppliers.GetWithContactsAsync(id, cancellationToken);
        return supplier == null ? null : _mapper.Map<SupplierDetailDto>(supplier);
    }

    public async Task<PaginatedResponse<SupplierDto>> GetPagedAsync(int pageNumber, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var allSuppliers = await _unitOfWork.Suppliers.GetAllAsync(cancellationToken);
        var query = allSuppliers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = query.Where(s => s.CompanyName.ToLower().Contains(search) ||
                                     s.SupplierCode.ToLower().Contains(search) ||
                                     (s.PrimaryContactEmail != null && s.PrimaryContactEmail.ToLower().Contains(search)));
        }

        var totalCount = query.Count();
        var items = query
            .OrderBy(s => s.CompanyName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PaginatedResponse<SupplierDto>(
            _mapper.Map<List<SupplierDto>>(items),
            totalCount,
            pageNumber,
            pageSize
        );
    }

    public async Task<SupplierDto> CreateAsync(CreateSupplierDto dto, CancellationToken cancellationToken = default)
    {
        if (await _unitOfWork.Suppliers.ExistsByCodeAsync(dto.SupplierCode, cancellationToken))
        {
            throw new ValidationException("SupplierCode", "A supplier with this code already exists.");
        }

        var supplier = _mapper.Map<Supplier>(dto);
        supplier.Status = SupplierStatus.Active;
        supplier.CreatedDate = DateTime.UtcNow;

        await _unitOfWork.Suppliers.AddAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<SupplierDto>(supplier);
    }

    public async Task<SupplierDto> UpdateAsync(UpdateSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(dto.SupplierId, cancellationToken);
        if (supplier == null)
        {
            throw new NotFoundException("Supplier", dto.SupplierId);
        }

        _mapper.Map(dto, supplier);
        supplier.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Suppliers.Update(supplier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<SupplierDto>(supplier);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(id, cancellationToken);
        if (supplier == null)
        {
            throw new NotFoundException("Supplier", id);
        }

        var hasPurchaseOrders = await _unitOfWork.PurchaseOrders.AnyAsync(po => po.SupplierId == id, cancellationToken);
        if (hasPurchaseOrders)
        {
            throw new BusinessRuleException("SUPPLIER_HAS_ORDERS", "Cannot delete a supplier with existing purchase orders.");
        }

        _unitOfWork.Suppliers.Remove(supplier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LookupDto>> GetLookupAsync(CancellationToken cancellationToken = default)
    {
        var suppliers = await _unitOfWork.Suppliers.FindAsync(s => s.Status == SupplierStatus.Active, cancellationToken);
        return suppliers.Select(s => new LookupDto
        {
            Id = s.SupplierId,
            Name = s.CompanyName,
            Code = s.SupplierCode
        }).ToList();
    }
}
