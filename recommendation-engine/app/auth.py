import os
from fastapi import HTTPException, status
from jose import JWTError, jwt
from datetime import datetime, timedelta
import hashlib
import hmac

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