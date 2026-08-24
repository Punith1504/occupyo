import asyncio
import os
import sys
from typing import List, Dict, Any

# Adjust python path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from openai import AsyncOpenAI
from app.models.schemas import Base, Listing, Broker, PropertyType
from app.core.config import settings

# Setup OpenAI and Database
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

SEED_BROKER = {
    "id": "broker_seed_001",
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice.smith@occupyoseed.com",
    "phone": "+15550100",
    "is_verified": True
}

SEED_LISTINGS = [
    {
        "title": "Prime Downtown Office Space",
        "description": "Modern Class A office space in the heart of downtown. Features open floor plan, high exposed ceilings, concrete floors, and abundant natural light. Ideal for tech startups and creative agencies.",
        "property_type": PropertyType.OFFICE.value,
        "sub_market": "Downtown",
        "city": "Austin",
        "state": "TX",
        "square_footage": 4500,
        "ceiling_height_ft": 14.0,
        "price_per_sf": 45.0,
        "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3"
    },
    {
        "title": "Large Logistics Warehouse",
        "description": "Massive industrial warehouse with 5 loading docks, 32ft clear heights, and heavy power. Excellent access to major interstate highways. Perfect for e-commerce distribution.",
        "property_type": PropertyType.INDUSTRIAL.value,
        "sub_market": "Southpark",
        "city": "Austin",
        "state": "TX",
        "square_footage": 25000,
        "ceiling_height_ft": 32.0,
        "price_per_sf": 12.5,
        "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3"
    },
    {
        "title": "Creative Flex Space Studio",
        "description": "Versatile flex space suitable for light manufacturing, R&D, or studio use. Includes 20% conditioned office area. Grade-level roll-up door.",
        "property_type": PropertyType.FLEX.value,
        "sub_market": "Eastside",
        "city": "Austin",
        "state": "TX",
        "square_footage": 8000,
        "ceiling_height_ft": 18.0,
        "price_per_sf": 22.0,
        "image_url": "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3"
    },
    {
        "title": "High Foot-Traffic Retail Storefront",
        "description": "End-cap retail space in a busy shopping center anchored by a national grocer. Great visibility, ample parking, and building signage available.",
        "property_type": PropertyType.RETAIL.value,
        "sub_market": "Domain",
        "city": "Austin",
        "state": "TX",
        "square_footage": 3200,
        "ceiling_height_ft": 12.0,
        "price_per_sf": 65.0,
        "image_url": "https://images.unsplash.com/photo-1581007817448-f60bb116345d?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3"
    }
]

async def get_embedding(text: str) -> List[float]:
    """Fetch vector embedding from OpenAI."""
    if not settings.OPENAI_API_KEY:
        print("Warning: OPENAI_API_KEY not set. Returning zero-vector for testing.")
        return [0.0] * 1536
    
    try:
        response = await client.embeddings.create(
            input=[text],
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error fetching embedding: {e}")
        return [0.0] * 1536

async def seed_data():
    print("Starting database seeding process...")
    
    # Initialize DB schema if it doesn't exist (for local dev)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create or get Seed Broker
        broker = db.query(Broker).filter(Broker.id == SEED_BROKER["id"]).first()
        if not broker:
            broker = Broker(**SEED_BROKER)
            db.add(broker)
            db.commit()
            print(f"Created seed broker: {broker.first_name} {broker.last_name}")

        print("Generating embeddings for listings...")
        
        # We fetch embeddings concurrently for speed
        async def prepare_listing(data: Dict[str, Any]):
            text_for_embedding = f"Looking for {data['property_type']} space in {data['city']}, specifically {data['sub_market']}. {data['description']}"
            embedding = await get_embedding(text_for_embedding)
            return Listing(
                broker_id=broker.id,
                title=data["title"],
                description=data["description"],
                property_type=data["property_type"],
                sub_market=data["sub_market"],
                city=data["city"],
                state=data["state"],
                square_footage=data["square_footage"],
                ceiling_height_ft=data["ceiling_height_ft"],
                price_per_sf=data["price_per_sf"],
                image_url=data.get("image_url"),
                embedding=embedding
            )

        listing_objects = await asyncio.gather(*(prepare_listing(l) for l in SEED_LISTINGS))
        
        # Check if listings already seeded (simple count check)
        existing_count = db.query(Listing).filter(Listing.broker_id == broker.id).count()
        if existing_count > 0:
            print(f"Found {existing_count} existing listings for seed broker. Skipping insertion to prevent duplicates.")
        else:
            db.add_all(listing_objects)
            db.commit()
            print(f"Successfully seeded {len(listing_objects)} listings with vector embeddings!")

    except Exception as e:
        print(f"Database error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
