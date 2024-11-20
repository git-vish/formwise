import logging

from fastapi import APIRouter, Response, status

from src.dependencies import CurrentUser
from src.models.user import UserProfile, UserUpdate
from src.utils.security import get_password_hash, verify_password

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
)
async def profile(user: CurrentUser):
    """Retrieves the current authenticated user's profile information."""
    return user


@router.patch(
    "/me",
    response_model=UserProfile | None,
    status_code=status.HTTP_200_OK,
)
async def update_profile(update: UserUpdate, user: CurrentUser):
    """Updates the current authenticated user's profile information."""
    logger.info("Updating profile for user: %s", user)

    updates = update.model_dump(exclude_unset=True, exclude_none=True)
    modified = False

    if "password" in updates:
        new_password = updates["password"].get_secret_value()
        if not verify_password(new_password, user.hashed_password):
            user.hashed_password = get_password_hash(new_password)
            modified = True
        updates.pop("password")

    for key, value in updates.items():
        if getattr(user, key) != value:
            setattr(user, key, value)
            modified = True

    if not modified:
        logger.info("Profile update skipped for user: %s", user)
        return Response(status_code=status.HTTP_304_NOT_MODIFIED)

    await user.save()
    logger.info("Profile updated for user: %s", user)
    return user
