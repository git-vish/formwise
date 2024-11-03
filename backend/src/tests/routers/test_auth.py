import pytest
from faker import Faker
from fastapi import status
from fastapi.security import HTTPAuthorizationCredentials
from httpx import AsyncClient

from src.models.user import AuthProvider, User
from src.tests.data import TEST_USER_PASSWORD
from src.utils.security import get_current_user

fake = Faker()


@pytest.mark.anyio
class TestRegistration:
    async def test_register_new_user(self, client: AsyncClient):
        """Tests successful user registration."""
        email = fake.email()
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": fake.password()},
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.json() == {"detail": "Registration successful"}

        # Verify user was created in database
        user = await User.get_by_email(email)
        assert user.auth_provider == AuthProvider.EMAIL

    async def test_register_existing_email(self, client: AsyncClient, test_user: User):
        """Tests registration failure with existing email."""
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": test_user.email, "password": fake.password()},
        )
        assert response.status_code == status.HTTP_409_CONFLICT

    @pytest.mark.parametrize(
        "email",
        ["notanemail", "@nodomain", "missing@.com", "", None],
    )
    async def test_register_invalid_email(self, client: AsyncClient, email):
        """Tests registration failure with invalid email."""
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": fake.password()},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "password",
        ["short", "a" * 65, "", None],
    )
    async def test_register_invalid_password(self, client: AsyncClient, password):
        """Tests registration failure with invalid password."""
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": fake.email(), "password": password},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.anyio
class TestLogin:
    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Tests successful user login."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": TEST_USER_PASSWORD},
        )
        assert response.status_code == status.HTTP_200_OK

        # Verify access token
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        token = data["access_token"]
        user = await get_current_user(
            credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        )
        assert user.email == test_user.email

    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        """Tests login failure with wrong password."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "wrong_password"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Tests login failure for non-existent user."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": fake.email(), "password": fake.password()},
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
