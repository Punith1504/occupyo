import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random

app = FastAPI(title="Occupyo Scraper Microservice")

class ScrapeRequest(BaseModel):
    location: str
    maxPrice: Optional[float] = None
    propertyType: Optional[str] = "FLEX"

class PropertyResponse(BaseModel):
    id: str
    title: str
    description: str
    address: str
    pricePerMonth: float
    sizeSqft: int
    propertyType: str
    amenities: List[str]
    images: List[str]
    isExternal: bool
    sourceUrl: str

@app.post("/scrape", response_model=List[PropertyResponse])
async def scrape_properties(req: ScrapeRequest):
    try:
        # In a real scenario, we would use BeautifulSoup or Playwright here to scrape
        # actual external commercial real estate platforms based on req.location and req.propertyType.
        # For this implementation, we will generate realistic synthetic data mimicking the scraper output.
        
        # Simulate network latency and processing
        # await asyncio.sleep(1)
        
        base_price = req.maxPrice if req.maxPrice else random.randint(2000, 10000)
        
        mock_properties = [
            PropertyResponse(
                id=str(uuid.uuid4()),
                title=f"Premium {req.propertyType} Space with Excellent Logistics",
                description=f"A freshly renovated {req.propertyType.lower()} facility located perfectly for distribution and operations. High clearance, secure access, and flexible terms available immediately.",
                address=req.location,
                pricePerMonth=base_price * 0.9,
                sizeSqft=random.randint(2000, 8000),
                propertyType=req.propertyType.upper() if req.propertyType else "WAREHOUSE",
                amenities=["High Clearance", "Loading Dock", "24/7 Security", "3-Phase Power"],
                images=["https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"],
                isExternal=True,
                sourceUrl="https://example.com/external-listing-1"
            ),
            PropertyResponse(
                id=str(uuid.uuid4()),
                title=f"Industrial {req.propertyType} Hub - Move In Ready",
                description=f"Spacious and well-maintained {req.propertyType.lower()} unit. Perfect for modern logistics, light manufacturing, or e-commerce fulfillment centers.",
                address=req.location,
                pricePerMonth=base_price * 0.95,
                sizeSqft=random.randint(3000, 12000),
                propertyType=req.propertyType.upper() if req.propertyType else "FLEX",
                amenities=["Drive-in Door", "Office Buildout", "Ample Parking"],
                images=["https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"],
                isExternal=True,
                sourceUrl="https://example.com/external-listing-2"
            )
        ]
        
        return mock_properties

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
