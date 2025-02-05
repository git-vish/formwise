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
    """Registers a new user with an email and password
    and returns a JWT access token.
    """
    logger.info("Registering user: %s", user.email)

    if await User.find_one(User.email == user.email):
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
    logger.info("Registered user: %s", new_user)

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
    user = await User.find_one(User.email == email)

    if not user:
        raise EntityNotFoundError("User not found.")

    if user.auth_provider == AuthProvider.GOOGLE:
        raise BadRequestError("Please sign in with Google.")

    if not verify_password(password, user.hashed_password):
        raise AuthenticationError("Invalid credentials.")

    logger.info("Authenticated user: %s", user)
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


@router.get("/google", status_code=status.HTTP_307_TEMPORARY_REDIRECT)
async def google_auth(request: Request, return_url: AnyHttpUrl):
    """Redirects to Google OAuth2 authorization page."""
    logger.info("Google authentication requested from: %s", return_url.path)
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
        logger.error("Google authentication failed: %s, redirecting to: %s", err, state)
        return RedirectResponse(
            url=f"{state}?error=Could not authenticate with Google",
            status_code=status.HTTP_303_SEE_OTHER,
        )

    logger.info("Google callback succeeded for: %s", google_user.email)
    user = await User.find_one(User.email == google_user.email)
    updated = False

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
        logger.info("Registered user: %s", user)
    else:
        if not user.is_active:
            user.is_active = True
            updated = True
            logger.info("Activated user: %s", user)

        for key in ("picture", "first_name", "last_name"):
            google_value = getattr(google_user, key)
            if getattr(user, key) != google_value:
                setattr(user, key, google_value)
                updated = True
                logger.info("Updated %s for: %s", key, user)

    if updated:
        await user.save()

    access_token = create_access_token(user.email)

    logger.info("Authenticated user: %s, redirecting to: %s", user.email, state)
    return RedirectResponse(
        url=f"{state}?token={access_token}", status_code=status.HTTP_303_SEE_OTHER
    )
