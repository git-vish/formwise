import logging
from contextlib import asynccontextmanager

import logfire
from asgi_correlation_id import CorrelationIdMiddleware
from beanie import init_beanie
from fastapi import APIRouter, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

from src.config import configure_logging, settings
from src.exceptions.handler import add_exception_handlers
from src.models import DOCUMENT_MODELS
from src.routers import auth, user

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to set up and clean up resources."""
    configure_logging()
    logger.info("Initializing application resources")

    # Initialize Logfire
    if settings.LOGFIRE_TOKEN:
        logfire.configure(
            token=settings.LOGFIRE_TOKEN,
            service_name=settings.APP_TITLE,
            service_version=settings.APP_VERSION,
        )
        logfire.instrument_pymongo()

    # Initialize MongoDB connection
    app.state.db = AsyncIOMotorClient(
        settings.MONGO_CONNECTION_STRING.unicode_string()
    )[settings.MONGO_DATABASE_NAME]

    # Initialize Beanie
    await init_beanie(database=app.state.db, document_models=DOCUMENT_MODELS)
    logger.info("Initialized database resources")

    yield

    logger.info("Cleaning up application resources")


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# Place outside of lifespan, so it can be initialized after app initialization
if settings.LOGFIRE_TOKEN:
    # Exclude top-level routes e.g. /ping, /openapi.json etc
    logfire.instrument_fastapi(app, excluded_urls=r"^(https?://[^/]+)?/[^/]+/?$")


# Add middlewares
app.add_middleware(CorrelationIdMiddleware)

# Place CORS middleware last(executes first) in the middleware stack
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_exception_handlers(app)


@app.get("/ping", status_code=200)
async def ping():
    """Health check endpoint."""
    return {"detail": "pong"}


# API v1 routes
api_v1_router = APIRouter()
api_v1_router.include_router(auth.router)
api_v1_router.include_router(user.router)

app.include_router(api_v1_router, prefix="/api/v1")
