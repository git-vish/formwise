from pydantic import BaseModel

from src.config import settings

from .form import Form
from .user import User

# Resolve references for all models
Form.model_rebuild()
User.model_rebuild()


class Config(BaseModel):
    """Response model for config."""

    max_forms: int = settings.MAX_FORMS
    max_fields: int = settings.MAX_FIELDS
    max_responses: int = settings.MAX_RESPONSES


DOCUMENT_MODELS = [User, Form]

__all__ = [
    "Config",
    "DOCUMENT_MODELS",
]
