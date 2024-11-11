from datetime import UTC, datetime
from enum import StrEnum
from typing import Annotated, Optional
from uuid import uuid4

from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field, HttpUrl, SecretStr


class AuthProvider(StrEnum):
    """Authentication provider options."""

    EMAIL = "email"
    GOOGLE = "google"


class User(Document):
    """Database model for user."""

    class Settings:
        name = "users"

    id: Annotated[str, Field(default_factory=lambda: uuid4().hex)]
    email: Annotated[EmailStr, Indexed(unique=True)]
    first_name: str
    last_name: str
    picture: HttpUrl | None = None
    hashed_password: str | None = None
    auth_provider: AuthProvider
    is_active: bool = False  # TODO: add email verification
    created_at: datetime = datetime.now(tz=UTC)

    @classmethod
    async def get_by_email(cls, email: EmailStr) -> Optional["User"]:
        """Fetches a user by email.

        Args:
            email (EmailStr): Email of the user.

        Returns:
            Optional[User]: User instance if found, None otherwise.
        """
        return await cls.find_one(cls.email == email)

    def __repr__(self) -> str:
        return f"<User {self.email}>"

    def __str__(self) -> str:
        return self.__repr__()


class UserBase(BaseModel):
    """Base model for user requests and responses."""

    first_name: str = Field(..., min_length=1, max_length=20)
    last_name: str = Field(..., min_length=1, max_length=20)


class UserLogin(BaseModel):
    """Request model for user login."""

    email: EmailStr
    password: SecretStr = Field(..., min_length=6, max_length=64)


class UserCreate(UserBase, UserLogin):
    """Request model for user registration."""


class UserProfile(UserBase):
    """Response model for user profile."""

    email: EmailStr
    picture: HttpUrl | None = None
    auth_provider: AuthProvider


class UserUpdate(BaseModel):
    """Request model for user profile update."""

    first_name: str | None = Field(None, min_length=1, max_length=20)
    last_name: str | None = Field(None, min_length=1, max_length=20)
    password: SecretStr | None = Field(None, min_length=6, max_length=64)
