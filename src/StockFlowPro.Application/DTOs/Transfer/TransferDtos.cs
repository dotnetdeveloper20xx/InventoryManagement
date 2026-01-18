namespace StockFlowPro.Application.DTOs.Transfer;

public class TransferDto
{
    public int TransferId { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public int SourceWarehouseId { get; set; }
    public string SourceWarehouseName { get; set; } = string.Empty;
    public int DestinationWarehouseId { get; set; }
    public string DestinationWarehouseName { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public DateTime? RequiredDate { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }
    public string? Notes { get; set; }
    public IReadOnlyList<TransferLineDto> Lines { get; set; } = new List<TransferLineDto>();
    public string? RequestedBy { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class TransferLineDto
{
    public int TransferLineId { get; set; }
    public int ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? SourceBinId { get; set; }
    public string? SourceBinCode { get; set; }
    public int? DestinationBinId { get; set; }
    public string? DestinationBinCode { get; set; }
    public string? BatchNumber { get; set; }
    public decimal RequestedQuantity { get; set; }
    public decimal ApprovedQuantity { get; set; }
    public decimal ShippedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal VarianceQuantity { get; set; }
    public string UOM { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public string? Notes { get; set; }
}

public class CreateTransferDto
{
    public int SourceWarehouseId { get; set; }
    public int DestinationWarehouseId { get; set; }
    public DateTime? RequiredDate { get; set; }
    public string Priority { get; set; } = "Normal";
    public string? Notes { get; set; }
    public IList<CreateTransferLineDto> Lines { get; set; } = new List<CreateTransferLineDto>();
}

public class CreateTransferLineDto
{
    public int ProductId { get; set; }
    public int? SourceBinId { get; set; }
    public int? DestinationBinId { get; set; }
    public string? BatchNumber { get; set; }
    public decimal RequestedQuantity { get; set; }
    public string? Notes { get; set; }
}

public class TransferListDto
{
    public int TransferId { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public string SourceWarehouseName { get; set; } = string.Empty;
    public string DestinationWarehouseName { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public DateTime? RequiredDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public int LineCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public string? RequestedBy { get; set; }
}

public class ApproveTransferDto
{
    public int TransferId { get; set; }
    public string? Notes { get; set; }
    public IList<ApproveTransferLineDto>? Lines { get; set; }
}

public class ApproveTransferLineDto
{
    public int TransferLineId { get; set; }
    public decimal ApprovedQuantity { get; set; }
}

public class ShipTransferDto
{
    public int TransferId { get; set; }
    public DateTime ShippedDate { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }
    public string? Notes { get; set; }
    public IList<ShipTransferLineDto>? Lines { get; set; }
}

public class ShipTransferLineDto
{
    public int TransferLineId { get; set; }
    public decimal ShippedQuantity { get; set; }
}

public class ReceiveTransferDto
{
    public int TransferId { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string? Notes { get; set; }
    public IList<ReceiveTransferLineDto> Lines { get; set; } = new List<ReceiveTransferLineDto>();
}

public class ReceiveTransferLineDto
{
    public int TransferLineId { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public int? DestinationBinId { get; set; }
    public string? Notes { get; set; }
}
