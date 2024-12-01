from asyncio import sleep

import pytest
from fastapi import FastAPI, status
from httpx import ASGITransport, AsyncClient

from src.middlewares.rate_limit import RateLimitMiddleware

LIMITED_PATH = "/limited"
NON_LIMITED_PATH = "/unlimited"
DELTA = 1  # 1-second window
LIMIT = 2  # Allow 2 requests


@pytest.fixture
async def rate_limit_client() -> AsyncClient:
    """Async test client with rate limit middleware."""
    app = FastAPI()

    app.add_middleware(
        RateLimitMiddleware,
        paths=[LIMITED_PATH],
        delta=DELTA,
        limit=LIMIT,
    )

    @app.get(LIMITED_PATH)
    async def limited():
        return {"detail": "OK"}

    @app.get(NON_LIMITED_PATH)
    async def unlimited():
        return {"detail": "OK"}

    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.mark.anyio
class TestRateLimitMiddleware:
    async def test_rate_limit_within_limit(self, rate_limit_client: AsyncClient):
        """Tests that requests within the rate limit are allowed."""
        for _ in range(LIMIT):
            response = await rate_limit_client.get(LIMITED_PATH)
            assert response.status_code == status.HTTP_200_OK
            assert response.json() == {"detail": "OK"}

    async def test_rate_limit_exceeds_limit(self, rate_limit_client: AsyncClient):
        """Tests that exceeding the rate limit returns 429 status."""
        for _ in range(LIMIT):
            await rate_limit_client.get(LIMITED_PATH)

        response = await rate_limit_client.get(LIMITED_PATH)
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert response.json() == {
            "detail": "Rate limit exceeded. Please try again later."
        }

    async def test_rate_limit_reset_limit(self, rate_limit_client: AsyncClient):
        """Tests that rate limit is reset after DELTA seconds."""
        for _ in range(LIMIT):
            await rate_limit_client.get(LIMITED_PATH)

        response = await rate_limit_client.get(LIMITED_PATH)
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

        await sleep(DELTA)
        response = await rate_limit_client.get(LIMITED_PATH)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"detail": "OK"}

    async def test_rate_limit_non_rate_limited_path(
        self, rate_limit_client: AsyncClient
    ):
        """Tests that paths not in the rate-limited list are unaffected."""
        for _ in range(LIMIT + 1):
            response = await rate_limit_client.get(NON_LIMITED_PATH)
            assert response.status_code == status.HTTP_200_OK
            assert response.json() == {"detail": "OK"}
