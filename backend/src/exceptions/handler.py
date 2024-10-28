import logging
from collections.abc import Callable

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from src.exceptions import (
    AuthenticationError,
    EntityAlreadyExistsError,
    EntityNotFoundError,
    FormwiseError,
)

logger = logging.getLogger(__name__)

# Type alias for exception handler function
ExceptionHandler = Callable[[Request, FormwiseError], JSONResponse]


def create_exception_handler(
    status_code: int, default_message: str
) -> ExceptionHandler:
    """Creates exception handler function for FastAPI application."""

    async def exception_handler(_: Request, exc: FormwiseError) -> JSONResponse:
        message = default_message if exc.message is None else exc.message
        logger.error(f"{status_code}, {message}")
        return JSONResponse(status_code=status_code, content={"detail": message})

    return exception_handler


# Exception handler configuration mapping
EXCEPTION_HANDLERS = {
    EntityNotFoundError: {
        "status_code": status.HTTP_404_NOT_FOUND,
        "message": "Entity does not exist.",
    },
    EntityAlreadyExistsError: {
        "status_code": status.HTTP_409_CONFLICT,
        "message": "Entity already exists.",
    },
    AuthenticationError: {
        "status_code": status.HTTP_401_UNAUTHORIZED,
        "message": "Authentication failed.",
    },
}


def add_exception_handlers(app: FastAPI) -> None:
    """Add exception handlers to the FastAPI application.

    Args:
        app: FastAPI application instance.
    """
    for exception_class, config in EXCEPTION_HANDLERS.items():
        app.add_exception_handler(
            exc_class_or_status_code=exception_class,
            handler=create_exception_handler(
                status_code=config["status_code"], default_message=config["message"]
            ),
        )
