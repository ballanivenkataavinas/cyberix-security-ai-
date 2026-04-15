"""
CyberGuard AI - Main Application
"""
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from pathlib import Path

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, ai, logs
from app.core.security import create_default_users

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="CyberGuard AI",
    description="Production-Grade AI Cybersecurity Assistant",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Create database tables
Base.metadata.create_all(bind=engine)

# Create default users
create_default_users()

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(ai.router, prefix="/ai", tags=["AI Services"])
app.include_router(logs.router, prefix="/logs", tags=["Security Logs"])

# Mount static files
frontend_path = Path(__file__).parent.parent / "frontend"
app.mount("/assets", StaticFiles(directory=frontend_path / "assets"), name="assets")

# Serve frontend
@app.get("/")
async def serve_frontend():
    return FileResponse(frontend_path / "index.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CyberGuard AI"}
