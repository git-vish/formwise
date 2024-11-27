from fastapi import APIRouter, FastAPI, status

from src.models import Config

from .auth import router as auth
from .form import router as form
from .user import router as user

__all__ = [
    "include_routers",
]

v1_router = APIRouter()


@v1_router.get("/config", response_model=Config, status_code=status.HTTP_200_OK)
def get_config():
    """Retrieves app configuration."""
    return Config()


def include_routers(app: FastAPI) -> None:
    """
    Includes API v1 routers in a FastAPI application.

    Args:
        app: FastAPI application instance.
    """
    v1_router.include_router(auth)
    v1_router.include_router(user)
    v1_router.include_router(form)

    app.include_router(v1_router, prefix="/api/v1")
