from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.endpoints import health

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        description="Secure backend for the Diagnex medical screening platform."
    )

    # Set all CORS enabled origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/health", tags=["health"])
    
    from app.api.endpoints import auth, profiles, admin, assistant
    app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
    app.include_router(profiles.router, prefix=f"{settings.API_V1_STR}/profiles", tags=["profiles"])
    app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
    app.include_router(assistant.router, prefix=f"{settings.API_V1_STR}/assistant", tags=["assistant"])
    
    return app

app = create_app()
