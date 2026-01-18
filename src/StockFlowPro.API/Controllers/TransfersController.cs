using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.Transfer;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransfersController : BaseApiController
{
    private readonly ITransferService _transferService;

    public TransfersController(ITransferService transferService)
    {
        _transferService = transferService;
    }

    /// <summary>
    /// Get paginated list of transfers
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<TransferListDto>>>> GetTransfers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? sourceWarehouseId = null,
        [FromQuery] int? destWarehouseId = null,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _transferService.GetPagedAsync(pageNumber, pageSize, sourceWarehouseId, destWarehouseId, status, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get transfer by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<TransferDto>>> GetTransfer(int id, CancellationToken cancellationToken)
    {
        var transfer = await _transferService.GetByIdAsync(id, cancellationToken);
        if (transfer == null)
        {
            return NotFoundResponse<TransferDto>($"Transfer with ID {id} not found.");
        }
        return OkResponse(transfer);
    }

    /// <summary>
    /// Create a new transfer request
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TransferDto>>> CreateTransfer(
        [FromBody] CreateTransferDto dto,
        CancellationToken cancellationToken)
    {
        var transfer = await _transferService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(transfer, nameof(GetTransfer), new { id = transfer.TransferId });
    }

    /// <summary>
    /// Approve a transfer request
    /// </summary>
    [HttpPost("{id:int}/approve")]
    public async Task<ActionResult<ApiResponse<object>>> ApproveTransfer(
        int id,
        [FromBody] ApproveTransferDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.TransferId)
        {
            return BadRequestResponse<object>("ID mismatch between route and body.");
        }

        await _transferService.ApproveAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Transfer approved successfully.");
    }

    /// <summary>
    /// Reject a transfer request
    /// </summary>
    [HttpPost("{id:int}/reject")]
    public async Task<ActionResult<ApiResponse<object>>> RejectTransfer(
        int id,
        [FromBody] RejectTransferDto dto,
        CancellationToken cancellationToken)
    {
        await _transferService.RejectAsync(id, dto.Reason, cancellationToken);
        return OkResponse<object>(null!, "Transfer rejected.");
    }

    /// <summary>
    /// Ship a transfer
    /// </summary>
    [HttpPost("{id:int}/ship")]
    public async Task<ActionResult<ApiResponse<object>>> ShipTransfer(
        int id,
        [FromBody] ShipTransferDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.TransferId)
        {
            return BadRequestResponse<object>("ID mismatch between route and body.");
        }

        await _transferService.ShipAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Transfer shipped successfully. Stock has been deducted from source warehouse.");
    }

    /// <summary>
    /// Receive a transfer
    /// </summary>
    [HttpPost("{id:int}/receive")]
    public async Task<ActionResult<ApiResponse<object>>> ReceiveTransfer(
        int id,
        [FromBody] ReceiveTransferDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.TransferId)
        {
            return BadRequestResponse<object>("ID mismatch between route and body.");
        }

        await _transferService.ReceiveAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Transfer received successfully. Stock has been added to destination warehouse.");
    }

    /// <summary>
    /// Cancel a transfer
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ApiResponse<object>>> CancelTransfer(
        int id,
        [FromBody] CancelTransferDto dto,
        CancellationToken cancellationToken)
    {
        await _transferService.CancelAsync(id, dto.Reason, cancellationToken);
        return OkResponse<object>(null!, "Transfer cancelled successfully.");
    }
}

public class RejectTransferDto
{
    public string? Reason { get; set; }
}

public class CancelTransferDto
{
    public string? Reason { get; set; }
}
