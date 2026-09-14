from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
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
    # Lightweight in-process guardrail. Production Nginx adds stricter per-route limits.
    request_counts: dict[str, tuple[int, float]] = {}
    @app.middleware("http")
    async def rate_limit(request: Request, call_next):
        import time
        client = request.client.host if request.client else "unknown"; key=f"{client}:{request.url.path}"
        count, started = request_counts.get(key, (0, time.monotonic()))
        now=time.monotonic()
        if now-started > 60: count,started=0,now
        count += 1; request_counts[key]=(count,started)
        limit=8 if request.url.path.startswith("/api/v1/reports") else 60
        if count>limit: return JSONResponse({"detail":"Too many requests. Please try again shortly."},status_code=429)
        return await call_next(request)

    app.include_router(health.router, prefix="/health", tags=["health"])
    
    from app.api.endpoints import auth, profiles, admin, assistant, datasets, research_predictions, uploads, imaging, patient_workflow, reports, specialists
    app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
    app.include_router(profiles.router, prefix=f"{settings.API_V1_STR}/profiles", tags=["profiles"])
    app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
    app.include_router(assistant.router, prefix=f"{settings.API_V1_STR}/assistant", tags=["assistant"])
    app.include_router(datasets.router, prefix=f"{settings.API_V1_STR}/research/datasets", tags=["research datasets"])
    app.include_router(research_predictions.router, prefix=f"{settings.API_V1_STR}/research/predictions", tags=["research predictions"])
    app.include_router(uploads.router, prefix=f"{settings.API_V1_STR}/reports", tags=["patient reports"])
    app.include_router(imaging.router, prefix=f"{settings.API_V1_STR}/imaging", tags=["clinical imaging"])
    app.include_router(patient_workflow.router, prefix=f"{settings.API_V1_STR}/patient", tags=["patient workflow"])
    app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/saved-reports", tags=["saved reports"])
    app.include_router(specialists.router, prefix=f"{settings.API_V1_STR}/specialists", tags=["specialist directory"])
    
    return app

app = create_app()
