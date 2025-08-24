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
from typing import List, Optional, Dict, Any
from datetime import datetime

from .models import RecommendationRequest, RecommendationResponse, UserFeedback
from .recommendation_engine import RecommendationEngine
from .database import DatabaseManager
from .auth import verify_supabase_jwt, get_current_user_from_jwt

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
        response.headers["X-API-Version"] = "2.0"
        response.headers["X-Service"] = "BITSPARK-Recommendations"
        
        if os.getenv("ENVIRONMENT") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

# Rate limiter with memory storage for free tier
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")

# Initialize FastAPI app
app = FastAPI(
    title="BITSPARK Recommendation Engine",
    description="Secure AI-powered recommendation system with JWT authentication",
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") == "development" else None
)

# Rate limit handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware
app.add_middleware(SecurityHeadersMiddleware)

# Enhanced CORS Configuration for multi-service architecture
allowed_origins = []

# Production origins
if os.getenv("ENVIRONMENT") == "production":
    frontend_domain = os.getenv("FRONTEND_DOMAIN")
    if frontend_domain:
        allowed_origins.extend([
            f"https://{frontend_domain}",
            f"https://www.{frontend_domain}"
        ])
    
    # Add any additional production domains
    additional_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
    allowed_origins.extend([origin.strip() for origin in additional_origins if origin.strip()])
else:
    # Development origins
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
        "Authorization", 
        "Content-Type", 
        "X-Client-Type", 
        "X-API-Version",
        "X-Request-ID"
    ],
    expose_headers=["X-Rate-Limit-Remaining", "X-API-Version"],
)

# Initialize components
security = HTTPBearer()
db_manager = DatabaseManager()
recommendation_engine = RecommendationEngine(db_manager)

# JWT verification dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """
    Verify JWT token and get current user data
    This is the main authentication dependency for all protected endpoints
    """
    try:
        token = credentials.credentials
        user_data = await get_current_user_from_jwt(token)
        
        # Update user activity
        if user_data.get("user_id"):
            await db_manager.update_user_activity(user_data["user_id"])
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@app.on_event("startup")
async def startup_event():
    """Initialize database connection and recommendation engine"""
    try:
        await db_manager.connect()
        await recommendation_engine.initialize()
        logger.info("BITSPARK Recommendation Engine started successfully")
        logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
        logger.info(f"Allowed origins: {allowed_origins}")
    except Exception as e:
        logger.error(f"Failed to start recommendation engine: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources"""
    await db_manager.disconnect()
    logger.info("BITSPARK Recommendation Engine shut down")

@app.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    """Public health check endpoint"""
    return {
        "status": "healthy",
        "service": "BITSPARK Recommendation Engine",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "timestamp": datetime.utcnow().isoformat(),
        "authentication": "JWT + Supabase",
        "database": "PostgreSQL + Supabase"
    }

@app.post("/api/v1/recommendations", response_model=RecommendationResponse)
@limiter.limit("30/minute")
async def get_recommendations(
    request: Request,
    recommendation_request: RecommendationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get personalized recommendations with JWT authentication
    
    This endpoint:
    1. Verifies JWT token from Supabase
    2. Validates BITS email
    3. Ensures user can only get their own recommendations
    4. Generates AI-powered recommendations
    5. Returns secure response
    """
    try:
        # Ensure user can only get their own recommendations
        if recommendation_request.user_id != current_user.get("user_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only request your own recommendations"
            )
        
        # Verify user is active and verified
        user_profile = current_user.get("profile", {})
        if not user_profile.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is not active"
            )
        
        logger.info(f"Generating {recommendation_request.recommendation_type} recommendations for user {current_user['user_id']}")
        
        # Get recommendations
        recommendations = await recommendation_engine.get_recommendations(
            user_id=recommendation_request.user_id,
            recommendation_type=recommendation_request.recommendation_type,
            limit=recommendation_request.limit or 10,
            filters=recommendation_request.filters
        )
        
        logger.info(f"Generated {len(recommendations)} recommendations for user {current_user['user_id']}")
        
        return RecommendationResponse(
            user_id=recommendation_request.user_id,
            recommendations=recommendations,
            algorithm_version="2.0-jwt",
            generated_at=datetime.utcnow().isoformat(),
            total_candidates=len(recommendations)
        )
        
    except ValueError as e:
        logger.warning(f"Invalid request: {str(e)}")
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
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Submit user feedback with JWT authentication
    
    This endpoint:
    1. Verifies JWT token
    2. Validates user can only submit feedback for themselves
    3. Records feedback for ML improvement
    4. Updates recommendation algorithm
    """
    try:
        # Ensure user can only submit feedback for themselves
        if feedback.user_id != current_user.get("user_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit feedback for yourself"
            )
        
        logger.info(f"Recording feedback: {feedback.action} from {current_user['user_id']} to {feedback.target_user_id}")
        
        # Record feedback
        await recommendation_engine.record_feedback(
            user_id=feedback.user_id,
            target_user_id=feedback.target_user_id,
            action=feedback.action,
            context=feedback.context or {}
        )
        
        return {
            "status": "success", 
            "message": "Feedback recorded successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
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
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get user recommendation statistics
    """
    try:
        # Ensure user can only get their own stats
        if user_id != current_user.get("user_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own statistics"
            )
        
        stats = await recommendation_engine.get_user_stats(user_id)
        
        return {
            "user_id": user_id,
            "stats": stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/auth/verify")
@limiter.limit("60/minute")
async def verify_auth(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Verify authentication status and return user info
    """
    return {
        "authenticated": True,
        "user_id": current_user.get("user_id"),
        "email": current_user.get("email"),
        "campus": current_user.get("campus"),
        "verified": current_user.get("profile", {}).get("verified", False),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Enhanced error handling with logging"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail} - {request.method} {request.url}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail, 
            "status": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    logger.error(f"Unexpected error: {str(exc)} - {request.method} {request.url}")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "status": "error", 
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info"
    )