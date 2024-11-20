import logging

from fastapi import APIRouter, HTTPException, status

from src.config import settings
from src.dependencies import CurrentUserWithLinks, OptionalCurrentUserWithLinks
from src.exceptions import BadRequestError
from src.models.form import Form, FormCreate, FormRead, FormReadPublic, FormUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.post(
    "",
    response_model=FormRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_form(form: FormCreate, user: CurrentUserWithLinks):
    """Creates a new form."""
    # Check if user has reached form limit
    forms_count = len(user.forms)
    if forms_count >= settings.MAX_FORMS:
        raise BadRequestError(
            f"Maximum number of forms ({settings.MAX_FORMS}) reached."
        )

    # Check fields limit
    if len(form.fields) > settings.MAX_FIELDS:
        raise BadRequestError(
            f"Maximum number of fields ({settings.MAX_FIELDS}) exceeded."
        )

    # Create form
    new_form = Form(**form.model_dump(), creator=user)
    await new_form.create()

    logger.info('Created Form: "%s" for User: %s', new_form.title, user)
    return new_form


@router.get(
    "/{form_id}",
    response_model=FormRead | FormReadPublic,
    status_code=status.HTTP_200_OK,
)
async def get_form(form_id: str, user: OptionalCurrentUserWithLinks):
    """Retrieves a form."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)


@router.delete(
    "/{form_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_form(form_id: str, user: CurrentUserWithLinks):
    """Deletes a form and its submissions (if owned by the user)."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)


@router.patch(
    "/{form_id}",
    response_model=FormRead,
    status_code=status.HTTP_200_OK,
)
async def update_form(form_id: str, update: FormUpdate, user: CurrentUserWithLinks):
    """Updates an existing form (if owned by the user)."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)
