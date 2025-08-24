import os
from fastapi import HTTPException, status
from jose import JWTError, jwt
from datetime import datetime, timedelta
import hashlib
import hmac
import httpx
import json
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Cache for Supabase JWT public key
_supabase_public_key_cache = None
_cache_expiry = None

async def get_supabase_jwt_secret() -> str:
    """Get Supabase JWT secret for token verification"""
    # In production, use the JWT secret from Supabase dashboard
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    if jwt_secret:
        return jwt_secret
    
    # Fallback to anon key for development (not recommended for production)
    anon_key = os.getenv("VITE_SUPABASE_ANON_KEY")
    if anon_key:
        logger.warning("Using anon key for JWT verification - not recommended for production")
        return anon_key
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Supabase JWT secret not configured"
    )

async def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token and extract user information
    """
    try:
        # Get JWT secret
        jwt_secret = await get_supabase_jwt_secret()
        
        # Verify and decode the token
        payload = jwt.decode(
            token, 
            jwt_secret, 
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_aud": False}  # Supabase tokens may not have standard aud
        )
        
        # Check token expiry
        if payload.get("exp", 0) < datetime.utcnow().timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        # Verify it's a user token (not service role)
        if payload.get("role") != "authenticated":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token role"
            )
        
        # Validate BITS email
        email = payload.get("email", "")
        if not validate_bits_email(email):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted to BITS students only"
            )
        
        # Extract user information
        user_data = {
            "user_id": payload.get("sub"),
            "email": email,
            "role": payload.get("role"),
            "aud": payload.get("aud"),
            "exp": payload.get("exp"),
            "iat": payload.get("iat"),
            "iss": payload.get("iss"),
            "campus": get_campus_from_email(email)
        }
        
        logger.info(f"JWT verified for user: {user_data['user_id']} ({email})")
        return user_data
        
    except JWTError as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"JWT verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )

def validate_bits_email(email: str) -> bool:
    """Validate BITS email address"""
    if not email:
        return False
    
    allowed_domains = [
        "pilani.bits-pilani.ac.in",
        "goa.bits-pilani.ac.in", 
        "hyderabad.bits-pilani.ac.in",
        "dubai.bits-pilani.ac.in"
    ]
    
    email_domain = email.split('@')[-1].lower()
    return email_domain in allowed_domains

def get_campus_from_email(email: str) -> str:
    """Extract campus from BITS email"""
    if 'goa.bits-pilani.ac.in' in email:
        return 'Goa'
    elif 'hyderabad.bits-pilani.ac.in' in email:
        return 'Hyderabad'
    elif 'dubai.bits-pilani.ac.in' in email:
        return 'Dubai'
    else:
        return 'Pilani'

async def verify_api_key(api_key: str) -> bool:
    """
    Verify API key from frontend application (fallback method)
    """
    expected_key = os.getenv("API_KEY")
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API key not configured"
        )
    
    # Use constant-time comparison to prevent timing attacks
    if not hmac.compare_digest(api_key, expected_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return True

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token (for internal use)
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow().timestamp()})
    
    secret_key = os.getenv("API_SECRET_KEY")
    if not secret_key:
        raise ValueError("API_SECRET_KEY not configured")
    
    algorithm = "HS256"
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

async def get_user_from_database(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user profile from database using the database manager
    This will be called by the recommendation engine
    """
    try:
        from .database import DatabaseManager
        
        db = DatabaseManager()
        await db.connect()
        
        user_profile = await db.get_user_profile(user_id)
        
        await db.disconnect()
        
        return user_profile
    except Exception as e:
        logger.error(f"Failed to get user from database: {e}")
        return None

# Middleware helper for extracting user from JWT
async def get_current_user_from_jwt(token: str) -> Dict[str, Any]:
    """
    Extract and validate user from JWT token
    """
    user_data = await verify_supabase_jwt(token)
    
    # Get additional user data from database if needed
    user_profile = await get_user_from_database(user_data["user_id"])
    
    if user_profile:
        # Merge JWT data with database profile
        user_data.update({
            "profile": user_profile,
            "campus": user_profile.get("campus"),
            "verified": user_profile.get("verified", False),
            "is_active": user_profile.get("is_active", True)
        })
    
    return user_data