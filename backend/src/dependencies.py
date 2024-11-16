from typing import Annotated

from fastapi import Depends

from src.models.user import User
from src.utils.security import CurrentUser as _CurrentUser

CurrentUser = Annotated[User, Depends(_CurrentUser())]
CurrentUserWithLinks = Annotated[User, Depends(_CurrentUser(fetch_links=True))]
