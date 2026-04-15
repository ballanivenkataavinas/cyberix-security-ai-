"""
Security Logging Service
"""
from sqlalchemy.orm import Session
from app.models.security_log import SecurityLog
from typing import Optional

def log_security_event(
    db: Session,
    event_type: str,
    severity: str = "info",
    user_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    endpoint: Optional[str] = None,
    details: Optional[str] = None
):
    """Log a security event to the database"""
    try:
        log = SecurityLog(
            event_type=event_type,
            severity=severity,
            user_email=user_email,
            ip_address=ip_address,
            endpoint=endpoint,
            details=details
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Error logging security event: {e}")
        db.rollback()
