"""
AI Services API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.ai_service import AIService
from app.services.logging_service import log_security_event

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ScanRequest(BaseModel):
    code: str
    language: str
    mode: str  # vulnerability, explain, rewrite

class ScriptRequest(BaseModel):
    task: str
    language: str  # python, bash, powershell

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ScanResponse(BaseModel):
    analysis: str
    vulnerabilities: List[dict]
    recommendations: str

class ScriptResponse(BaseModel):
    script: str
    usage: str
    warning: str

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("30/minute")
async def ai_chat(
    request: Request,
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI-powered cybersecurity chat assistant"""
    try:
        ai_service = AIService()
        response, session_id = await ai_service.chat(
            message=data.message,
            session_id=data.session_id
        )
        
        # Log usage
        log_security_event(
            db=db,
            event_type="ai_chat_used",
            severity="info",
            user_email=current_user.email,
            ip_address=request.client.host,
            endpoint="/ai/chat",
            details=f"AI chat query by {current_user.email}"
        )
        
        return {
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        print(f"AI Chat Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scan", response_model=ScanResponse)
@limiter.limit("20/minute")
async def code_scan(
    request: Request,
    data: ScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Scan code for security vulnerabilities"""
    try:
        ai_service = AIService()
        result = await ai_service.scan_code(
            code=data.code,
            language=data.language,
            mode=data.mode
        )
        
        # Log usage
        log_security_event(
            db=db,
            event_type="code_scan_performed",
            severity="info",
            user_email=current_user.email,
            ip_address=request.client.host,
            endpoint="/ai/scan",
            details=f"Code scan ({data.mode}) by {current_user.email}"
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/script", response_model=ScriptResponse)
@limiter.limit("15/minute")
async def generate_script(
    request: Request,
    data: ScriptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate security testing scripts"""
    try:
        ai_service = AIService()
        result = await ai_service.generate_script(
            task=data.task,
            language=data.language
        )
        
        # Log usage (admin action if script generation)
        log_security_event(
            db=db,
            event_type="script_generated",
            severity="warning",
            user_email=current_user.email,
            ip_address=request.client.host,
            endpoint="/ai/script",
            details=f"Script generated ({data.language}) by {current_user.email}: {data.task}"
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
