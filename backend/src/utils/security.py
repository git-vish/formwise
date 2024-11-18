import logging
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext

from src.config import settings
from src.exceptions import AuthenticationError
from src.models.user import User

logger = logging.getLogger(__name__)

PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
http_scheme = HTTPBearer()


def get_password_hash(password: str) -> str:
    """Hashes the provided password.

    Args:
        password (str): Password to hash.

    Returns:
        str: Hashed password.
    """
    return PWD_CONTEXT.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verifies a password against its hash.

    Args:
        password (str): Password to verify.
        hashed_password (str): Hashed password.

    Returns:
        bool: True if password matches, False otherwise.
    """
    return PWD_CONTEXT.verify(password, hashed_password)


def create_access_token(email: str) -> str:
    """Creates a JWT access token for the given email.

    Args:
        email (str): Email of the user.

    Returns:
        str: Encoded JWT token.
    """
    payload = {
        "sub": email,
        "exp": datetime.now(UTC) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES),
        "iat": datetime.now(UTC),
    }
    return jwt.encode(
        payload=payload, key=settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )


class CurrentUser:
    """
    Dependency to fetch the current authenticated user.

    Attributes:
        optional (bool): Whether authentication is optional.
        fetch_links (bool): Whether to fetch linked documents in the User model.
    """

    def __init__(self, optional: bool = False, fetch_links: bool = False):
        self.optional = optional
        self.fetch_links = fetch_links

    async def __call__(
        self, credentials: Annotated[HTTPAuthorizationCredentials, Depends(http_scheme)]
    ) -> User | None:
        """Validates JWT token and retrieves the user.
        If `optional` is True, returns None if the token is not present.

        Args:
            credentials: Bearer token credentials from request.

        Returns:
            User: The authenticated user.

        Raises:
            HTTPException: If the token is invalid or user not found.
        """
        token = credentials.credentials

        if self.optional and not token:
            return

        try:
            payload = jwt.decode(
                token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
        except jwt.PyJWTError as err:
            raise AuthenticationError("Could not validate credentials.") from err

        if (email := payload.get("sub")) and (
            user := await User.find_one(
                User.email == email, fetch_links=self.fetch_links
            )
        ):
            return user

        raise AuthenticationError("Could not validate credentials.")
