import pytest
from faker import Faker
from fastapi import status
from httpx import AsyncClient

from src.models.user import User
from src.tests.data import TEST_USER_DATA
from src.utils.security import verify_password

fake = Faker()

BASE_URL = "/api/v1/users"


@pytest.mark.anyio
class TestUserProfile:
    URL = f"{BASE_URL}/me"

    async def test_get_profile_success(
        self, client: AsyncClient, test_user: User, auth_header: dict[str, str]
    ):
        """Tests that authenticated user info is retrieved correctly."""
        response = await client.get(self.URL, headers=auth_header)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["email"] == test_user.email
        assert data["auth_provider"] == test_user.auth_provider

    async def test_get_profile_unauthorized(self, client: AsyncClient):
        """Tests unauthorized access to user info."""
        response = await client.get(self.URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.anyio
class TestUserProfileUpdate:
    URL = f"{BASE_URL}/me"

    async def test_update_profile_success(
        self, client: AsyncClient, test_user: User, auth_header: dict[str, str]
    ):
        """Tests successful profile update."""
        update = {"first_name": fake.first_name(), "last_name": fake.last_name()}
        response = await client.patch(
            self.URL,
            headers=auth_header,
            json=update,
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify profile update
        await test_user.sync()
        assert test_user.first_name == update["first_name"]
        assert test_user.last_name == update["last_name"]

    async def test_update_password_success(
        self, client: AsyncClient, test_user: User, auth_header: dict[str, str]
    ):
        """Tests successful password update."""
        update = {"password": fake.password()}
        response = await client.patch(
            self.URL,
            headers=auth_header,
            json=update,
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify password update
        await test_user.sync()
        assert verify_password(update["password"], test_user.hashed_password)

    async def test_update_profile_no_changes(
        self, client: AsyncClient, test_user: User, auth_header: dict[str, str]
    ):
        """Tests profile update with no changes."""
        update = {
            "first_name": test_user.first_name,
            "last_name": test_user.last_name,
            "password": TEST_USER_DATA["password"],
        }
        response = await client.patch(
            self.URL,
            headers=auth_header,
            json=update,
        )

        assert response.status_code == status.HTTP_304_NOT_MODIFIED

    async def test_update_profile_none_values(
        self, client: AsyncClient, test_user: User, auth_header: dict[str, str]
    ):
        """Tests profile update with None values."""
        update = {
            "first_name": fake.first_name(),
            "last_name": None,
        }
        response = await client.patch(
            self.URL,
            headers=auth_header,
            json=update,
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify profile update
        await test_user.sync()
        assert test_user.first_name == update["first_name"]
        assert test_user.last_name == TEST_USER_DATA["last_name"]

    @pytest.mark.parametrize(
        "field,invalid_value",
        [
            ("first_name", "a" * 256),
            ("last_name", ""),
            ("password", "short"),
            ("password", "a" * 256),
        ],
    )
    async def test_update_profile_invalid_fields(
        self,
        client: AsyncClient,
        test_user: User,
        auth_header: dict[str, str],
        field: str,
        invalid_value: str,
    ):
        """Tests profile update with invalid fields."""
        update = {field: invalid_value}
        response = await client.patch(
            self.URL,
            headers=auth_header,
            json=update,
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_update_profile_unauthorized(self, client: AsyncClient):
        """Tests unauthorized profile update attempt."""
        update_data = {"first_name": fake.first_name()}
        response = await client.patch(self.URL, json=update_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN
