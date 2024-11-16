from datetime import UTC, datetime, timedelta

import jwt
import pytest
from faker import Faker
from fastapi.security import HTTPAuthorizationCredentials

from src.config import settings
from src.exceptions import AuthenticationError
from src.utils.security import (
    CurrentUser,
    create_access_token,
    get_password_hash,
    verify_password,
)

fake = Faker()


class TestPasswordHashing:
    def test_password_hash(self):
        """Tests password hashing and verification."""
        password = fake.password()
        assert verify_password(password, get_password_hash(password))

    def test_password_hash_uniqueness(self):
        """Tests uniqueness of hashes for the same password."""
        password = fake.password()
        assert get_password_hash(password) != get_password_hash(password)


class TestTokenGeneration:
    def test_create_access_token(self):
        """Tests JWT access token creation."""
        email = fake.email()
        token = create_access_token(email)
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )

        assert payload["sub"] == email
        assert "exp" in payload
        assert "iat" in payload

    def test_token_expiration(self):
        """Tests JWT token expiration timing."""
        email = fake.email()
        token = create_access_token(email)
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )

        exp_delta = datetime.fromtimestamp(payload["exp"], UTC) - datetime.now(UTC)
        assert (
            timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXP - 1)
            < exp_delta
            < timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXP + 1)
        )


@pytest.mark.anyio
class TestCurrentUser:
    current_user = CurrentUser()

    async def test_valid_token(self, test_user, valid_token):
        """Tests that valid token retrieves the correct user."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=valid_token
        )
        retrieved_user = await self.current_user(credentials)
        assert retrieved_user.email == test_user.email

    async def test_expired_token(self, expired_token):
        """Tests that expired token raises exception."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=expired_token
        )
        with pytest.raises(AuthenticationError):
            await self.current_user(credentials)

    async def test_invalid_token(self):
        """Tests that invalid token raises exception."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid_token"
        )
        with pytest.raises(AuthenticationError):
            await self.current_user(credentials)

    async def test_user_not_found(self):
        """Tests that exception is raised if the user is not found."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=create_access_token(email=fake.email())
        )
        with pytest.raises(AuthenticationError):
            await self.current_user(credentials)

    async def test_missing_token_sub(self):
        """Tests that exception is raised if the token 'sub' is missing."""
        token = jwt.encode(
            {}, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
        )
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        with pytest.raises(AuthenticationError):
            await self.current_user(credentials)
