from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import declarative_base, relationship, Session
from sqlalchemy.ext.declarative import declared_attr
from pydantic import BaseModel, Field

Base = declarative_base()

# -----------------
# SQLAlchemy ORM Models
# -----------------

class Broker(Base):
    __tablename__ = "brokers"
    
    id = Column(String, primary_key=True) # Could be Clerk ID
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    license_number = Column(String, nullable=True)
    performance_score = Column(Float, default=1.0) # Used for Trust & Performance Scoring
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLedger(Base):
    __tablename__ = "audit_ledger"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(String, nullable=False) # e.g. "Listing", "Broker"
    entity_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    hash_receipt = Column(String, nullable=False) # SHA-256 Merkle receipt
    created_at = Column(DateTime, default=datetime.utcnow)

# -----------------
# Pydantic Schemas (for API)
# -----------------
