from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import declarative_base, relationship, Session
from sqlalchemy.ext.declarative import declared_attr
from pgvector.sqlalchemy import Vector
from pydantic import BaseModel, Field
import enum

Base = declarative_base()

# -----------------
# Enums
# -----------------
class PropertyType(str, enum.Enum):
    OFFICE = "Office"
    INDUSTRIAL = "Industrial"
    RETAIL = "Retail"
    FLEX = "Flex"

class LeadStatus(str, enum.Enum):
    NEW = "New"
    MATCHED = "Matched"
    CLAIMED = "Claimed"
    CLOSED = "Closed"

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
    
    listings = relationship("Listing", back_populates="broker")

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    broker_id = Column(String, ForeignKey("brokers.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    property_type = Column(String, nullable=False) # e.g. Office, Industrial
    sub_market = Column(String, index=True, nullable=False)
    city = Column(String, index=True, nullable=False)
    state = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    square_footage = Column(Integer, nullable=False)
    ceiling_height_ft = Column(Float, nullable=True)
    price_per_sf = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True)
    
    # pgvector column for semantic search based on listing description & features
    embedding = Column(Vector(1536))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    broker = relationship("Broker", back_populates="listings")

class DemandLead(Base):
    __tablename__ = "demand_leads"
    
    id = Column(String, primary_key=True) # UUID or hash to deduplicate
    source = Column(String) # Reddit, Twitter, Direct
    raw_content = Column(String)
    
    # Extracted fields
    property_type = Column(String)
    target_city = Column(String, index=True)
    target_sub_market = Column(String)
    min_square_footage = Column(Integer)
    max_square_footage = Column(Integer)
    target_budget_sf = Column(Float)
    intent_score = Column(Float, default=0.0) # 0 to 1
    
    status = Column(String, default=LeadStatus.NEW.value)
    
    # Vector embedding of the structured intent for semantic matching
    embedding = Column(Vector(1536))
    
    created_at = Column(DateTime, default=datetime.utcnow)

class MatchEvent(Base):
    __tablename__ = "match_events"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_id = Column(String, ForeignKey("demand_leads.id"))
    listing_id = Column(Integer, ForeignKey("listings.id"))
    broker_id = Column(String, ForeignKey("brokers.id"))
    match_score = Column(Float, nullable=False)
    notified_at = Column(DateTime, default=datetime.utcnow)
    claimed = Column(Boolean, default=False)

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

class ExtractedIntentSchema(BaseModel):
    """Schema used by LLM to structure raw demand text."""
    target_city: str = Field(description="The city the tenant wants to rent in")
    target_sub_market: Optional[str] = Field(None, description="Specific neighborhood or sub-market")
    property_type: PropertyType = Field(description="Type of commercial property")
    min_square_footage: Optional[int] = Field(None, description="Minimum square footage needed")
    max_square_footage: Optional[int] = Field(None, description="Maximum square footage needed")
    ceiling_height_ft: Optional[float] = Field(None, description="Minimum ceiling height if specified")
    target_budget_sf: Optional[float] = Field(None, description="Target budget per square foot")
    lease_term_months: Optional[int] = Field(None, description="Desired lease length in months")
    contact_intent_score: float = Field(description="Score from 0.0 to 1.0 on how likely they want to be contacted immediately based on language urgency.")

class ListingCreate(BaseModel):
    title: str
    description: str
    property_type: PropertyType
    sub_market: str
    city: str
    state: str
    square_footage: int
    price_per_sf: Optional[float] = None
    image_url: Optional[str] = None

class ListingResponse(ListingCreate):
    id: int
    broker_id: str
    is_active: bool
    
    class Config:
        from_attributes = True
