import logging

from fastapi import APIRouter, Request, status
from fastapi.responses import RedirectResponse
from fastapi_sso import OpenID
from fastapi_sso.sso.google import GoogleSSO
from pydantic import AnyHttpUrl

from src.config import settings
from src.exceptions import (
    AuthenticationError,
    BadRequestError,
    EntityAlreadyExistsError,
    EntityNotFoundError,
)
from src.models.auth import Token
from src.models.user import AuthProvider, User, UserCreate, UserLogin
from src.utils.security import create_access_token, get_password_hash, verify_password

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

google_sso = GoogleSSO(
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
)


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
        EntityNotFoundError: If user is not found.
        BadRequestError: If user is authenticated with Google.
        AuthenticationError: If authentication fails.
    """
    user = await User.get_by_email(email=email)

    if not user:
        raise EntityNotFoundError("User not found.")

    if user.auth_provider == AuthProvider.GOOGLE:
        raise BadRequestError("Please login with Google.")

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


@router.get("/google", status_code=status.HTTP_303_SEE_OTHER)
async def google_auth(request: Request, return_url: AnyHttpUrl):
    """Redirects to Google OAuth2 authorization page."""
    logger.info(f"Google authentication requested from: {return_url.path}")
    async with google_sso:
        return await google_sso.get_login_redirect(
            redirect_uri=request.url_for("google_auth_callback"),
            state=return_url,
        )


@router.get(
    "/google/callback", status_code=status.HTTP_303_SEE_OTHER, include_in_schema=False
)
async def google_auth_callback(request: Request, state: AnyHttpUrl):
    """Handles Google OAuth2 callback and redirects to the state URL."""
    try:
        logger.info("Processing Google callback")
        async with google_sso:
            google_user: OpenID = await google_sso.verify_and_process(request)
    except Exception as err:
        logger.error(f"Google authentication failed: {err}, redirecting to: {state}")
        return RedirectResponse(
            url=f"{state}?error=Could not authenticate with Google",
            status_code=status.HTTP_303_SEE_OTHER,
        )

    logger.info(f"Google callback succeeded for: {google_user.email}")
    user = await User.get_by_email(email=google_user.email)

    if not user:
        user = User(
            email=google_user.email,
            first_name=google_user.first_name,
            last_name=google_user.last_name,
            picture=google_user.picture,
            auth_provider=AuthProvider.GOOGLE,
            is_active=True,
        )
        await user.create()
        logger.info(f"Created user: {user}")

    access_token = create_access_token(user.email)

    logger.info(f"Authenticated user: {user}, redirecting to: {state}")
    return RedirectResponse(
        url=f"{state}?token={access_token}", status_code=status.HTTP_303_SEE_OTHER
    )
