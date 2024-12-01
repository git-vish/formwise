from typing import Annotated

from pydantic import SecretStr, StringConstraints, UrlConstraints
from pydantic_core import MultiHostUrl

type MongoDsn = Annotated[MultiHostUrl, UrlConstraints(allowed_schemes=["mongodb+srv"])]

type Name = Annotated[
    str, StringConstraints(min_length=1, max_length=20, strip_whitespace=True)
]

type Password = Annotated[SecretStr, StringConstraints(min_length=6, max_length=64)]

type Title = Annotated[
    str, StringConstraints(min_length=1, max_length=100, strip_whitespace=True)
]

type HelpText = Annotated[
    str, StringConstraints(min_length=1, max_length=200, strip_whitespace=True)
]

type Option = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]

type Description = Annotated[
    str, StringConstraints(min_length=1, max_length=300, strip_whitespace=True)
]

type Prompt = Annotated[
    str, StringConstraints(min_length=50, max_length=1000, strip_whitespace=True)
]
