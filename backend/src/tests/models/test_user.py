import pytest

from src.models.user import User


@pytest.mark.anyio
class TestUser:
    async def test_user_get_by_email_found(self, test_user):
        """Tests that a user can be fetched by email."""
        user = await User.get_by_email(test_user.email)
        assert user.email == test_user.email

    async def test_user_get_by_email_not_found(self):
        """Tests that None is returned if the user is not found by email."""
        user = await User.get_by_email("nonexistent_email")
        assert user is None

    async def test_user_repr(self, test_user):
        """Tests that the user's email is returned in the repr."""
        assert repr(test_user) == f"<User {test_user.email}>"

    async def test_user_str(self, test_user):
        """Tests that the user's email is returned in the str."""
        assert str(test_user) == f"<User {test_user.email}>"
