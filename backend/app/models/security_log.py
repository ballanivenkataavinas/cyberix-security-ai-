"""
Security Log Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.core.database import Base

class SecurityLog(Base):
    __tablename__ = "security_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)  # login_failed, suspicious_access, admin_action
    severity = Column(String, default="info")  # info, warning, critical
    user_email = Column(String)
    ip_address = Column(String)
    endpoint = Column(String)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
