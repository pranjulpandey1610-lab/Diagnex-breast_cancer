import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.worker.celery_app import celery_app
from app.core.config import settings
import redis

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
def health_check():
    return {"status": "ok", "service": "Diagnex Backend API"}

@router.get("/db")
def db_health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "service": "Database"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database connection failed")

@router.get("/redis")
def redis_health_check():
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        return {"status": "ok", "service": "Redis"}
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Redis connection failed")
