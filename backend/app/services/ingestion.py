import hashlib
from typing import Optional
from sqlalchemy.orm import Session
from openai import OpenAI
import instructor
from ..models.schemas import DemandLead, ExtractedIntentSchema, LeadStatus
from ..core.config import settings

# Initialize instructor client
client = instructor.patch(OpenAI(api_key=settings.OPENAI_API_KEY)) if settings.OPENAI_API_KEY else None

class IngestionService:
    def __init__(self, db: Session):
        self.db = db

    def generate_hash_id(self, raw_content: str, source: str) -> str:
        """Generates a SHA-256 hash to use as a deduplication ID."""
        hash_input = f"{source}::{raw_content.strip()}".encode('utf-8')
        return hashlib.sha256(hash_input).hexdigest()

    def process_raw_lead(self, raw_content: str, source: str) -> Optional[DemandLead]:
        """
        Processes a raw text lead, extracts structured intent using LLM,
        and saves it to the database if it is not a duplicate.
        """
        lead_id = self.generate_hash_id(raw_content, source)
        
        # Deduplication check
        existing_lead = self.db.query(DemandLead).filter(DemandLead.id == lead_id).first()
        if existing_lead:
            print(f"Lead {lead_id} already exists. Skipping.")
            return existing_lead

        # 1. Extract Structured Intent
        extracted_data = self.extract_intent(raw_content)
        if not extracted_data:
            print("Failed to extract intent.")
            return None

        # 2. Generate Vector Embedding for semantic search
        embedding = self.generate_embedding(extracted_data)

        # 3. Create DemandLead record
        new_lead = DemandLead(
            id=lead_id,
            source=source,
            raw_content=raw_content,
            property_type=extracted_data.property_type.value,
            target_city=extracted_data.target_city,
            target_sub_market=extracted_data.target_sub_market,
            min_square_footage=extracted_data.min_square_footage,
            max_square_footage=extracted_data.max_square_footage,
            target_budget_sf=extracted_data.target_budget_sf,
            intent_score=extracted_data.contact_intent_score,
            status=LeadStatus.NEW.value,
            embedding=embedding
        )
        
        self.db.add(new_lead)
        self.db.commit()
        self.db.refresh(new_lead)
        
        return new_lead

    def extract_intent(self, text: str) -> Optional[ExtractedIntentSchema]:
        """Uses Instructor and OpenAI to extract structured JSON from raw text."""
        if not client:
            print("OpenAI client not initialized.")
            return None
            
        try:
            intent = client.chat.completions.create(
                model="gpt-4o",
                response_model=ExtractedIntentSchema,
                messages=[
                    {"role": "system", "content": "You are an expert commercial real estate assistant. Extract tenant requirements from the text."},
                    {"role": "user", "content": text}
                ]
            )
            return intent
        except Exception as e:
            print(f"Error extracting intent: {e}")
            return None

    def generate_embedding(self, intent: ExtractedIntentSchema) -> Optional[list[float]]:
        """Generates an embedding vector representing the tenant's structured requirements."""
        if not client:
            return None
            
        # Serialize the intent into a normalized string for embedding
        normalized_text = f"Looking for {intent.property_type.value} space in {intent.target_city}"
        if intent.target_sub_market:
            normalized_text += f", specifically {intent.target_sub_market}"
        if intent.min_square_footage:
            normalized_text += f", minimum {intent.min_square_footage} sqft"
            
        try:
            response = client.embeddings.create(
                input=[normalized_text],
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
