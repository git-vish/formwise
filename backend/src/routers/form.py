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
    FormResponse,
    FormResponseRead,
    FormSubmission,
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

    logger.info('Created Form: "%s" for User: %s', new_form.id, user)
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

    try:
        form = await form_generator.generate_form(data.prompt)
    except Exception as err:
        raise BadRequestError("Failed to generate form. Please try again.") from err

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
        raise EntityNotFoundError("Form not found.")

    return FormRead(**form.model_dump())


@router.delete(
    "/{form_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_form(form_id: str, user: CurrentUser):
    """Deletes a form and its submissions (if owned by the user)."""
    form = await Form.get(form_id, fetch_links=True)
    if not form:
        raise EntityNotFoundError("Form not found.")

    if form.creator.id != user.id:
        raise ForbiddenError("Not authorized to delete this form.")

    # Delete form responses
    await FormResponse.find(FormResponse.form.id == form.id).delete()
    # Delete form
    await form.delete()

    logger.info('Deleted Form: "%s" for User: %s', form.id, user)


@router.get(
    "",
    response_model=list[FormOverview],
    status_code=status.HTTP_200_OK,
)
async def get_forms(user: CurrentUserWithLinks):
    """Retrieves a list of user's forms."""
    return await FormOverview.from_forms(user.forms)


@router.post(
    "/{form_id}/submit",
    status_code=status.HTTP_200_OK,
)
async def submit_response(form_id: str, submission: FormSubmission):
    """Submits a form response."""
    form = await Form.get(form_id)
    if not form:
        raise EntityNotFoundError("Form not found.")

    if not form.is_active:
        raise ForbiddenError("Form is not active.")

    # Validate submission
    invalid_fields = {}
    validated_answers = {}

    for field in form.fields:
        answer = submission.answers.get(field.tag)

        if not answer:
            if field.required:
                invalid_fields[field.tag] = "Field is required."
            else:
                validated_answers[field.tag] = None
            continue

        try:
            validated_answers[field.tag] = field.validate_answer(answer)
        except ValueError as err:
            invalid_fields[field.tag] = str(err)

    if invalid_fields:
        raise BadRequestError(invalid_fields)

    # Save form response
    new_response = FormResponse(form=form, answers=validated_answers)
    await new_response.create()
    logger.info("Submitted response for form: %s", form.id)

    # Check if form response limit has been reached
    response_count = await FormResponse.find(FormResponse.form.id == form.id).count()
    if response_count >= settings.MAX_RESPONSES:
        form.is_active = False
        await form.save()
        logger.info("Form response limit reached, disabling form: %s", form.id)

    return {"detail": "Form response submitted successfully."}


@router.get(
    "/{form_id}/responses",
    response_model=list[FormResponseRead],
    status_code=status.HTTP_200_OK,
)
async def get_form_responses(
    form_id: str, user: CurrentUser, limit: int = 10, skip: int = 0
):
    """Retrieves a list of form responses."""
    form = await Form.get(form_id, fetch_links=True)
    if not form:
        raise EntityNotFoundError("Form not found.")

    if form.creator.id != user.id:
        raise ForbiddenError("Not authorized to view this form.")

    return (
        await FormResponse.find(FormResponse.form.id == form.id)
        .sort("-created_at")
        .limit(limit)
        .skip(skip)
        .to_list()
    )
