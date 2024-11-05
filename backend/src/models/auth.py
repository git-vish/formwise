from pydantic import BaseModel


class Token(BaseModel):
    """Response model for access token."""

    access_token: str
    token_type: str = "bearer"
