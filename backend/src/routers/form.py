import logging

from fastapi import APIRouter, Request, status

from src.config import settings
from src.dependencies import (
    CurrentUser,
    CurrentUserWithLinks,
)
from src.exceptions import BadRequestError, EntityNotFoundError, ForbiddenError
from src.models.form import (
    Form,
    FormCreate,
    FormGenerate,
    FormOverview,
    FormRead,
)
from src.models.user import User
from src.utils.form_generation import FormGenerator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forms", tags=["Forms"])


def validate_form_creation_limit(user: User):
    """Validate user's form creation limit.

    Args:
        user (User): The user to validate.

    Raises:
        BadRequestError: If the user has reached the maximum number of forms.
    """
    forms_count = len(user.forms)
    if forms_count >= settings.MAX_FORMS:
        raise BadRequestError(
            f"Maximum number of forms ({settings.MAX_FORMS}) reached."
        )


async def create_form_for_user(form: FormCreate, user: User) -> Form:
    """Creates a new form for a given user.

    Args:
        form (FormCreate): The form data to create.
        user (User): The user who owns the form.

    Returns:
        Form: The newly created form.
    """
    new_form = Form(**form.model_dump(), creator=user)
    await new_form.create()

    logger.info('Created Form: "%s" for User: %s', new_form.title, user)
    return new_form


@router.post(
    "",
    response_model=FormRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_form(form: FormCreate, user: CurrentUserWithLinks):
    """Creates a new form."""
    validate_form_creation_limit(user)
    return await create_form_for_user(form, user)


@router.post(
    "/generate",
    response_model=FormCreate,
    status_code=status.HTTP_200_OK,
)
async def generate_form(
    request: Request, data: FormGenerate, user: CurrentUserWithLinks
):
    """Generates a form based on the given description using a language model."""
    validate_form_creation_limit(user)

    form_generator: FormGenerator = request.app.state.form_generator
    form = await form_generator.generate_form(data.prompt)

    if data.title:
        form.title = data.title

    return await create_form_for_user(form, user)


@router.get(
    "/{form_id}",
    response_model=FormRead,
    status_code=status.HTTP_200_OK,
)
async def get_form(form_id: str):
    """Retrieves a form."""
    form = await Form.get(form_id, fetch_links=True)
    if not form:
        raise EntityNotFoundError("Form not found")

    return FormRead(**form.model_dump())


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


@router.get(
    "",
    response_model=list[FormOverview],
    status_code=status.HTTP_200_OK,
)
async def get_forms(user: CurrentUserWithLinks):
    """Retrieves a list of user's forms."""
    return FormOverview.from_forms(user.forms)
