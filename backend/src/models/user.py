from datetime import UTC, datetime
from enum import StrEnum
from typing import Annotated, Optional
from uuid import uuid4

from beanie import Document, Indexed, SaveChanges, Update, before_event
from pydantic import BaseModel, EmailStr, Field, HttpUrl, SecretStr


class AuthProvider(StrEnum):
    """Enumeration for authentication providers."""

    EMAIL = "email"
    GOOGLE = "google"


class UserAuth(BaseModel):
    """Model for user creation and login request."""

    email: EmailStr
    password: SecretStr


class UserInfo(BaseModel):
    """Model for user info response."""

    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    picture: HttpUrl | None = None
    auth_provider: AuthProvider


class UserUpdate(BaseModel):
    """Model for user update request."""

    first_name: str | None = None
    last_name: str | None = None
    password: SecretStr | None = None


class User(Document):
    """Database model for user."""

    class Settings:
        name = "users"

    id: Annotated[str, Field(default_factory=lambda: uuid4().hex)]
    email: Annotated[EmailStr, Indexed(unique=True)]
    first_name: str | None = None
    last_name: str | None = None
    picture: HttpUrl | None = None
    hashed_password: str | None = None
    auth_provider: AuthProvider
    is_active: bool = False  # TODO: add email verification
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(tz=UTC))

    @before_event(Update, SaveChanges)
    def _set_updated_at(self) -> None:
        """Sets updated_at before updating."""
        self.updated_at = datetime.now(tz=UTC)

    @classmethod
    async def get_by_email(cls, email: EmailStr) -> Optional["User"]:
        """Retrieves a user by email.

        Args:
            email (EmailStr): Email of the user.

        Returns:
            Optional["User"]: User object or None if not found.
        """
        return await cls.find_one(cls.email == email)

    def __repr__(self) -> str:
        return f"<User {self.email}>"

    def to_info(self) -> UserInfo:
        """Converts User to UserInfo."""
        return UserInfo.model_validate(self.model_dump())
