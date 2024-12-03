from abc import ABC, abstractmethod
from collections.abc import Iterable
from datetime import date, datetime
from enum import StrEnum
from typing import Annotated, Literal, Self, Union

from email_validator import validate_email
from pydantic import (
    AnyHttpUrl,
    BaseModel,
    Field,
    PositiveInt,
    field_validator,
    model_validator,
)

from src.utils import generate_unique_id
from src.utils.custom_types import HelpText, Option, Title


class FieldType(StrEnum):
    """Field type options."""

    # Text-based fields
    TEXT = "text"
    PARAGRAPH = "paragraph"

    # Selection fields
    SELECT = "select"
    MULTI_SELECT = "multi_select"
    DROPDOWN = "dropdown"

    # Input fields
    DATE = "date"
    EMAIL = "email"
    NUMBER = "number"
    URL = "url"


class BaseField(BaseModel, ABC):
    """Base class for all form fields."""

    type: FieldType
    tag: Annotated[str, Field("", description="Unique identifier for the field")]
    label: Annotated[Title, Field(description="Human-readable field label")]
    help_text: Annotated[
        HelpText | None,
        Field(None, description="Additional guidance for field completion"),
    ]
    required: Annotated[
        bool, Field(True, description="Whether this field must be filled")
    ]

    @model_validator(mode="after")
    def _generate_field_tag(self) -> Self:
        """Generates a unique tag for the field."""
        if not self.tag:
            self.tag = generate_unique_id(prefix=self.type)
        return self

    @abstractmethod
    def validate_answer(self, answer):
        """Validates the user's answer.

        Args:
            answer: The user-provided answer to validate.

        Returns:
            The validated and possibly transformed answer.

        Raises:
            ValueError: If the answer fails validation.
        """


# Descriptions to avoid duplication
_MIN_LENGTH_DESC = "Minimum number of characters required"
_MAX_LENGTH_DESC = "Maximum number of characters allowed"


class TextBase(BaseModel):
    """Mixin for text fields with length constraints."""

    min_length: Annotated[PositiveInt, Field(1, description=_MIN_LENGTH_DESC)]
    max_length: Annotated[PositiveInt, Field(50, description=_MAX_LENGTH_DESC)]

    @model_validator(mode="after")
    def validate_length_constraints(self) -> Self:
        """Ensures that min_length does not exceed max_length."""
        if self.min_length > self.max_length:
            raise ValueError("min_length cannot exceed max_length.")
        return self

    def validate_length(self, answer: str) -> str:
        """Validates the length of the answer to be within the specified range.

        Args:
            answer: The user-provided answer to validate.

        Returns:
            The validated and stripped answer.

        Raises:
            ValueError: If the answer fails validation.
        """
        if not (self.min_length <= len(answer) <= self.max_length):
            raise ValueError(
                f"Answer length must be between {self.min_length} and {self.max_length} characters."  # noqa: E501
            )
        return answer


class TextField(BaseField, TextBase):
    """Single-line text input field."""

    type: Literal[FieldType.TEXT] = FieldType.TEXT

    def validate_answer(self, answer: str) -> str:
        return self.validate_length(answer)


class ParagraphField(BaseField, TextBase):
    """Multi-line text input field."""

    type: Literal[FieldType.PARAGRAPH] = FieldType.PARAGRAPH
    max_length: Annotated[PositiveInt, Field(500, description=_MAX_LENGTH_DESC)]

    def validate_answer(self, answer: str) -> str:
        return self.validate_length(answer)


class SelectionBase(BaseModel):
    """Mixin for fields with predefined options."""

    options: Annotated[
        list[Option], Field(description="List of available choices", min_length=1)
    ]

    @field_validator("options")
    @classmethod
    def ensure_unique_options(cls, options: list[Option]) -> list[Option]:
        """Ensures all options are unique."""
        return list(set(options))

    def validate_single_choice(self, answer: str) -> str:
        if answer not in set(self.options):
            raise ValueError("Answer must be one of the available options.")
        return answer


