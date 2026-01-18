using AutoMapper;
using StockFlowPro.Application.Common.Exceptions;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Warehouses;
using StockFlowPro.Application.Services.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Infrastructure.Repositories.Interfaces;

namespace StockFlowPro.Application.Services.Implementations;

public class WarehouseService : IWarehouseService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public WarehouseService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<WarehouseDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var warehouse = await _unitOfWork.Warehouses.GetWithZonesAndBinsAsync(id, cancellationToken);
        return warehouse == null ? null : _mapper.Map<WarehouseDetailDto>(warehouse);
    }

    public async Task<IReadOnlyList<WarehouseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var warehouses = await _unitOfWork.Warehouses.GetAllAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<WarehouseDto>>(warehouses);
    }

    public async Task<IReadOnlyList<WarehouseDto>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var warehouses = await _unitOfWork.Warehouses.GetActiveWarehousesAsync(cancellationToken);
        return _mapper.Map<IReadOnlyList<WarehouseDto>>(warehouses);
    }

    public async Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto, CancellationToken cancellationToken = default)
    {
        if (await _unitOfWork.Warehouses.ExistsByCodeAsync(dto.WarehouseCode, cancellationToken))
        {
            throw new ValidationException("WarehouseCode", "A warehouse with this code already exists.");
        }

        var warehouse = _mapper.Map<Warehouse>(dto);
        warehouse.IsActive = true;
        warehouse.CreatedDate = DateTime.UtcNow;

        await _unitOfWork.Warehouses.AddAsync(warehouse, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<WarehouseDto>(warehouse);
    }

    public async Task<WarehouseDto> UpdateAsync(UpdateWarehouseDto dto, CancellationToken cancellationToken = default)
    {
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(dto.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            throw new NotFoundException("Warehouse", dto.WarehouseId);
        }

        _mapper.Map(dto, warehouse);
        warehouse.ModifiedDate = DateTime.UtcNow;

        _unitOfWork.Warehouses.Update(warehouse);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<WarehouseDto>(warehouse);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(id, cancellationToken);
        if (warehouse == null)
        {
            throw new NotFoundException("Warehouse", id);
        }

        var hasStock = await _unitOfWork.StockLevels.AnyAsync(s => s.WarehouseId == id, cancellationToken);
        if (hasStock)
        {
            throw new BusinessRuleException("WAREHOUSE_HAS_STOCK", "Cannot delete a warehouse that has stock.");
        }

        _unitOfWork.Warehouses.Remove(warehouse);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LookupDto>> GetLookupAsync(CancellationToken cancellationToken = default)
    {
        var warehouses = await _unitOfWork.Warehouses.GetActiveWarehousesAsync(cancellationToken);
        return warehouses.Select(w => new LookupDto
        {
            Id = w.WarehouseId,
            Name = w.Name,
            Code = w.WarehouseCode
        }).ToList();
    }
}
