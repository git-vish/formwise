from unittest import mock
from urllib.parse import parse_qs, urlparse

import pytest
from faker import Faker
from fastapi import status
from fastapi.datastructures import URL
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials
from fastapi_sso import OpenID
from httpx import AsyncClient
from pydantic_core import Url

from src.models.user import AuthProvider, User
from src.tests.data import TEST_USER_DATA
from src.utils.security import get_current_user

fake = Faker()
BASE_URL = "/api/v1/auth"


@pytest.mark.anyio
class TestRegistration:
    URL = f"{BASE_URL}/register"

    async def test_register_new_user(self, client: AsyncClient):
        """Tests successful user registration."""
        email = fake.email()
        first_name = fake.first_name()
        last_name = fake.last_name()
        response = await client.post(
            self.URL,
            json={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "password": fake.password(),
            },
        )

        assert response.status_code == status.HTTP_201_CREATED

        # Verify access token
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        token = data["access_token"]
        user = await get_current_user(
            credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        )
        assert user.email == email
        assert user.first_name == first_name
        assert user.last_name == last_name
        assert user.auth_provider == AuthProvider.EMAIL

    async def test_register_existing_email(self, client: AsyncClient, test_user: User):
        """Tests registration failure with existing email."""
        response = await client.post(
            self.URL,
            json={
                "email": test_user.email,
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "password": fake.password(),
            },
        )
        assert response.status_code == status.HTTP_409_CONFLICT

    @pytest.mark.parametrize(
        "email",
        ["notanemail", "@nodomain", "missing@.com", "", None],
    )
    async def test_register_invalid_email(self, client: AsyncClient, email):
        """Tests registration failure with invalid email."""
        response = await client.post(
            self.URL,
            json={
                "email": email,
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "password": fake.password(),
            },
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "password",
        ["short", "a" * 256, "", None],
    )
    async def test_register_invalid_password(self, client: AsyncClient, password):
        """Tests registration failure with invalid password."""
        response = await client.post(
            self.URL,
            json={
                "email": fake.email(),
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "password": password,
            },
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "first_name, last_name",
        [("a" * 256, "b"), ("a", "b" * 256), ("", ""), (None, None)],
    )
    async def test_register_invalid_fields(
        self, client: AsyncClient, first_name: str, last_name: str
    ):
        """Tests registration failure with invalid fields."""
        response = await client.post(
            self.URL,
            json={
                "email": fake.email(),
                "first_name": first_name,
                "last_name": last_name,
                "password": fake.password(),
            },
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.anyio
class TestLogin:
    URL = f"{BASE_URL}/login"

    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Tests successful user login."""
        response = await client.post(
            self.URL,
            json={"email": test_user.email, "password": TEST_USER_DATA["password"]},
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
            self.URL,
            json={"email": test_user.email, "password": "wrong_password"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Tests login failure for non-existent user."""
        response = await client.post(
            self.URL,
            json={"email": fake.email(), "password": fake.password()},
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_login_google_user(self, client: AsyncClient, test_google_user: User):
        """Tests login failure for Google user."""
        response = await client.post(
            self.URL,
            json={"email": test_google_user.email, "password": fake.password()},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.anyio
@mock.patch("src.routers.auth.google_sso")
class TestGoogleAuth:
    URL = f"{BASE_URL}/google"
    CALLBACK_URL = f"{BASE_URL}/google/callback"

    async def test_google_auth_redirect(self, mock_google_sso, client: AsyncClient):
        """Tests successful Google auth redirect."""
        mock_google_sso.get_login_redirect = mock.AsyncMock(
            return_value=RedirectResponse("https://google.com/auth")
        )
        return_url = Url("https://example.com/callback")

        response = await client.get(f"{self.URL}?return_url={return_url}")

        assert response.status_code == status.HTTP_307_TEMPORARY_REDIRECT
        assert response.headers["Location"] == "https://google.com/auth"

        mock_google_sso.get_login_redirect.assert_called_once_with(
            redirect_uri=URL(f"{client.base_url}{self.CALLBACK_URL}"),
            state=return_url,
        )

    async def test_google_auth_missing_return_url(
        self, mock_google_sso, client: AsyncClient
    ):
        """Tests Google auth redirect failure with missing return URL."""
        mock_google_sso.get_login_redirect = mock.AsyncMock()

        response = await client.get(f"{self.URL}")

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert mock_google_sso.get_login_redirect.call_count == 0


@pytest.mark.anyio
@mock.patch("src.routers.auth.google_sso")
class TestGoogleAuthCallback:
    URL = f"{BASE_URL}/google/callback"
    state = "https://example.com/callback"

    @staticmethod
    def mock_sso_user(user: User | None = None) -> OpenID:
        """Mocks user data returned by Google SSO."""
        if user:
            return OpenID(
                id=fake.uuid4(),
                email=user.email,
            )
        return OpenID(
            id=fake.uuid4(),
            email=fake.email(),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            picture=fake.image_url(),
        )

    async def test_google_callback_new_user_success(
        self, mock_google_sso, client: AsyncClient
    ):
        """Tests successful Google callback for new user."""
        mock_sso_user = self.mock_sso_user()
        mock_google_sso.verify_and_process = mock.AsyncMock(return_value=mock_sso_user)

        response = await client.get(f"{self.URL}?code=fake_code&state={self.state}")

        assert response.status_code == status.HTTP_303_SEE_OTHER

        # Verify access token
        redirect_url = response.headers["Location"]
        token = parse_qs(urlparse(redirect_url).query)["token"][0]

        user = await get_current_user(
            credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        )
        assert user.is_active
        assert user.email == mock_sso_user.email
        assert user.first_name == mock_sso_user.first_name
        assert user.last_name == mock_sso_user.last_name
        assert user.picture == Url(mock_sso_user.picture)
        assert user.auth_provider == AuthProvider.GOOGLE

    async def test_google_callback_email_user_success(
        self, mock_google_sso, client: AsyncClient, test_user: User
    ):
        """Tests successful Google callback for existing user."""
        mock_sso_user = self.mock_sso_user(test_user)
        mock_google_sso.verify_and_process = mock.AsyncMock(return_value=mock_sso_user)

        response = await client.get(f"{self.URL}?code=fake_code&state={self.state}")

        assert response.status_code == status.HTTP_303_SEE_OTHER

        # Verify access token
        redirect_url = response.headers["Location"]
        token = parse_qs(urlparse(redirect_url).query)["token"][0]

        user = await get_current_user(
            credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        )
        assert user.email == mock_sso_user.email
        assert user.auth_provider == AuthProvider.EMAIL

    async def test_google_callback_google_user_success(
        self, mock_google_sso, client: AsyncClient, test_google_user: User
    ):
        """Tests successful Google callback for existing Google user."""
        mock_sso_user = self.mock_sso_user(test_google_user)
        mock_google_sso.verify_and_process = mock.AsyncMock(return_value=mock_sso_user)

        response = await client.get(f"{self.URL}?code=fake_code&state={self.state}")

        assert response.status_code == status.HTTP_303_SEE_OTHER

        # Verify access token
        redirect_url = response.headers["Location"]
        token = parse_qs(urlparse(redirect_url).query)["token"][0]

        user = await get_current_user(
            credentials=HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        )
        assert user.email == mock_sso_user.email
        assert user.auth_provider == AuthProvider.GOOGLE

    async def test_google_callback_verification_failure(
        self, mock_google_sso, client: AsyncClient
    ):
        """Tests Google callback error due to verification failure."""
        mock_google_sso.verify_and_process = mock.AsyncMock(
            side_effect=Exception("Verification failed")
        )

        response = await client.get(f"{self.URL}?code=fake_code&state={self.state}")

        assert response.status_code == status.HTTP_303_SEE_OTHER
        assert response.headers["Location"].startswith(f"{self.state}?error=")

    async def test_google_callback_missing_state(
        self, mock_google_sso, client: AsyncClient
    ):
        """Tests Google callback failure with missing state."""
        mock_google_sso.verify_and_process = mock.AsyncMock()

        response = await client.get(f"{self.URL}?code=fake_code")

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert mock_google_sso.verify_and_process.call_count == 0
