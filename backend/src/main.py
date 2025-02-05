import logging
from contextlib import asynccontextmanager

import logfire
from beanie import init_beanie
from fastapi import FastAPI, status
from motor.motor_asyncio import AsyncIOMotorClient

from src.config import configure_logging, settings
from src.exceptions.handler import add_exception_handlers
from src.middlewares import add_middlewares
from src.models import DOCUMENT_MODELS
from src.routers import include_routers
from src.utils.form_generation import FormGenerator

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
    app.state.db = AsyncIOMotorClient(settings.MONGO_URI.unicode_string())[
        settings.MONGO_DB_NAME
    ]

    # Initialize Beanie
    await init_beanie(database=app.state.db, document_models=DOCUMENT_MODELS)
    logger.info("Initialized database resources")

    # Initialize form generator
    app.state.form_generator = FormGenerator()
    logger.info("Initialized form generator")

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
add_middlewares(app)

# Add exception handlers
add_exception_handlers(app)

# Include routers
include_routers(app)


@app.get("/ping", status_code=status.HTTP_200_OK)
async def ping():
    """Health check endpoint."""
    return {"detail": "pong"}