class SelectField(BaseField, SelectionBase):
    """Single-choice selection field."""

    type: Literal[FieldType.SELECT] = FieldType.SELECT

    def validate_answer(self, answer: str) -> str:
        return self.validate_single_choice(answer)


class DropdownField(BaseField, SelectionBase):
    """Dropdown selection field."""

    type: Literal[FieldType.DROPDOWN] = FieldType.DROPDOWN

    def validate_answer(self, answer: str) -> str:
        return self.validate_single_choice(answer)


class MultiSelectField(BaseField, SelectionBase):
    """Multiple-choice selection field."""

    type: Literal[FieldType.MULTI_SELECT] = FieldType.MULTI_SELECT

    def validate_answer(self, answer: str | Iterable[str]) -> list[str]:
        if isinstance(answer, str) or not isinstance(answer, Iterable):
            answer = [answer]

        if not set(answer) <= set(self.options):
            raise ValueError("All selections must be from available options")

        return answer


class DateField(BaseField):
    """Date input field."""

    type: Literal[FieldType.DATE] = FieldType.DATE
    min_date: Annotated[date | None, Field(None, description="Earliest allowed date")]
    max_date: Annotated[date | None, Field(None, description="Latest allowed date")]

    @model_validator(mode="after")
    def validate_date_constraints(self) -> Self:
        """Validates date range constraints."""
        if self.min_date and self.max_date and self.min_date > self.max_date:
            raise ValueError("min_date cannot exceed max_date")

        return self

    def validate_answer(self, answer: Union[str, date]) -> date:  # noqa: UP007
        try:
            if not isinstance(answer, date):
                answer = datetime.strptime(answer, "%Y-%m-%d").date()
        except (ValueError, TypeError) as err:
            raise ValueError("Invalid date format. Use YYYY-MM-DD") from err

        if self.min_date and answer < self.min_date:
            raise ValueError(f"Date must be on or after {self.min_date}")

        if self.max_date and answer > self.max_date:
            raise ValueError(f"Date must be on or before {self.max_date}")

        return answer


class EmailField(BaseField):
    """Email input field."""

    type: Literal[FieldType.EMAIL] = FieldType.EMAIL

    def validate_answer(self, answer: str) -> str:
        return validate_email(answer).normalized


class NumberField(BaseField):
    """Numeric input field."""

    type: Literal[FieldType.NUMBER] = FieldType.NUMBER
    min_value: Annotated[float | None, Field(None, description="Minimum allowed value")]
    max_value: Annotated[float | None, Field(None, description="Maximum allowed value")]
    precision: Annotated[PositiveInt, Field(2, description="Number of decimal places")]

    @model_validator(mode="after")
    def validate_range_constraints(self) -> Self:
        """Validates numeric range constraints."""
        if self.min_value and self.max_value and self.min_value > self.max_value:
            raise ValueError("min_value cannot exceed max_value")
        return self

    def validate_answer(self, answer: str | int | float) -> int | float:
        try:
            if isinstance(answer, str):
                answer = float(answer)
        except (TypeError, ValueError) as err:
            raise ValueError("Answer must be a valid number.") from err

        if self.min_value and answer < self.min_value:
            raise ValueError(f"Answer must be >= {self.min_value}")

        if self.max_value and answer > self.max_value:
            raise ValueError(f"Answer must be <= {self.max_value}")

        if not isinstance(answer, int):
            return round(answer, self.precision)
        return answer


class URLField(BaseField):
    """URL input field."""

    type: Literal[FieldType.URL] = FieldType.URL

    def validate_answer(self, answer: str) -> str:
        try:
            return AnyHttpUrl(answer).unicode_string()
        except ValueError as err:
            raise ValueError(
                "Answer must be a valid URL. Example: https://example.com"
            ) from err


# Type alias
type FormField = (
    TextField
    | ParagraphField
    | SelectField
    | DropdownField
    | MultiSelectField
    | DateField
    | EmailField
    | NumberField
    | URLField
)
