import random
from datetime import datetime

from pydantic import BaseModel

from src.config import settings
from src.models.form import Form
from src.utils.types import Title


class DashboardForm(BaseModel):
    """Response model for a form (dashboard)."""

    id: str
    title: Title
    created_at: datetime
    is_active: bool
    response_count: int

    @staticmethod
    def from_form(form: Form) -> "DashboardForm":
        """Creates a DashboardForm from a Form.

        Args:
            form (Form): Form to create DashboardForm from.

        Returns:
            DashboardForm: DashboardForm created from Form.
        """
        return DashboardForm(
            **form.model_dump(),
            # TODO: Add response count
            response_count=random.randint(0, settings.MAX_RESPONSES),
        )

    @staticmethod
    def from_form_list(form_list: list[Form]) -> list["DashboardForm"]:
        """Creates a list of DashboardForms from a list of Forms.

        Args:
            form_list (list[Form]): List of Forms to create DashboardForms from.

        Returns:
            list[DashboardForm]: List of DashboardForms created from Forms.
        """
        form_list.sort(key=lambda form: form.created_at, reverse=True)
        return [DashboardForm.from_form(form) for form in form_list]
