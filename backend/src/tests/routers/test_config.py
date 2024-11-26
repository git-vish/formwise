import pytest
from fastapi import status
from httpx import AsyncClient

from src.config import settings


@pytest.mark.anyio
class TestGetConfig:
    async def test_get_config_success(self, client: AsyncClient):
        """Tests successful app config retrieval."""
        response = await client.get("/api/v1/config")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["max_forms"] == settings.MAX_FORMS
        assert data["max_fields"] == settings.MAX_FIELDS
        assert data["max_responses"] == settings.MAX_RESPONSES
