import re
from typing import Annotated, TypeVar

from pydantic import AfterValidator, StringConstraints, UrlConstraints
from pydantic_core import MultiHostUrl

# Type variable for generic type hints
T = TypeVar("T")

# Custom types
type MongoDsn = Annotated[MultiHostUrl, UrlConstraints(allowed_schemes=["mongodb+srv"])]

type NonEmptyStr = Annotated[
    str, StringConstraints(min_length=1, strip_whitespace=True)
]

type Label = Annotated[
    str, StringConstraints(min_length=1, max_length=100, strip_whitespace=True)
]


def validate_regex(pattern: str) -> str:
    """Validates if the given string is a valid regular expression.

    Args:
        pattern (str): The regular expression pattern to validate.

    Returns:
        str: The validated regular expression pattern.

    Raises:
        ValueError: If the pattern is not a valid regular expression.
    """
    try:
        re.compile(pattern)
        return pattern
    except re.error as err:
        raise ValueError(f"Invalid regular expression pattern: {err}") from err


type Pattern = Annotated[str, AfterValidator(validate_regex)]
