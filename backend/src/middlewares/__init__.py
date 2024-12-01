from asgi_correlation_id import CorrelationIdMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings

from .rate_limit import RateLimitMiddleware

__all__ = ["add_middlewares"]


def add_middlewares(app: FastAPI) -> None:
    """Adds middlewares to the FastAPI application.

    Args:
        app: FastAPI application instance.
    """
    app.add_middleware(
        RateLimitMiddleware,
        paths=["/api/v1/forms/generate"],
    )

    app.add_middleware(CorrelationIdMiddleware)

    # Place CORS middleware last(executes first) in the middleware stack
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
