"""Role-Based Access Control (RBAC) verification."""

from typing import List, Callable, Any, Dict
from fastapi import Depends, HTTPException, status
from app.models.domain import UserRole
from app.security.auth import get_current_user


def require_roles(allowed_roles: List[UserRole]) -> Callable:
    """Enforce that the authenticated user possesses one of the allowed roles."""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        allowed_role_values = [r.value for r in allowed_roles]
        if user_role not in allowed_role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' is not authorized. Required: {allowed_role_values}",
            )
        return current_user
    return role_checker
