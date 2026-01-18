using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.PurchaseOrders;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseOrdersController : BaseApiController
{
    private readonly IPurchaseOrderService _purchaseOrderService;

    public PurchaseOrdersController(IPurchaseOrderService purchaseOrderService)
    {
        _purchaseOrderService = purchaseOrderService;
    }

    /// <summary>
    /// Get paginated list of purchase orders
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<PurchaseOrderDto>>>> GetPurchaseOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? supplierId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _purchaseOrderService.GetPagedAsync(pageNumber, pageSize, supplierId, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get purchase order by ID with lines
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<PurchaseOrderDetailDto>>> GetPurchaseOrder(int id, CancellationToken cancellationToken)
    {
        var purchaseOrder = await _purchaseOrderService.GetByIdAsync(id, cancellationToken);
        if (purchaseOrder == null)
        {
            return NotFoundResponse<PurchaseOrderDetailDto>($"Purchase order with ID {id} not found.");
        }
        return OkResponse(purchaseOrder);
    }

    /// <summary>
    /// Create a new purchase order
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<PurchaseOrderDto>>> CreatePurchaseOrder(
        [FromBody] CreatePurchaseOrderDto dto,
        CancellationToken cancellationToken)
    {
        var purchaseOrder = await _purchaseOrderService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(purchaseOrder, nameof(GetPurchaseOrder), new { id = purchaseOrder.PurchaseOrderId });
    }

    /// <summary>
    /// Submit purchase order for approval
    /// </summary>
    [HttpPost("{id:int}/submit")]
    public async Task<ActionResult<ApiResponse<PurchaseOrderDto>>> SubmitPurchaseOrder(int id, CancellationToken cancellationToken)
    {
        var purchaseOrder = await _purchaseOrderService.SubmitAsync(id, cancellationToken);
        return OkResponse(purchaseOrder, "Purchase order submitted for approval.");
    }

    /// <summary>
    /// Approve purchase order
    /// </summary>
    [HttpPost("{id:int}/approve")]
    public async Task<ActionResult<ApiResponse<PurchaseOrderDto>>> ApprovePurchaseOrder(
        int id,
        [FromBody] ApprovalDto? dto,
        CancellationToken cancellationToken)
    {
        var purchaseOrder = await _purchaseOrderService.ApproveAsync(id, dto?.Notes, cancellationToken);
        return OkResponse(purchaseOrder, "Purchase order approved.");
    }

    /// <summary>
    /// Reject purchase order
    /// </summary>
    [HttpPost("{id:int}/reject")]
    public async Task<ActionResult<ApiResponse<PurchaseOrderDto>>> RejectPurchaseOrder(
        int id,
        [FromBody] RejectionDto dto,
        CancellationToken cancellationToken)
    {
        var purchaseOrder = await _purchaseOrderService.RejectAsync(id, dto.Reason, cancellationToken);
        return OkResponse(purchaseOrder, "Purchase order rejected.");
    }

    /// <summary>
    /// Cancel purchase order
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ApiResponse<object>>> CancelPurchaseOrder(int id, CancellationToken cancellationToken)
    {
        await _purchaseOrderService.CancelAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Purchase order cancelled.");
    }

    /// <summary>
    /// Receive goods for purchase order
    /// </summary>
    [HttpPost("{id:int}/receive")]
    public async Task<ActionResult<ApiResponse<object>>> ReceiveGoods(
        int id,
        [FromBody] ReceiveGoodsDto dto,
        CancellationToken cancellationToken)
    {
        if (id != dto.PurchaseOrderId)
        {
            return BadRequestResponse<object>("ID mismatch between route and body.");
        }

        await _purchaseOrderService.ReceiveGoodsAsync(dto, cancellationToken);
        return OkResponse<object>(null!, "Goods received successfully.");
    }

    /// <summary>
    /// Get pending receipts
    /// </summary>
    [HttpGet("pending-receipts")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<PurchaseOrderDto>>>> GetPendingReceipts(CancellationToken cancellationToken)
    {
        var purchaseOrders = await _purchaseOrderService.GetPendingReceiptsAsync(cancellationToken);
        return OkResponse(purchaseOrders);
    }
}

public class ApprovalDto
{
    public string? Notes { get; set; }
}

public class RejectionDto
{
    public string Reason { get; set; } = string.Empty;
}
