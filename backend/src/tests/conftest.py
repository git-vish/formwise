from collections.abc import AsyncGenerator
from unittest import mock

import pytest
from beanie import init_beanie
from faker import Faker
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient

from src.config import settings
from src.main import app
from src.models import DOCUMENT_MODELS
from src.models.user import AuthProvider, User
from src.tests.data import TEST_USER_DATA
from src.utils.security import create_access_token, get_password_hash

fake = Faker()

TEST_DATABASE_NAME = f"formwise_{fake.word()}"


@pytest.fixture(scope="session")
def anyio_backend():
    """Async I/O backend."""
    return "asyncio"


@pytest.fixture(autouse=True)
async def database() -> AsyncGenerator:
    """Sets and cleans up the test database."""
    client = AsyncIOMotorClient(settings.MONGO_CONNECTION_STRING.unicode_string())
    db = client[TEST_DATABASE_NAME]
    await init_beanie(database=db, document_models=DOCUMENT_MODELS)
    yield
    # Cleanup
    for collection in await db.list_collection_names():
        await db[collection].drop()
    client.close()


@pytest.fixture
async def client() -> AsyncClient:
    """Async test client."""
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.fixture
async def test_user() -> User:
    """Creates a test user."""
    user = User(
        email=TEST_USER_DATA["email"],
        first_name=TEST_USER_DATA["first_name"],
        last_name=TEST_USER_DATA["last_name"],
        hashed_password=get_password_hash(TEST_USER_DATA["password"]),
        auth_provider=AuthProvider.EMAIL,
    )
    await user.create()
    return user


@pytest.fixture
async def test_google_user() -> User:
    """Creates a test user with Google auth provider."""
    user = User(
        email=TEST_USER_DATA["email"],
        first_name=TEST_USER_DATA["first_name"],
        last_name=TEST_USER_DATA["last_name"],
        picture=fake.image_url(),
        is_active=True,
        auth_provider=AuthProvider.GOOGLE,
    )
    await user.create()
    return user


@pytest.fixture
async def valid_token(test_user: User) -> str:
    """Creates a valid JWT token."""
    return create_access_token(test_user.email)


@pytest.fixture
async def expired_token(test_user: User) -> str:
    """Creates an expired JWT token."""
    with mock.patch.object(settings, "JWT_ACCESS_TOKEN_EXP", -1):
        return create_access_token(test_user.email)


@pytest.fixture
async def auth_header(valid_token: str) -> dict[str, str]:
    """Auth header with valid token."""
    return {"Authorization": f"Bearer {valid_token}"}
