namespace StockFlowPro.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException() : base() { }

    public NotFoundException(string message) : base(message) { }

    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) was not found.") { }

    public NotFoundException(string message, Exception innerException)
        : base(message, innerException) { }
}

public class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException() : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(string message) : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IDictionary<string, string[]> errors) : this()
    {
        Errors = errors;
    }

    public ValidationException(string propertyName, string errorMessage)
        : this()
    {
        Errors = new Dictionary<string, string[]>
        {
            { propertyName, new[] { errorMessage } }
        };
    }
}

public class BusinessRuleException : Exception
{
    public string Code { get; }

    public BusinessRuleException(string message) : base(message)
    {
        Code = "BUSINESS_RULE_VIOLATION";
    }

    public BusinessRuleException(string code, string message) : base(message)
    {
        Code = code;
    }

    public BusinessRuleException(string message, Exception innerException)
        : base(message, innerException)
    {
        Code = "BUSINESS_RULE_VIOLATION";
    }
}

public class ConcurrencyException : Exception
{
    public ConcurrencyException() : base("The record has been modified by another user.") { }

    public ConcurrencyException(string message) : base(message) { }

    public ConcurrencyException(string name, object key)
        : base($"Entity \"{name}\" ({key}) has been modified by another user.") { }
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException() : base("You are not authorized to perform this action.") { }

    public UnauthorizedException(string message) : base(message) { }
}

public class ForbiddenException : Exception
{
    public ForbiddenException() : base("You don't have permission to access this resource.") { }

    public ForbiddenException(string message) : base(message) { }
}
