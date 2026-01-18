using Microsoft.AspNetCore.Mvc;
using StockFlowPro.Application.DTOs.Common;
using StockFlowPro.Application.DTOs.GoodsReceipt;
using StockFlowPro.Application.Services.Interfaces;

namespace StockFlowPro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoodsReceiptsController : BaseApiController
{
    private readonly IGoodsReceiptService _goodsReceiptService;

    public GoodsReceiptsController(IGoodsReceiptService goodsReceiptService)
    {
        _goodsReceiptService = goodsReceiptService;
    }

    /// <summary>
    /// Get paginated list of goods receipts
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<GoodsReceiptListDto>>>> GetGoodsReceipts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? poId = null,
        [FromQuery] int? supplierId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _goodsReceiptService.GetPagedAsync(pageNumber, pageSize, poId, supplierId, fromDate, toDate, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Get goods receipt by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<GoodsReceiptDto>>> GetGoodsReceipt(int id, CancellationToken cancellationToken)
    {
        var grn = await _goodsReceiptService.GetByIdAsync(id, cancellationToken);
        if (grn == null)
        {
            return NotFoundResponse<GoodsReceiptDto>($"Goods Receipt with ID {id} not found.");
        }
        return OkResponse(grn);
    }

    /// <summary>
    /// Get pending receipts (POs ready for receiving)
    /// </summary>
    [HttpGet("pending")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<PendingReceiptDto>>>> GetPendingReceipts(
        [FromQuery] int? supplierId,
        CancellationToken cancellationToken)
    {
        var result = await _goodsReceiptService.GetPendingReceiptsAsync(supplierId, cancellationToken);
        return OkResponse(result);
    }

    /// <summary>
    /// Create a new goods receipt
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<GoodsReceiptDto>>> CreateGoodsReceipt(
        [FromBody] CreateGoodsReceiptDto dto,
        CancellationToken cancellationToken)
    {
        var grn = await _goodsReceiptService.CreateAsync(dto, cancellationToken);
        return CreatedResponse(grn, nameof(GetGoodsReceipt), new { id = grn.GoodsReceiptId });
    }

    /// <summary>
    /// Post a goods receipt (finalize and update stock)
    /// </summary>
    [HttpPost("{id:int}/post")]
    public async Task<ActionResult<ApiResponse<object>>> PostGoodsReceipt(int id, CancellationToken cancellationToken)
    {
        await _goodsReceiptService.PostAsync(id, cancellationToken);
        return OkResponse<object>(null!, "Goods Receipt posted successfully. Stock has been updated.");
    }
}
