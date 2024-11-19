import logging

from fastapi import APIRouter, HTTPException, status

from src.dependencies import CurrentUserWithLinks, OptionalCurrentUserWithLinks
from src.models.form import FormCreate, FormRead, FormReadPublic, FormUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.post(
    "/",
    response_model=FormRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_form(form: FormCreate, user: CurrentUserWithLinks):
    """Creates a new form."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)


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
