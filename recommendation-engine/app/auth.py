import os
from fastapi import HTTPException, status
from jose import JWTError, jwt
from datetime import datetime, timedelta
import hashlib
import hmac
import httpx
import json
from typing import Dict, Any

# Cache for Supabase JWT public key
_supabase_public_key_cache = None
_cache_expiry = None

async def get_supabase_public_key() -> str:
    """Get Supabase JWT public key with caching"""
    global _supabase_public_key_cache, _cache_expiry
    
    # Check cache
    if (_supabase_public_key_cache and _cache_expiry and 
        datetime.utcnow() < _cache_expiry):
        return _supabase_public_key_cache
    
    # Fetch from Supabase
    supabase_url = os.getenv("VITE_SUPABASE_URL")
    if not supabase_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase URL not configured"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{supabase_url}/auth/v1/jwks")
            response.raise_for_status()
            jwks = response.json()
            
            # Extract the public key (assuming first key)
            if jwks.get("keys"):
                key_data = jwks["keys"][0]
                _supabase_public_key_cache = key_data
                _cache_expiry = datetime.utcnow() + timedelta(hours=1)
                return key_data
            else:
                raise ValueError("No keys found in JWKS")
                
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Supabase public key: {str(e)}"
        )

async def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token
    """
    try:
        # Decode without verification first to get header
        header = jwt.get_unverified_header(token)
        
        # Get Supabase public key
        key_data = await get_supabase_public_key()
        
        # For now, use the Supabase JWT secret for verification
        # In production, you should use the proper JWKS verification
        supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        if not supabase_jwt_secret:
            # Fallback to anon key for development
            supabase_jwt_secret = os.getenv("VITE_SUPABASE_ANON_KEY")
        
        if not supabase_jwt_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Supabase JWT secret not configured"
            )
        
        # Verify and decode the token
        payload = jwt.decode(
            token, 
            supabase_jwt_secret, 
            algorithms=["HS256"],
            audience="authenticated"
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
        
        return payload
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )

async def verify_api_key(api_key: str) -> bool:
    """
    Verify API key from frontend application
    Uses HMAC for secure key verification
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

async def verify_token(token: str) -> dict:
    """
    Verify JWT token (if using token-based auth)
    """
    try:
        secret_key = os.getenv("API_SECRET_KEY")
        algorithm = os.getenv("ALGORITHM", "HS256")
        
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Create JWT access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    secret_key = os.getenv("API_SECRET_KEY")
    algorithm = os.getenv("ALGORITHM", "HS256")
    
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt