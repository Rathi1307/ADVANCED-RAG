"""Custom exceptions and uniform error response envelopes."""

from typing import Any, Optional
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    status: str = "error"
    error: ErrorDetail
    trace_id: Optional[str] = None


class SREPlatformException(Exception):
    """Base exception for all SRE platform errors."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class SecurityViolationException(SREPlatformException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, code="SECURITY_VIOLATION", status_code=400, details=details)


class RateLimitExceededException(SREPlatformException):
    def __init__(self, message: str = "Rate limit exceeded (20 req/min)", details: Optional[Any] = None):
        super().__init__(message, code="RATE_LIMIT_EXCEEDED", status_code=429, details=details)


class TokenBudgetExceededException(SREPlatformException):
    def __init__(self, message: str = "Daily token budget exceeded", details: Optional[Any] = None):
        super().__init__(message, code="TOKEN_BUDGET_EXCEEDED", status_code=429, details=details)


class AuthenticationException(SREPlatformException):
    def __init__(self, message: str = "Invalid or expired token", details: Optional[Any] = None):
        super().__init__(message, code="AUTHENTICATION_FAILED", status_code=401, details=details)


class AuthorizationException(SREPlatformException):
    def __init__(self, message: str = "Insufficient permissions", details: Optional[Any] = None):
        super().__init__(message, code="UNAUTHORIZED", status_code=403, details=details)


class SQLSafetyViolationException(SREPlatformException):
    def __init__(self, message: str = "SQL safety validation failed", details: Optional[Any] = None):
        super().__init__(message, code="SQL_SAFETY_VIOLATION", status_code=400, details=details)
