from fastapi import APIRouter, status

from src.dependencies import CurrentUserWithLinks
from src.models.dashboard import DashboardForm

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/forms",
    response_model=list[DashboardForm],
    status_code=status.HTTP_200_OK,
)
async def get_dashboard_forms(user: CurrentUserWithLinks):
    """Retrieves a list of user's forms for the dashboard."""
    return DashboardForm.from_form_list(user.forms)
