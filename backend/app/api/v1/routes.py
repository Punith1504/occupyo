from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, Header, Form
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import List, Optional
from pydantic import BaseModel
import hmac
import hashlib

from twilio.request_validator import RequestValidator

from ...core.config import settings
from ...models.schemas import Base, Broker
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




# --- Lead Outreach Pipeline ---

class OutreachRequest(BaseModel):
    contact_phone: str
    source: str
    location: str
    property_type: str

@router.post("/outreach/space-request")
def trigger_space_request_outreach(request: OutreachRequest, background_tasks: BackgroundTasks):
    """
    Triggers the automated voice outreach loop for consented SpaceRequest submitters.
    """
    if str(getattr(settings, "ENABLE_AUTO_OUTREACH", "false")).lower() != "true":
        return {"status": "skipped", "message": "Auto-outreach is disabled via feature flag."}

    background_tasks.add_task(process_space_request_outreach_task, request)
    return {"status": "accepted", "message": "SpaceRequest outreach queued"}

def process_space_request_outreach_task(req: OutreachRequest):
    try:
        notification_service = NotificationService()
        lead_details = {
            "source": req.source,
            "location": req.location,
            "propertyType": req.property_type
        }
        notification_service.trigger_space_request_voice(req.contact_phone, lead_details)
    except Exception as e:
        logger.error(f"Error processing space request outreach task: {e}")

@router.post("/outreach/opt-in-sms")
def trigger_opt_in_sms(request: OutreachRequest, background_tasks: BackgroundTasks):
    """
    Sends an opt-in SMS to unverified external leads.
    """
    background_tasks.add_task(process_opt_in_sms_task, request)
    return {"status": "accepted", "message": "Opt-in SMS queued"}

def process_opt_in_sms_task(req: OutreachRequest):
    try:
        notification_service = NotificationService()
        lead_details = {
            "source": req.source,
            "location": req.location,
            "propertyType": req.property_type
        }
        notification_service.send_opt_in_sms(req.contact_phone, lead_details)
    except Exception as e:
        logger.error(f"Error processing opt-in SMS task: {e}")


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

@router.post("/webhooks/twilio/voice/lead-gather", response_class=PlainTextResponse)
async def twilio_voice_lead_gather(
    request: Request, 
    Digits: str = Form(None),
    x_twilio_signature: str = Header(None, alias="X-Twilio-Signature")
):
    """
    Interactive Voice Response (IVR) callback for external leads.
    """
    # Validate Signature
    await validate_twilio_request(request, x_twilio_signature)
    
    if Digits == "1":
        twiml = """
        <Response>
            <Say>Great! A verified broker from Occupy Oh will reach out to you shortly to help you find the perfect space.</Say>
            <Hangup/>
        </Response>
        """
        logger.info("External lead opted in via Voice IVR.")
        # Future: notify a broker here!
    else:
        twiml = """
        <Response>
            <Say>Thank you. We have removed you from our contact list. Have a great day.</Say>
            <Hangup/>
        </Response>
        """
        logger.info("External lead declined via Voice IVR.")
        
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
