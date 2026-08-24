from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, Header, Form
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import List, Optional
import hmac
import hashlib

from twilio.request_validator import RequestValidator

from ...core.config import settings
from ...models.schemas import Base, ListingCreate, ListingResponse, Listing, Broker
from ...services.ingestion import IngestionService
from ...services.matcher import MatcherService
from ...services.notifications import NotificationService
from ...core.logging import logger

router = APIRouter()

# Dependency for DB session (In a real app, this goes to a dedicated db.py module)
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Listing Management ---

@router.post("/listings/", response_model=ListingResponse)
def create_listing(listing: ListingCreate, broker_id: str, db: Session = Depends(get_db)):
    """Creates a new property listing."""
    broker = db.query(Broker).filter(Broker.id == broker_id).first()
    if not broker:
        broker = Broker(id=broker_id, first_name="Test", last_name="Broker", email=f"{broker_id}@test.com", is_verified=True)
        db.add(broker)
        db.commit()

    new_listing = Listing(**listing.model_dump(), broker_id=broker_id)
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing

@router.get("/listings/", response_model=List[ListingResponse])
def get_listings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieves all listings."""
    listings = db.query(Listing).offset(skip).limit(limit).all()
    return listings

# --- Ingestion Webhooks ---

from pydantic import BaseModel
class WebhookPayload(BaseModel):
    source: str
    content: str

@router.post("/webhooks/ingest")
def receive_lead_webhook(payload: WebhookPayload, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Webhook endpoint to receive raw data from scraping workers or APIs.
    Dispatches to background tasks for LLM extraction and vector matching.
    """
    background_tasks.add_task(process_lead_task, payload.content, payload.source, db)
    return {"status": "accepted", "message": "Lead queued for processing"}

def process_lead_task(content: str, source: str, db: Session):
    """Background task to extract intent, generate embeddings, match, and notify."""
    try:
        ingestion_service = IngestionService(db)
        lead = ingestion_service.process_raw_lead(content, source)
        
        if not lead:
            return
            
        matcher_service = MatcherService(db)
        matches = matcher_service.find_matches_for_lead(lead.id, limit=3)
        
        notification_service = NotificationService()
        for match in matches:
            broker = db.query(Broker).filter(Broker.id == match.broker_id).first()
            if broker and broker.is_verified and broker.phone:
                lead_details = {
                    "property_type": lead.property_type,
                    "target_city": lead.target_city,
                    "min_sqft": lead.min_square_footage,
                    "max_sqft": lead.max_square_footage
                }
                notification_service.notify_broker_of_match(broker.phone, broker.first_name, lead_details)
                
    except Exception as e:
        logger.error(f"Error processing lead task: {e}")

class MatchRequest(BaseModel):
    query: str
    source: str = "direct"

class MatchResponse(BaseModel):
    id: int
    match_score: float
    listing: ListingResponse

@router.post("/demand/match", response_model=List[MatchResponse])
def demand_match(request: MatchRequest, db: Session = Depends(get_db)):
    """
    Synchronous endpoint for real-time frontend search.
    Extracts intent, finds matches, and returns them immediately.
    """
    try:
        ingestion_service = IngestionService(db)
        lead = ingestion_service.process_raw_lead(request.query, request.source)
        
        if not lead:
            raise HTTPException(status_code=400, detail="Failed to extract intent from query")
            
        matcher_service = MatcherService(db)
        matches = matcher_service.find_matches_for_lead(lead.id, limit=5)
        
        results = []
        for match in matches:
            listing = db.query(Listing).filter(Listing.id == match.listing_id).first()
            if listing:
                results.append({
                    "id": match.id,
                    "match_score": match.match_score,
                    "listing": listing
                })
                
        return results
    except Exception as e:
        logger.error(f"Error in demand match: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Telephony Webhooks (Twilio & WhatsApp) ---

async def validate_twilio_request(request: Request, x_twilio_signature: str = Header(None)):
    """Validates the Twilio webhook signature."""
    if not settings.TWILIO_AUTH_TOKEN:
        # Pass validation if local dev / not configured
        return True
        
    validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
    form_data = await request.form()
    url = str(request.url).replace("http://", "https://")  # Usually TWilio sends to HTTPS
    
    if not validator.validate(url, form_data, x_twilio_signature or ""):
        logger.warning(f"Invalid Twilio Signature for {url}")
        raise HTTPException(status_code=403, detail="Invalid Twilio signature")
    return True

@router.post("/webhooks/twilio/voice/gather", response_class=PlainTextResponse)
async def twilio_voice_gather(
    request: Request, 
    Digits: str = Form(None),
    x_twilio_signature: str = Header(None, alias="X-Twilio-Signature")
):
    """
    Interactive Voice Response (IVR) callback.
    Handles the broker's keypad selection.
    """
    # Validate Signature
    await validate_twilio_request(request, x_twilio_signature)
    
    if Digits == "1":
        twiml = """
        <Response>
            <Say>Excellent. We have claimed this lead for you. A text message with the tenant details has been sent to your phone. Goodbye.</Say>
            <Hangup/>
        </Response>
        """
        logger.info("Broker claimed lead via Voice IVR.")
    else:
        twiml = """
        <Response>
            <Say>Thank you. We will pass this lead to the next available broker. Goodbye.</Say>
            <Hangup/>
        </Response>
        """
        logger.info("Broker ignored lead via Voice IVR.")
        
    return PlainTextResponse(content=twiml, media_type="application/xml")


async def validate_whatsapp_request(request: Request, x_hub_signature_256: str = Header(None, alias="X-Hub-Signature-256")):
    """Validates Meta WhatsApp Cloud API webhooks."""
    if not settings.WHATSAPP_API_TOKEN:
        return True
        
    body = await request.body()
    # App Secret should ideally be in settings, for now we mock it if not present
    app_secret = getattr(settings, "WHATSAPP_APP_SECRET", "mock_secret")
    
    if not x_hub_signature_256:
        raise HTTPException(status_code=403, detail="Missing signature")
        
    expected_hash = hmac.new(
        app_secret.encode('utf-8'),
        msg=body,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    expected_sig = f"sha256={expected_hash}"
    if not hmac.compare_digest(expected_sig, x_hub_signature_256):
        logger.warning("Invalid WhatsApp Signature")
        raise HTTPException(status_code=403, detail="Invalid signature")
    return True

@router.post("/webhooks/whatsapp")
async def receive_whatsapp_message(
    request: Request,
    x_hub_signature_256: str = Header(None, alias="X-Hub-Signature-256")
):
    """
    Handles incoming messages from brokers replying to WhatsApp alerts.
    """
    await validate_whatsapp_request(request, x_hub_signature_256)
    
    payload = await request.json()
    logger.info(f"Received WhatsApp webhook: {payload}")
    
    # Process WhatsApp message (e.g., if they reply "CLAIM")
    # For now, just acknowledge.
    return {"status": "success"}
