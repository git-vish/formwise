from typing import Annotated

from pydantic import StringConstraints, UrlConstraints
from pydantic_core import MultiHostUrl

# Custom types
type MongoDsn = Annotated[MultiHostUrl, UrlConstraints(allowed_schemes=["mongodb+srv"])]

type NonEmptyStr = Annotated[
    str, StringConstraints(min_length=1, strip_whitespace=True)
]

type Label = Annotated[
    str, StringConstraints(min_length=1, max_length=100, strip_whitespace=True)
]
