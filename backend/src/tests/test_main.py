import pytest
from fastapi import status
from httpx import AsyncClient


@pytest.mark.anyio
class TestPing:
    async def test_ping(self, client: AsyncClient):
        """Test that ping endpoint returns pong."""
        response = await client.get("/ping")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"detail": "pong"}
