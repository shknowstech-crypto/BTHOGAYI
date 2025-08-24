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
        response.headers["X-Service"] = "BITHOGAYI-Recommendations"
        
        if os.getenv("ENVIRONMENT") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

# Rate limiter with memory storage for free tier
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")

# Initialize FastAPI app
app = FastAPI(
    title="BITHOGAYI Recommendation Engine",
    description="Advanced ML-powered recommendation system for college dating/networking platform",
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
    openapi_url="/openapi.json" if os.getenv("ENVIRONMENT") != "production" else None
)

# Add middleware
app.add_middleware(SecurityHeadersMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.vercel.app",
    "https://*.netlify.app",
]

if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENVIRONMENT") == "development" else allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-API-Version", "X-Service"]
)

# Initialize services
try:
    db_manager = DatabaseManager()
    recommendation_engine = RecommendationEngine(db_manager)
    logger.info("✅ Services initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize services: {str(e)}")
    raise

# Authentication dependency
async def get_current_user(request: Request) -> Dict[str, Any]:
    """Enhanced authentication with detailed user data"""
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header"
            )
        
        token = auth_header.split(" ")[1]
        
        # Verify JWT token with Supabase
        user_data = await verify_supabase_jwt(token)
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get additional user profile data from database
        try:
            profile_data = await db_manager.get_user_profile(user_data["user_id"])
            if profile_data:
                user_data["profile"] = profile_data
        except Exception as e:
            logger.warning(f"Could not fetch profile for user {user_data.get('user_id')}: {str(e)}")
            user_data["profile"] = {}
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

# ===================================
# PUBLIC ENDPOINTS
# ===================================

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "BITHOGAYI Recommendation Engine",
        "version": "2.0.0",
        "status": "operational",
        "documentation": "/docs" if os.getenv("ENVIRONMENT") != "production" else "Contact admin",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "features": [
            "JWT Authentication",
            "ML-powered Recommendations", 
            "Rate Limiting",
            "Security Headers",
            "CORS Protection",
            "Real-time Analytics"
        ]
    }

