from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import redis
from openai import OpenAI

from .api.v1.routes import router as v1_router
from .models.schemas import Base
from .api.v1.routes import engine
from .core.config import settings
from .core.logging import RequestContextLogMiddleware, logger

# Create database tables (including pgvector extension)
def init_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
    except Exception as e:
        logger.info(f"Vector extension setup note: {e}")
        
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Occupyo API",
    description="Enterprise-grade, AI-driven B2B Commercial Real Estate (CRE) platform.",
    version="1.0.0"
)

# Logging Middleware
app.add_middleware(RequestContextLogMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(v1_router, prefix="/api/v1")

@app.on_event("startup")
def startup_event():
    logger.info("Starting up Occupyo Backend...")
    init_db()

@app.get("/api/v1/health/ready")
def health_ready():
    """Enriched health-check verifying connections to PostgreSQL, Redis, and OpenAI."""
    health_status = {"status": "ok", "checks": {}}
    
    # Check Postgres
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["checks"]["postgres"] = "up"
    except Exception as e:
        logger.error(f"Postgres health check failed: {e}")
        health_status["checks"]["postgres"] = "down"
        health_status["status"] = "error"
        
    # Check Redis
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        health_status["checks"]["redis"] = "up"
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        health_status["checks"]["redis"] = "down"
        health_status["status"] = "error"
        
    # Check OpenAI
    try:
        # A simple lightweight call to check if API key is valid and service is up
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        client.models.list()
        health_status["checks"]["openai"] = "up"
    except Exception as e:
        logger.error(f"OpenAI health check failed: {e}")
        health_status["checks"]["openai"] = "down"
        health_status["status"] = "error"
        
    if health_status["status"] == "error":
        raise HTTPException(status_code=503, detail=health_status)
        
    return health_status

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}
