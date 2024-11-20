__all__ = [
    "FormwiseError",
    "EntityNotFoundError",
    "EntityAlreadyExistsError",
    "AuthenticationError",
    "BadRequestError",
]


class FormwiseError(Exception):
    """Base exception for all formwise exceptions."""

    def __init__(self, message: str = ""):
        self.message = message
        super().__init__(self.message)


class EntityNotFoundError(FormwiseError):
    """Raised when an entity is not found."""


class EntityAlreadyExistsError(FormwiseError):
    """Raised when a user already exists."""


class AuthenticationError(FormwiseError):
    """Raised when authentication fails."""


class BadRequestError(FormwiseError):
    """Raised when a bad request is made."""
