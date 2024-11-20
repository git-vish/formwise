import pytest
from fastapi import status
from httpx import AsyncClient

from src.config import settings
from src.models.form import Form
from src.models.user import User
from src.tests.data import TEST_USER_DATA
from src.tests.helpers import load_json_data

BASE_URL = "/api/v1/forms"


@pytest.mark.anyio
class TestCreateForm:
    @pytest.fixture
    def form_data(self) -> dict:
        """Valid form data fixture."""
        return load_json_data("forms/form.json")

    async def test_create_form_success(
        self, client: AsyncClient, auth_header: dict[str, str], form_data: dict
    ):
        """Tests successful form creation."""
        response = await client.post(BASE_URL, json=form_data, headers=auth_header)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == form_data["title"]
        assert data["description"] == form_data["description"]
        assert len(data["fields"]) == len(form_data["fields"])
        assert data["creator"]["email"] == TEST_USER_DATA["email"]

        assert "id" in data
        assert "is_active" in data
        assert "created_at" in data

        # Verify form was created in database
        form = await Form.get(data["id"], fetch_links=True)
        assert form is not None
        assert form.creator.email == data["creator"]["email"]

    async def test_create_form_success_without_fields(
        self, client: AsyncClient, auth_header: dict[str, str], form_data: dict
    ):
        """Tests successful form creation without fields."""
        form_data["fields"] = []
        response = await client.post(BASE_URL, json=form_data, headers=auth_header)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert len(data["fields"]) == 0

        # Verify form was created in database
        form = await Form.get(data["id"], fetch_links=True)
        assert form is not None

    async def test_create_form_success_with_constraints(
        self, client: AsyncClient, auth_header: dict[str, str]
    ):
        """Tests successful form creation with constraints."""
        form_data = load_json_data("forms/form_constraints.json")
        response = await client.post(BASE_URL, json=form_data, headers=auth_header)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert len(data["fields"]) == len(form_data["fields"])

        # Verify form was created in database
        form = await Form.get(data["id"], fetch_links=True)
        assert form is not None

        # Verify field constraints
        for form_data_field, form_field in zip(
            form_data["fields"], form.fields, strict=False
        ):
            assert form_data_field.items() <= form_field.model_dump(mode="json").items()

    async def test_create_form_unauthorized(self, client: AsyncClient, form_data: dict):
        """Tests unauthorized form creation attempt."""
        response = await client.post(BASE_URL, json=form_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_create_form_exceeds_max_forms(
        self, client: AsyncClient, test_user: User, auth_header: dict[str, str]
    ):
        """Tests form creation when user has reached maximum forms limit."""
        form_data = load_json_data("forms/form_single_field.json")

        # Create maximum allowed forms
        for _ in range(settings.MAX_FORMS):
            form = Form(
                **form_data,
                creator=test_user,
            )
            await form.create()

        # Attempt to create a new form
        response = await client.post(BASE_URL, json=form_data, headers=auth_header)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["detail"] == (
            f"Maximum number of forms ({settings.MAX_FORMS}) reached."
        )

    async def test_create_form_exceeds_max_fields(
        self, client: AsyncClient, auth_header: dict[str, str]
    ):
        """Tests form creation with too many fields."""
        form_data = load_json_data("forms/form_single_field.json")

        # Exceed the maximum number of fields
        fields = form_data["fields"] * (settings.MAX_FIELDS + 1)
        form_data["fields"] = fields

        response = await client.post(BASE_URL, json=form_data, headers=auth_header)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["detail"] == (
            f"Maximum number of fields ({settings.MAX_FIELDS}) exceeded."
        )

    async def test_create_form_empty_body(
        self, client: AsyncClient, auth_header: dict[str, str]
    ):
        """Tests form creation with empty body."""
        response = await client.post(BASE_URL, json={}, headers=auth_header)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_create_form_missing_title(
        self, client: AsyncClient, auth_header: dict[str, str], form_data: dict
    ):
        """Tests form creation with missing title."""
        form_data.pop("title")
        response = await client.post(BASE_URL, json=form_data, headers=auth_header)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "invalid_data",
        [
            {"title": ""},
            {"title": "a" * 101},
            {"description": ""},
            {"description": "a" * 301},
            {"fields": [{"type": "invalid", "label": "Invalid field"}]},
        ],
        ids=[
            "empty_title",
            "long_title",
            "empty_description",
            "long_description",
            "invalid_field_type",
        ],
    )
    async def test_create_form_validation_errors(
        self,
        client: AsyncClient,
        auth_header: dict[str, str],
        form_data: dict,
        invalid_data: dict,
    ):
        """Tests form creation with invalid data."""
        form_data.update(invalid_data)
        response = await client.post(BASE_URL, json=form_data, headers=auth_header)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY