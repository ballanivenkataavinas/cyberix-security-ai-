"""
Authentication API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.services.logging_service import log_security_event

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=AuthResponse)
@limiter.limit("5/minute")
async def register(
    request: Request,
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new user (Gmail only for public registration)"""
    
    # Email domain validation - Only allow @gmail.com for public registration
    if not data.email.lower().endswith("@gmail.com"):
        log_security_event(
            db=db,
            event_type="registration_blocked",
            severity="warning",
            user_email=data.email,
            ip_address=request.client.host,
            details=f"Registration blocked - invalid domain: {data.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is only allowed with @gmail.com email addresses"
        )
    
    # Check if user exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password strength
    if len(data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )
    
    # Create user with 'user' role (never admin for public registration)
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role="user"  # Always user role for public registration
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log event
    log_security_event(
        db=db,
        event_type="user_registered",
        severity="info",
        user_email=user.email,
        ip_address=request.client.host,
        details=f"New user registered: {user.email}"
    )
    
    # Create token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticate user and return JWT token"""
    # Find user
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user or not verify_password(data.password, user.hashed_password):
        # Log failed attempt
        log_security_event(
            db=db,
            event_type="login_failed",
            severity="warning",
            user_email=data.email,
            ip_address=request.client.host,
            details=f"Failed login attempt for {data.email}"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Log successful login
    log_security_event(
        db=db,
        event_type="login_success",
        severity="info",
        user_email=user.email,
        ip_address=request.client.host,
        details=f"User logged in: {user.email}"
    )
    
    # Create token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }
