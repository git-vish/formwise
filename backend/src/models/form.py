from datetime import UTC, datetime
from typing import TYPE_CHECKING, Annotated

from beanie import Document, Link
from pydantic import BaseModel, Field, field_validator

from src.config import settings
from src.models.field import FormField
from src.models.user import UserPublic
from src.utils import generate_unique_id
from src.utils.custom_types import Description, Title

if TYPE_CHECKING:  # pragma: no cover
    from src.models.user import User


class FormCreate(BaseModel):
    """Request model for creating a form."""

    title: Annotated[Title, Field(description="Form title")]
    description: Annotated[
        Description | None,
        Field(None, description="Form description for additional context"),
    ]
    fields: Annotated[
        list[FormField],
        Field(
            default_factory=list,
            description="List of form fields",
            max_length=settings.MAX_FIELDS,
        ),
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
    creator: Link["User"]
    created_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(tz=UTC))]


class FormRead(BaseModel):
    """Response model for a form."""

    id: str
    title: Title
    description: Description | None
    fields: list[FormField]
    is_active: bool
    creator: UserPublic
    created_at: datetime


class FormOverview(BaseModel):
    """Response model for a form (overview)."""

    id: str
    title: Title
    is_active: bool
    response_count: int
    created_at: datetime

    @staticmethod
    def from_forms(form_list: list[Form]) -> list["FormOverview"]:
        """Creates a list of FormOverview instances from a list of Form instances,
        sorted by creation date in descending order.

        Args:
            form_list (list[Form]): List of Form instances.

        Returns:
            list[FormOverview]: List of FormOverview instances.
        """
        form_list.sort(key=lambda form: form.created_at, reverse=True)
        return [
            FormOverview(
                **form.model_dump(),
                # TODO: Add response count
                response_count=0,
            )
            for form in form_list
        ]


class FormGenerate(BaseModel):
    """Request model for generating a form using a language model."""

    title: Title | None = None
    description: Annotated[
        str,
        Field(
            min_length=10,
            max_length=500,
            description="Detailed description of the form to be generated",
        ),
    ]
