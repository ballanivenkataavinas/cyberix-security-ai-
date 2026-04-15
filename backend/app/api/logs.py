"""
Security Logs API Routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_admin_user
from app.models.user import User
from app.models.security_log import SecurityLog

router = APIRouter()

class LogResponse(BaseModel):
    id: int
    event_type: str
    severity: str
    user_email: Optional[str]
    ip_address: Optional[str]
    endpoint: Optional[str]
    details: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[LogResponse])
async def get_logs(
    limit: int = Query(100, le=500),
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get security logs (admin only)"""
    query = db.query(SecurityLog)
    
    if severity:
        query = query.filter(SecurityLog.severity == severity)
    
    if event_type:
        query = query.filter(SecurityLog.event_type == event_type)
    
    logs = query.order_by(SecurityLog.timestamp.desc()).limit(limit).all()
    
    return logs
