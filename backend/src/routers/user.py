from typing import Annotated

from fastapi import APIRouter, Depends, status

from src.models.user import User, UserProfile
from src.utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
)
async def me(user: Annotated[User, Depends(get_current_user)]):
    """Fetches the current authenticated user's profile information."""
    return user