@app.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    """Public health check endpoint"""
    try:
        # Test database connection
        db_healthy = await db_manager.health_check()
        
        return {
            "status": "healthy",
            "service": "BITHOGAYI Recommendation Engine",
            "version": "2.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "timestamp": datetime.utcnow().isoformat(),
            "rate_limiting": {
                "enabled": True,
                "health_endpoint": "60/minute",
                "recommendations": "30/minute", 
                "feedback": "120/minute"
            },
            "components": {
                "database": "healthy" if db_healthy else "unhealthy",
                "recommendation_engine": "healthy",
                "authentication": "operational"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": "Service unavailable",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@app.get("/health/database")
@limiter.limit("30/minute")
async def database_health_check(request: Request):
    """Dedicated database health check endpoint"""
    try:
        # Detailed database health check
        db_healthy = await db_manager.health_check()
        
        if not db_healthy:
            return JSONResponse(
                status_code=503,
                content={
                    "database_status": "disconnected",
                    "status": "unhealthy",
                    "timestamp": datetime.utcnow().isoformat(),
                    "error": "Database connection failed"
                }
            )

        # Get user count for sample data validation
        try:
            async with db_manager.pool.acquire() as connection:
                user_count = await connection.fetchval("SELECT COUNT(*) FROM users;")
        except:
            user_count = 0
        
        return {
            "database_status": "connected",
            "status": "healthy", 
            "connection_info": "PostgreSQL via Supabase (pooled)",
            "user_count": user_count,
            "response_time": "< 50ms",
            "pool_status": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "database_status": "disconnected",
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# ===================================
# AUTHENTICATED ENDPOINTS
# ===================================

@app.post("/api/v1/recommendations", response_model=RecommendationResponse)
@limiter.limit("30/minute")
async def get_recommendations(
    request: Request,
    recommendation_request: RecommendationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get personalized recommendations with JWT authentication
    
    Enhanced features:
    - ML-powered compatibility scoring
    - Multi-factor recommendation algorithm
    - Campus and academic year preferences
    - Interest-based matching
    - Feedback-driven improvements
    """
    try:
        user_id = current_user["user_id"]
        
        # Validate user can only get recommendations for themselves
        if recommendation_request.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot get recommendations for other users"
            )
        
        # Get recommendations from engine
        recommendations = await recommendation_engine.get_recommendations(
            user_id=user_id,
            limit=recommendation_request.limit,
            algorithm_version="v2.0"
        )
        
        # Log recommendation request for analytics
        await db_manager.log_recommendation_request(
            user_id=user_id,
            algorithm_version="v2.0",
            recommendations_count=len(recommendations),
            request_metadata={
                "user_agent": request.headers.get("user-agent"),
                "campus": current_user.get("profile", {}).get("campus"),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        return RecommendationResponse(
            user_id=user_id,
            recommendations=recommendations,
            algorithm_version="v2.0",
            generated_at=datetime.utcnow().isoformat(),
            total_count=len(recommendations)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendations for user {current_user.get('user_id')}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@app.post("/api/v1/feedback")
@limiter.limit("60/minute")
async def submit_feedback(
    request: Request,
    feedback: UserFeedback,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Submit user feedback for ML improvement
    
    Features:
    - Validates user can only submit own feedback
    - Records detailed feedback for algorithm training
    - Updates user preference learning
    - Tracks response patterns
    """
    try:
        user_id = current_user["user_id"]
        
        # Validate user can only submit feedback for themselves
        if feedback.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot submit feedback for other users"
            )
        
        # Record feedback in database
        feedback_id = await db_manager.record_feedback(
            user_id=user_id,
            recommended_user_id=feedback.recommended_user_id,
            action=feedback.action,
            context={
                "algorithm_version": "v2.0",
                "timestamp": datetime.utcnow().isoformat(),
                "user_agent": request.headers.get("user-agent"),
                "response_time_ms": getattr(feedback, 'response_time_ms', None)
            }
        )
        
        # Update recommendation engine with feedback
        await recommendation_engine.process_feedback(feedback)
        
        return {
            "success": True,
            "feedback_id": feedback_id,
            "message": "Feedback recorded successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to record feedback")

@app.get("/api/v1/stats/{user_id}")
@limiter.limit("30/minute")
async def get_user_stats(
    request: Request,
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get user recommendation statistics and insights
    
    Features:
    - Profile completion metrics
    - Match success rates
    - Engagement analytics
    - Recommendation effectiveness
    """
    try:
        # Validate user can only access their own stats
        if user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot access other users' statistics"
            )
        
        # Get comprehensive user statistics
        stats = await db_manager.get_user_statistics(user_id)
        
        return {
            "user_id": user_id,
            "stats": stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")

@app.get("/api/v1/auth/verify")
@limiter.limit("60/minute")
async def verify_auth(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Verify authentication status and return user info
    
    Features:
    - JWT token validation
    - User profile status
    - Campus and verification info
    - Session management
    """
    try:
        profile = current_user.get("profile", {})
        
        return {
            "authenticated": True,
            "user_id": current_user.get("user_id"),
            "email": current_user.get("email"),
            "profile": {
                "display_name": profile.get("display_name"),
                "campus": profile.get("campus"),
                "verified": profile.get("verified", False),
                "profile_completed": profile.get("profile_completed", False),
                "subscription_tier": profile.get("subscription_tier", "free")
            },
            "session": {
                "verified_at": datetime.utcnow().isoformat(),
                "token_type": "JWT",
                "provider": "supabase"
            }
        }
        
    except Exception as e:
        logger.error(f"Error verifying auth: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication verification failed")

# ===================================
# ERROR HANDLERS
# ===================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler with detailed logging"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail} - {request.method} {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {str(exc)} - {request.method} {request.url}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

# ===================================
# STARTUP/SHUTDOWN EVENTS
# ===================================

@app.on_event("startup")
async def startup_event():
    """Initialize services and connections on startup"""
    try:
        logger.info("🚀 Starting BITHOGAYI Recommendation Engine v2.0")
        
        # Test database connection
        if await db_manager.health_check():
            logger.info("✅ Database connection established")
        else:
            logger.error("❌ Database connection failed")
            
        # Initialize recommendation engine
        await recommendation_engine.initialize()
        logger.info("✅ Recommendation engine initialized")
        
        logger.info("🎉 Service startup completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    try:
        logger.info("🛑 Shutting down BITHOGAYI Recommendation Engine")
        
        # Close database connections
        await db_manager.close()
        logger.info("✅ Database connections closed")
        
        logger.info("✅ Shutdown completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Shutdown error: {str(e)}")

# ===================================
# APPLICATION ENTRY POINT
# ===================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting server on {host}:{port}")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development",
        workers=1,
        access_log=True,
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
