"""
Diagnex Backend — FastAPI Application Entry Point

Mounts all routers, configures CORS, and initializes the database.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.db.init_db import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting Diagnex Backend...")
    init_db()
    logger.info("Database initialized.")
    yield
    logger.info("Shutting down Diagnex Backend.")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Diagnex — Secure Medical Screening API. "
            "⚠️ This system provides screening estimates for research purposes only. "
            "It is NOT a medical diagnostic device. All AI results require clinician review."
        ),
        lifespan=lifespan,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # ── CORS ─────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Global Exception Handler ─────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Never expose internal error details or PHI in responses
        logger.error(f"Unhandled exception: {type(exc).__name__}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "An internal server error occurred. Please try again later."
            },
        )

    # ── Routers ──────────────────────────────────────────────
    from app.api.auth import router as auth_router
    from app.api.screening import router as screening_router
    from app.api.review import router as review_router
    from app.api.uploads import router as uploads_router
    from app.api.admin import router as admin_router
    from app.api.users import router as users_router

    app.include_router(auth_router)
    app.include_router(screening_router)
    app.include_router(review_router)
    app.include_router(uploads_router)
    app.include_router(admin_router)
    app.include_router(users_router)

    # ── Health Check ─────────────────────────────────────────
    @app.get("/api/health", tags=["System"])
    def health_check():
        return {
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "disclaimer": (
                "This system provides screening estimates for research purposes only. "
                "It is NOT a medical diagnostic device."
            ),
        }

    return app


app = create_app()
