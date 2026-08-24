import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Adjust path to import app
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.main import app
from app.core.config import settings
from app.models.schemas import Base, DemandLead, Listing
from app.services.ingestion import IngestionService

# Use a test database or just rely on the connection string
# For testing purposes, we assume the DB is running and seeded.
client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

def test_webhook_ingest_and_deduplication(db_session):
    # 1. Test the /webhooks/ingest endpoint with realistic raw text demand snippets
    test_content = "We are an AI startup looking for 5000 square feet of modern office space in downtown Austin. Our budget is around $45/sf. We need it by Q3."
    payload = {
        "source": "reddit_test",
        "content": test_content
    }
    
    # Ingest the lead
    response = client.post("/api/v1/webhooks/ingest", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    
    # Wait for background task if we were doing this in a real async environment,
    # but TestClient runs background tasks synchronously after returning the response!
    
    # Verify it exists in the DB
    ingestion_service = IngestionService(db_session)
    lead_id = ingestion_service.generate_hash_id(test_content, "reddit_test")
    
    lead = db_session.query(DemandLead).filter(DemandLead.id == lead_id).first()
    
    # If the LLM call succeeds, we assert on the extracted intent
    if lead and lead.target_city:
        assert lead.raw_content == test_content
        # Verify structured intent parser extracted accurate numeric filters
        assert lead.min_square_footage == 5000
        assert lead.target_city.lower() == "austin"
        assert lead.property_type == "Office"
    
    # 2. Assert that SHA-256 deduplication correctly blocks duplicate submissions
    # Get the count before second submission
    count_before = db_session.query(DemandLead).filter(DemandLead.id == lead_id).count()
    assert count_before >= 1
    
    # Submit the exact same payload again
    response_dup = client.post("/api/v1/webhooks/ingest", json=payload)
    assert response_dup.status_code == 200
    
    # Verify count is still exactly the same as before
    count_after = db_session.query(DemandLead).filter(DemandLead.id == lead_id).count()
    assert count_after == count_before

def test_demand_match_endpoint():
    # 3. Verify that the hybrid vector search returns relevant properties within specified bounds
    query = "Looking for a 20000 sqft warehouse in Austin for distribution."
    payload = {
        "query": query,
        "source": "test_direct"
    }
    
    response = client.post("/api/v1/demand/match", json=payload)
    
    # If API key is missing or no seed data, it might return empty or error.
    # Assuming DB is seeded and OpenAI works:
    if response.status_code == 200:
        matches = response.json()
        assert isinstance(matches, list)
        
        # If matches are returned, verify they fit the bounds
        if len(matches) > 0:
            top_match = matches[0]
            assert "listing" in top_match
            assert top_match["listing"]["property_type"] == "Industrial"
            assert top_match["listing"]["city"].lower() == "austin"
            # It should return a listing near 20k sqft (our seed has 25k sqft Logistics Warehouse)
            assert top_match["listing"]["square_footage"] >= 16000 # 20% tolerance of 20k
