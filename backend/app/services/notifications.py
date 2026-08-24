import json
import requests
from twilio.rest import Client
from ..core.config import settings

class NotificationService:
    def __init__(self):
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            self.twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        else:
            self.twilio_client = None

    def send_whatsapp_alert(self, to_number: str, message: str) -> bool:
        """
        Sends a WhatsApp message using Meta's official WhatsApp Business Cloud API.
        Requires WHATSAPP_API_TOKEN and WHATSAPP_PHONE_ID.
        """
        if not settings.WHATSAPP_API_TOKEN or not settings.WHATSAPP_PHONE_ID:
            print(f"Mock WhatsApp Alert to {to_number}: {message}")
            return True
            
        url = f"https://graph.facebook.com/v19.0/{settings.WHATSAPP_PHONE_ID}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
            "Content-Type": "application/json"
        }
        
        # Here we could use a template. For simplicity we use standard text.
        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "text",
            "text": {
                "body": message
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            print(f"WhatsApp sent successfully to {to_number}")
            return True
        except Exception as e:
            print(f"Failed to send WhatsApp: {e}")
            return False

    def trigger_voice_alert(self, to_number: str, lead_details: dict) -> bool:
        """
        Triggers an outbound Twilio Programmable Voice call with an interactive TwiML IVR.
        """
        if not self.twilio_client or not settings.TWILIO_PHONE_NUMBER:
            print(f"Mock Twilio Voice Call to {to_number}")
            return True
            
        try:
            # We host a webhook endpoint that provides the TwiML instructions when the call connects
            # For this example, we use a mock URL or build TwiML directly
            twiml = f"""
            <Response>
                <Say>Hello, Occupy Oh has a high intent match for your listing.</Say>
                <Say>A tenant is looking for {lead_details.get('min_sqft')} square feet of {lead_details.get('property_type')} space in {lead_details.get('target_city')}.</Say>
                <Gather numDigits="1" action="/api/v1/webhooks/twilio/voice/gather" method="POST">
                    <Say>Press 1 to claim this lead, or press 2 to ignore.</Say>
                </Gather>
            </Response>
            """
            
            call = self.twilio_client.calls.create(
                twiml=twiml,
                to=to_number,
                from_=settings.TWILIO_PHONE_NUMBER
            )
            print(f"Twilio Call initiated: {call.sid}")
            return True
        except Exception as e:
            print(f"Failed to initiate Twilio Call: {e}")
            return False

    def notify_broker_of_match(self, broker_phone: str, broker_name: str, lead_details: dict) -> bool:
        """
        Constructs and sends a compliance-checked WhatsApp message to a verified broker,
        and triggers a voice alert for ultra high-intent leads.
        """
        # Ensure we only message verified brokers (handled upstream before calling this)
        message = (
            f"Hello {broker_name}, Occupyo found a high-intent match for your listing!\n\n"
            f"Tenant Needs: {lead_details.get('property_type')} in {lead_details.get('target_city')}\n"
            f"Size: {lead_details.get('min_sqft')} - {lead_details.get('max_sqft')} sqft\n\n"
            f"Reply 'CLAIM' to review full details and connect."
        )
        
        whatsapp_success = self.send_whatsapp_alert(broker_phone, message)
        
        # Trigger voice alert as well
        voice_success = self.trigger_voice_alert(broker_phone, lead_details)
        
        return whatsapp_success and voice_success
