import logging

from fastapi import APIRouter, HTTPException, status

from src.config import settings
from src.dependencies import (
    CurrentUser,
    CurrentUserWithLinks,
    OptionalCurrentUserWithLinks,
)
from src.exceptions import BadRequestError, EntityNotFoundError, ForbiddenError
from src.models.form import (
    Form,
    FormConfig,
    FormCreate,
    FormOverview,
    FormRead,
    FormReadPublic,
    FormUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.get(
    "/config",
    response_model=FormConfig,
    status_code=status.HTTP_200_OK,
)
async def get_form_config():
    """Retrieves form configuration."""
    return FormConfig(
        max_forms=settings.MAX_FORMS,
        max_fields=settings.MAX_FIELDS,
        max_responses=settings.MAX_RESPONSES,
    )


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
    form = await Form.get(form_id, fetch_links=True)
    if not form:
        raise EntityNotFoundError("Form not found")

    # Return form data for creator
    if user and user.id == form.creator.id:
        return FormRead(**form.model_dump())

    # Return public form data
    return FormReadPublic(**form.model_dump())


@router.delete(
    "/{form_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_form(form_id: str, user: CurrentUser):
    """Deletes a form and its submissions (if owned by the user)."""
    form = await Form.get(form_id, fetch_links=True)
    if not form:
        raise EntityNotFoundError("Form not found")

    if form.creator.id != user.id:
        raise ForbiddenError("Not authorized to delete this form.")

    await form.delete()
    # TODO: Implement deletion of form submissions
    logger.info('Deleted Form: "%s" for User: %s', form.title, user)


@router.patch(
    "/{form_id}",
    response_model=FormRead,
    status_code=status.HTTP_200_OK,
)
async def update_form(form_id: str, update: FormUpdate, user: CurrentUserWithLinks):
    """Updates an existing form (if owned by the user)."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)


@router.get(
    "",
    response_model=list[FormOverview],
    status_code=status.HTTP_200_OK,
)
async def get_forms(user: CurrentUserWithLinks):
    """Retrieves a list of user's forms."""
    return FormOverview.from_forms(user.forms)
