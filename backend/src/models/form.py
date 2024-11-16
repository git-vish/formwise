from datetime import UTC, datetime
from typing import Annotated

from beanie import Document, Link
from pydantic import BaseModel, Field, field_validator

from src.models.field import FormField
from src.models.user import User, UserPublic
from src.utils import generate_unique_id
from src.utils.types import Description, Title


class FormCreate(BaseModel):
    """Request model for creating a form."""

    title: Annotated[Title, Field(description="Form title")]
    description: Annotated[
        Description | None,
        Field(None, description="Form description for additional context"),
    ]
    fields: Annotated[
        list[FormField],
        Field(default_factory=list, description="List of form fields"),
    ]

    @field_validator("fields")
    @classmethod
    def ensure_unique_field_tags(cls, fields: list[FormField]) -> list[FormField]:
        """Ensures field tags are unique across the form."""
        seen_tags = set()
        for field in fields:
            if field.tag in seen_tags:
                field.tag = generate_unique_id(prefix=field.type)
            seen_tags.add(field.tag)
        return fields


class Form(Document, FormCreate):
    """Database model for form."""

    class Settings:
        name = "forms"

    id: Annotated[str, Field(default_factory=generate_unique_id)]
    is_active: bool = True
    created_by: Link[User]
    created_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(tz=UTC))]


class FormUpdate(BaseModel):
    """Request model for updating a form."""

    title: Title | None = None
    description: Description | None = None
    fields: list[FormField] | None = None
    is_active: bool | None = None


class FormRead(BaseModel):
    """Response model for a form."""

    id: str
    title: Title
    description: Description | None
    fields: list[FormField]
    is_active: bool
    created_by: UserPublic
    created_at: datetime