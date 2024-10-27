import logging
from contextlib import asynccontextmanager

from asgi_correlation_id import CorrelationIdMiddleware
from beanie import init_beanie
from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.exception_handlers import http_exception_handler
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

from src.config import configure_logging, settings
from src.models import DOCUMENT_MODELS

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to set up and clean up resources."""
    configure_logging()
    logger.info("Setting up application resources.")
    # Connect to MongoDB
    app.state.db = AsyncIOMotorClient(
        settings.MONGO_CONNECTION_STRING.unicode_string()
    )[settings.MONGO_DATABASE_NAME]

    # Initialize Beanie
    await init_beanie(
        database=app.state.db,
        document_models=DOCUMENT_MODELS,
    )

    logger.info("Application resources set up.")
    yield  # yield control back to the app

    logger.info("Cleaning up application resources.")


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def handle_http_exception(request: Request, exc: HTTPException):
    """Handle HTTP exceptions.
    Called when an HTTPException is raised.
    It logs the exception and returns the HTTP exception.

    Args:
        request (Request): The request.
        exc (HTTPException): The HTTP exception.

    Returns:
        HTTPException: The HTTP exception.
    """
    logger.error(f"HTTPException: {exc.status_code}, {exc.detail}")
    return await http_exception_handler(request, exc)


@app.get("/ping", status_code=200)
async def ping():
    return {"message": "pong"}


# v1 routes
api_v1_router = APIRouter()

app.include_router(api_v1_router, prefix="/api/v1")
