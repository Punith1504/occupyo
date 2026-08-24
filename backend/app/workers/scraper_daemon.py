import asyncio
import hashlib
import time
import json
import httpx
from typing import List, Dict, Any
from playwright.async_api import async_playwright
import redis.asyncio as redis
import os
import sys

# Setup imports from the app if needed, though this is a standalone worker
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from app.core.config import settings
from app.core.logging import logger

# Connect to Redis
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# API Webhook URL
WEBHOOK_URL = f"http://localhost:8000/api/v1/webhooks/ingest"

# Keywords for our intent matching
KEYWORDS = ["seeking warehouse sublease", "office space wanted", "commercial retail lease", "looking for industrial space"]

class TokenBucketRateLimiter:
    """Basic Token Bucket Rate Limiter to respect scraping limits."""
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate # tokens per second
        self.last_update = time.monotonic()
        
    async def acquire(self):
        while True:
            now = time.monotonic()
            elapsed = now - self.last_update
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
            self.last_update = now
            
            if self.tokens >= 1:
                self.tokens -= 1
                return
            else:
                await asyncio.sleep(1 / self.refill_rate)

async def check_duplicate(content: str) -> bool:
    """Uses Redis to check if we've already ingested this exact text content."""
    content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
    # Check if hash exists
    exists = await redis_client.exists(f"seen_lead:{content_hash}")
    if not exists:
        # Mark as seen, expire in 30 days
        await redis_client.setex(f"seen_lead:{content_hash}", 2592000, "1")
        return False
    return True

async def dispatch_lead(source: str, content: str):
    """Sends the unique lead to the FastAPI ingestion webhook."""
    logger.info(f"Dispatching new lead from {source}")
    payload = {
        "source": source,
        "content": content
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(WEBHOOK_URL, json=payload, timeout=5.0)
            if response.status_code == 200:
                logger.info(f"Successfully dispatched lead from {source}")
            else:
                logger.error(f"Failed to dispatch lead, status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error calling webhook: {e}")

async def scrape_reddit_api(limiter: TokenBucketRateLimiter):
    """Uses a mock or real JSON API approach to find relevant posts."""
    logger.info("Starting Reddit API Scraper...")
    async with httpx.AsyncClient() as client:
        while True:
            for keyword in KEYWORDS:
                await limiter.acquire()
                # Real implementation would hit reddit.com/search.json?q=...
                # For this demonstration, we simulate finding a post occasionally
                logger.debug(f"Searching API for: {keyword}")
                
                # Mock finding a lead
                if int(time.time()) % 15 == 0: # Simulate a find every 15 seconds roughly across the loop
                    mock_content = f"Hey everyone, we are an AI startup {keyword}. Need about 5000 sqft in Austin by next month."
                    is_dup = await check_duplicate(mock_content)
                    if not is_dup:
                        await dispatch_lead("reddit_api", mock_content)
                
            await asyncio.sleep(30) # Poll every 30 seconds

async def scrape_classifieds(limiter: TokenBucketRateLimiter):
    """Uses Playwright to autonomously navigate classifieds (simulated)."""
    logger.info("Starting Classifieds Playwright Scraper...")
    
    # We use a user-agent rotation strategy in production.
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
    ]
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        while True:
            await limiter.acquire()
            
            # Simulated navigation to a classifieds site
            context = await browser.new_context(user_agent=user_agents[int(time.time()) % 2])
            page = await context.new_page()
            
            try:
                # In a real app: await page.goto("https://some-classified-site.com/commercial")
                # For safety and since we don't have a real target, we simulate the text extraction
                logger.debug("Scraping classifieds page...")
                
                # Mock extraction
                if int(time.time()) % 20 == 0:
                    mock_content = "Classified Ad: Looking for industrial space with heavy power, approx 12,000 SF in Southpark."
                    if not await check_duplicate(mock_content):
                        await dispatch_lead("classifieds_crawler", mock_content)
            except Exception as e:
                logger.error(f"Playwright scraping error: {e}")
            finally:
                await context.close()
                
            await asyncio.sleep(45)

async def main():
    logger.info("Occupyo Autonomous Scraper Daemon Initializing...")
    
    # Limit to 1 request per 2 seconds globally across tasks for politeness
    limiter = TokenBucketRateLimiter(capacity=2, refill_rate=0.5)
    
    # Run multiple scrapers concurrently
    await asyncio.gather(
        scrape_reddit_api(limiter),
        scrape_classifieds(limiter)
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Scraper Daemon Shutdown.")
