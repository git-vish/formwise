import logging

from fastapi import APIRouter, status

from src.exceptions import (
    AuthenticationError,
    EntityAlreadyExistsError,
    EntityNotFoundError,
)
from src.models.auth import Token
from src.models.user import AuthProvider, User, UserCreate, UserLogin
from src.utils.security import create_access_token, get_password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

logger = logging.getLogger(__name__)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Registers a new user with an email and password.
    Returns a success message if the user is created.
    """
    logger.info(f"Registering user: {user.email}")

    if await User.get_by_email(email=user.email):
        raise EntityAlreadyExistsError("User with this email already exists.")

    hashed_password = get_password_hash(user.password.get_secret_value())
    new_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        auth_provider=AuthProvider.EMAIL,
    )
    await new_user.create()
    logger.info(f"Registered user: {new_user}")

    return Token(access_token=create_access_token(new_user.email))


async def authenticate_user(email: str, password: str) -> User:
    """Authenticates a user by verifying their email and password.

    Args:
        email (str): User email.
        password (str): User password.

    Returns:
        User: Authenticated User instance.

    Raises:
        HTTPException: If authentication fails.
    """
    user = await User.get_by_email(email=email)

    if not user:
        raise EntityNotFoundError("User not found.")

    if not verify_password(password, user.hashed_password):
        raise AuthenticationError("Invalid credentials.")

    logger.info(f"Authenticated user: {user}")
    return user


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
)
async def login(user: UserLogin):
    """Logs in an existing user and returns a JWT access token
    if the login is successful.
    """
    user = await authenticate_user(user.email, user.password.get_secret_value())
    return Token(access_token=create_access_token(user.email))
