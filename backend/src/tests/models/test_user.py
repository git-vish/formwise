import pytest


@pytest.mark.anyio
class TestUser:
    async def test_user_repr(self, test_user):
        """Tests that the user's email is returned in the repr."""
        assert repr(test_user) == f"<User {test_user.email}>"

    async def test_user_str(self, test_user):
        """Tests that the user's email is returned in the str."""
        assert str(test_user) == f"<User {test_user.email}>"
