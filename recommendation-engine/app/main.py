from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import logging
from typing import List, Optional
import asyncio

from .models import RecommendationRequest, RecommendationResponse, UserProfile
from .recommendation_engine import RecommendationEngine
from .database import DatabaseManager
from .auth import verify_api_key, verify_token

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="BITSPARK Recommendation Engine",
    description="Advanced AI-powered recommendation system for dating and social connections",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") == "development" else None
)

# Security
security = HTTPBearer()

# CORS Configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Initialize components
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
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BITSPARK Recommendation Engine",
        "version": "1.0.0"
    }

@app.post("/api/v1/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """
    Get personalized recommendations for a user
    Requires API key authentication
    """
    try:
        # Verify API key
        await verify_api_key(credentials.credentials)
        
        # Get recommendations
        recommendations = await recommendation_engine.get_recommendations(
            user_id=request.user_id,
            recommendation_type=request.recommendation_type,
            limit=request.limit,
            filters=request.filters
        )
        
        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=recommendations,
            algorithm_version="2.0",
            generated_at=None  # Will be set automatically
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/feedback")
async def submit_feedback(
    user_id: str,
    target_user_id: str,
    action: str,  # 'like', 'pass', 'super_like', 'block'
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """
    Submit user feedback to improve recommendations
    """
    try:
        await verify_api_key(credentials.credentials)
        
        await recommendation_engine.record_feedback(
            user_id=user_id,
            target_user_id=target_user_id,
            action=action
        )
        
        return {"status": "success", "message": "Feedback recorded"}
        
    except Exception as e:
        logger.error(f"Error recording feedback: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/stats/{user_id}")
async def get_user_stats(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """
    Get user recommendation statistics
    """
    try:
        await verify_api_key(credentials.credentials)
        
        stats = await recommendation_engine.get_user_stats(user_id)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
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