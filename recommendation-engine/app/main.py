from fastapi import FastAPI, HTTPException, Depends, Security, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from dotenv import load_dotenv
import logging
from typing import List, Optional
import asyncio

from .models import RecommendationRequest, RecommendationResponse, UserProfile, UserFeedback
from .recommendation_engine import RecommendationEngine
from .database import DatabaseManager
from .auth import verify_api_key, verify_token, verify_supabase_jwt

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        if os.getenv("ENVIRONMENT") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

# Rate limiter setup (using memory storage for free Render instance)
redis_url = os.getenv("REDIS_URL")
if redis_url and redis_url != "memory://":
    # Use Redis if available
    limiter = Limiter(key_func=get_remote_address, storage_uri=redis_url)
else:
    # Use in-memory storage for free tier
    limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")
    logger.info("Using in-memory rate limiting (no Redis configured)")

# Initialize FastAPI app
app = FastAPI(
    title="BITSPARK Recommendation Engine",
    description="Advanced AI-powered recommendation system for dating and social connections",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") == "development" else None
)

# Rate limit exceeded handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware
app.add_middleware(SecurityHeadersMiddleware)

# Trusted host middleware
trusted_hosts = os.getenv("TRUSTED_HOSTS", "localhost,127.0.0.1").split(",")
if os.getenv("ENVIRONMENT") == "production":
    # Only allow specific hosts in production
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

# CORS Configuration with security
def get_allowed_origins():
    origins_str = os.getenv("ALLOWED_ORIGINS", "")
    if not origins_str:
        if os.getenv("ENVIRONMENT") == "production":
            logger.error("ALLOWED_ORIGINS must be set in production")
            raise ValueError("ALLOWED_ORIGINS must be set in production")
        return ["http://localhost:3000"]  # Default for development
    
    origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]
    if not origins and os.getenv("ENVIRONMENT") == "production":
        raise ValueError("ALLOWED_ORIGINS cannot be empty in production")
    
    return origins

allowed_origins = get_allowed_origins()
has_wildcard = "*" in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=not has_wildcard,  # Don't allow credentials with wildcard
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Rate-Limit-Remaining", "X-Rate-Limit-Reset"],
)

# Initialize components
security = HTTPBearer()
db_manager = DatabaseManager()
recommendation_engine = RecommendationEngine(db_manager)

@app.on_event("startup")
async def startup_event():
    """Initialize database connection and recommendation engine"""
    try:
        await db_manager.connect()
        await recommendation_engine.initialize()
        logger.info("Recommendation engine started successfully")
    except Exception as e:
        logger.error(f"Failed to start recommendation engine: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources"""
    await db_manager.disconnect()
    logger.info("Recommendation engine shut down")

@app.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BITSPARK Recommendation Engine",
        "version": "1.0.0"
    }

@app.post("/api/v1/recommendations", response_model=RecommendationResponse)
@limiter.limit("30/minute")
async def get_recommendations(
    request: Request,
    recommendation_request: RecommendationRequest,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """
    Get personalized recommendations for a user
    Requires Supabase JWT authentication
    """
    try:
        # Verify Supabase JWT token
        user_data = await verify_supabase_jwt(credentials.credentials)
        
        # Verify user is BITS student
        if not user_data.get("email", "").endswith((".bits-pilani.ac.in")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted to BITS students only"
            )
        
        # Ensure user can only get their own recommendations
        if recommendation_request.user_id != user_data.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only request your own recommendations"
            )
        
        # Get recommendations
        recommendations = await recommendation_engine.get_recommendations(
            user_id=recommendation_request.user_id,
            recommendation_type=recommendation_request.recommendation_type,
            limit=recommendation_request.limit,
            filters=recommendation_request.filters
        )
        
        return RecommendationResponse(
            user_id=recommendation_request.user_id,
            recommendations=recommendations,
            algorithm_version="2.0",
            generated_at=None  # Will be set automatically
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendations for user {recommendation_request.user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/feedback")
@limiter.limit("60/minute")
async def submit_feedback(
    request: Request,
    feedback: UserFeedback,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """
    Submit user feedback to improve recommendations
    """
    try:
        # Verify Supabase JWT token
        user_data = await verify_supabase_jwt(credentials.credentials)
        
        # Verify user is BITS student
        if not user_data.get("email", "").endswith((".bits-pilani.ac.in")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted to BITS students only"
            )
        
        # Ensure user can only submit feedback for themselves
        if feedback.user_id != user_data.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit feedback for yourself"
            )
        
        await recommendation_engine.record_feedback(
            user_id=feedback.user_id,
            target_user_id=feedback.target_user_id,
            action=feedback.action,
            context=feedback.context
        )
        
        return {"status": "success", "message": "Feedback recorded"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/stats/{user_id}")
@limiter.limit("30/minute")
async def get_user_stats(
    request: Request,
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """
    Get user recommendation statistics
    """
    try:
        # Verify Supabase JWT token
        user_data = await verify_supabase_jwt(credentials.credentials)
        
        # Verify user is BITS student
        if not user_data.get("email", "").endswith((".bits-pilani.ac.in")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted to BITS students only"
            )
        
        # Ensure user can only get their own stats
        if user_id != user_data.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own statistics"
            )
        
        stats = await recommendation_engine.get_user_stats(user_id)
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status": "error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development"
    )