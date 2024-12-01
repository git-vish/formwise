from datetime import UTC, datetime
from enum import StrEnum
from typing import TYPE_CHECKING, Annotated
from uuid import uuid4

from beanie import BackLink, Document, Indexed
from pydantic import BaseModel, EmailStr, Field, HttpUrl

from src.utils.custom_types import Name, Password

if TYPE_CHECKING:  # pragma: no cover
    from src.models.form import Form


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
    first_name: Name
    last_name: Name
    picture: HttpUrl | None = None
    hashed_password: str | None = None
    auth_provider: AuthProvider
    is_active: bool = False  # TODO: add email verification
    created_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(tz=UTC))]

    forms: Annotated[
        list[BackLink["Form"]], Field(json_schema_extra={"original_field": "creator"})
    ]

    def __repr__(self) -> str:
        return f"<User {self.email}>"

    def __str__(self) -> str:
        return self.__repr__()


class UserBase(BaseModel):
    """Base model for user requests and responses."""

    first_name: Name
    last_name: Name


class UserLogin(BaseModel):
    """Request model for user login."""

    email: EmailStr
    password: Password


class UserCreate(UserBase, UserLogin):
    """Request model for user registration."""


class UserProfile(UserBase):
    """Response model for user profile."""

    email: EmailStr
    picture: HttpUrl | None = None
    auth_provider: AuthProvider


class UserUpdate(BaseModel):
    """Request model for user profile update."""

    first_name: Name | None = None
    last_name: Name | None = None
    password: Password | None = None


class UserPublic(BaseModel):
    """Response model for user public profile."""

    first_name: Name
    last_name: Name
    email: EmailStr


# Rebuild the model to resolve forward references
User.model_rebuild()
