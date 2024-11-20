from typing import Annotated

from fastapi import Depends

from src.models.user import User
from src.utils.security import CurrentUser as _CurrentUser

# Current authenticated user
CurrentUser = Annotated[User, Depends(_CurrentUser())]

# Current authenticated user with pre-fetched linked documents
CurrentUserWithLinks = Annotated[User, Depends(_CurrentUser(fetch_links=True))]

# Optional current authenticated user with pre-fetched linked documents
OptionalCurrentUserWithLinks = Annotated[
    User | None, Depends(_CurrentUser(fetch_links=True, optional=True))
]
