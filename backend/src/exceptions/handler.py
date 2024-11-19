import logging
from collections.abc import Callable

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src.exceptions import (
    AuthenticationError,
    BadRequestError,
    EntityAlreadyExistsError,
    EntityNotFoundError,
    ForbiddenError,
    FormwiseError,
)

logger = logging.getLogger(__name__)

# Type alias for exception handler function
FormwiseExceptionHandler = Callable[[Request, FormwiseError], JSONResponse]


def create_formwise_exception_handler(
    status_code: int, default_message: str
) -> FormwiseExceptionHandler:
    """Creates exception handler function for FormwiseError exceptions."""

    async def exception_handler(_: Request, exc: FormwiseError) -> JSONResponse:
        message = default_message if exc.message is None else exc.message
        logger.error("Error %s: %s", status_code, message)
        return JSONResponse(status_code=status_code, content={"detail": message})

    return exception_handler


# Exception handler configuration mapping
FORMWISE_EXCEPTION_HANDLERS = {
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
    BadRequestError: {
        "status_code": status.HTTP_400_BAD_REQUEST,
        "message": "Invalid request.",
    },
    ForbiddenError: {
        "status_code": status.HTTP_403_FORBIDDEN,
        "message": "Not authenticated.",
    },
}


async def validation_exception_handler(_: Request, exc: RequestValidationError):
    filtered_errors = [
        error for error in exc.errors() if error.get("type") != "literal_error"
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": filtered_errors}),
    )


def add_exception_handlers(app: FastAPI) -> None:
    """Add exception handlers to the FastAPI application.

    Args:
        app: FastAPI application instance.
    """
    # FormwiseError exception handlers
    for exception_class, config in FORMWISE_EXCEPTION_HANDLERS.items():
        app.add_exception_handler(
            exc_class_or_status_code=exception_class,
            handler=create_formwise_exception_handler(
                status_code=config["status_code"], default_message=config["message"]
            ),
        )

    # Validation exception handler
    app.add_exception_handler(
        exc_class_or_status_code=RequestValidationError,
        handler=validation_exception_handler,
    )
