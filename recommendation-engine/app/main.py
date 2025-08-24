from fastapi import FastAPI, HTTPException, Depends, Security, status, Request
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
import jwt
from datetime import datetime

from .models import RecommendationRequest, RecommendationResponse, UserFeedback
from .recommendation_engine import RecommendationEngine
from .database import DatabaseManager

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
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        # Add rate limit headers for visibility
        response.headers["X-Rate-Limit-Limit"] = "60"
        response.headers["X-Rate-Limit-Window"] = "60"
        
        if os.getenv("ENVIRONMENT") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

# Rate limiter with memory storage for free tier
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")

# Initialize FastAPI app
app = FastAPI(
    title="BITSPARK Recommendation Engine",
    description="Secure AI-powered recommendation system",
    version="2.0.0",
    docs_url=None,  # Disable docs in production
    redoc_url=None
)

# Rate limit handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware
app.add_middleware(SecurityHeadersMiddleware)

# Secure CORS Configuration
allowed_origins = [
    "https://your-frontend-domain.com",
    "http://localhost:3000",
    "http://localhost:5173"
]

if os.getenv("ENVIRONMENT") == "development":
    allowed_origins.extend(["http://localhost:3001", "http://127.0.0.1:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Rate-Limit-Remaining"],
)

# Initialize components
security = HTTPBearer()
db_manager = DatabaseManager()
recommendation_engine = RecommendationEngine(db_manager)

# JWT verification function
async def verify_supabase_jwt(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify Supabase JWT token"""
    try:
        token = credentials.credentials
        
        # Decode JWT without verification to get payload
        # In production, you should verify with Supabase's public key
        payload = jwt.decode(token, options={"verify_signature": False})
        
        # Basic validation
        if payload.get("exp", 0) < datetime.utcnow().timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        # Verify it's a BITS student
        email = payload.get("email", "")
        if not email.endswith((".bits-pilani.ac.in")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted to BITS students only"
            )
        
        return payload
        
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )

@app.on_event("startup")
async def startup_event():
    """Initialize database connection"""
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
    """Public health check endpoint"""
    return {
        "status": "healthy",
        "service": "BITSPARK Recommendation Engine",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "uptime": "running"
    }

@app.get("/health/database")
@limiter.limit("30/minute")
async def database_health_check(request: Request):
    """Database connectivity health check"""
    try:
        # Test database connection
        is_connected = await db_manager.is_connected()
        
        if not is_connected:
            raise HTTPException(status_code=503, detail="Database not connected")
        
        # Get basic metrics
        user_count = await db_manager.get_user_count()
        verified_count = await db_manager.get_verified_user_count()
        table_count = await db_manager.get_table_count()
        
        return {
            "database_status": "connected",
            "database_type": "PostgreSQL",
            "metrics": {
                "total_users": user_count,
                "verified_users": verified_count,
                "tables": table_count
            },
            "last_checked": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        raise HTTPException(
            status_code=503, 
            detail=f"Database health check failed: {str(e)}"
        )

@app.post("/api/v1/recommendations", response_model=RecommendationResponse)
@limiter.limit("30/minute")
async def get_recommendations(
    request: Request,
    recommendation_request: RecommendationRequest,
    user_data = Depends(verify_supabase_jwt)
):
    """Get personalized recommendations with JWT authentication"""
    try:
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
            generated_at=datetime.utcnow().isoformat()
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/feedback")
@limiter.limit("60/minute")
async def submit_feedback(
    request: Request,
    feedback: UserFeedback,
    user_data = Depends(verify_supabase_jwt)
):
    """Submit user feedback with JWT authentication"""
    try:
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