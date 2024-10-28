from pydantic import BaseModel


class Token(BaseModel):
    """Model for access token response."""

    access_token: str
    token_type: str = "bearer"
