import pytest
from fastapi import status
from httpx import AsyncClient

from src.models.user import User

BASE_URL = "/api/v1/users"


@pytest.mark.anyio
class TestUserInfo:
    URL = f"{BASE_URL}/me"

    async def test_get_me_success(
        self, client: AsyncClient, test_user: User, auth_header: dict[str, str]
    ):
        """Tests that authenticated user info is retrieved correctly."""
        response = await client.get(self.URL, headers=auth_header)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["email"] == test_user.email
        assert data["auth_provider"] == test_user.auth_provider

    async def test_get_me_unauthorized(self, client: AsyncClient):
        """Tests unauthorized access to user info."""
        response = await client.get(self.URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN
