"""Authentication API router."""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import User
from app.models.request import LoginRequest
from app.models.response import AuthTokenResponse
from app.security.auth import verify_password, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=AuthTokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate SRE engineer and issue JWT access token."""
    stmt = select(User).where(User.username == payload.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token_data = {
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "email": user.email,
    }
    access_token = create_access_token(data=token_data)

    return AuthTokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        username=user.username,
        role=user.role,
    )
