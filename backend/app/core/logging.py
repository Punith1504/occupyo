import logging
import json
import uuid
from typing import Any
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class JSONFormatter(logging.Formatter):
    """Custom structured JSON formatter."""
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger_name": record.name,
            "timestamp": self.formatTime(record, self.datefmt),
        }
        
        # Inject request_id if available on the record
        if hasattr(record, 'request_id'):
            log_record['request_id'] = record.request_id
            
        if record.exc_info:
            log_record["exc_info"] = self.formatException(record.exc_info)
            
        return json.dumps(log_record)

def setup_logging():
    logger = logging.getLogger("occupyo")
    logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    logger.handlers = []
    
    handler = logging.StreamHandler()
    formatter = JSONFormatter()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

logger = setup_logging()

class RequestIdFilter(logging.Filter):
    def __init__(self, request_id: str):
        super().__init__()
        self.request_id = request_id

    def filter(self, record):
        record.request_id = self.request_id
        return True

class RequestContextLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Any):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        
        # Attach request_id to state
        request.state.request_id = request_id
        
        # Add filter for the duration of this request in a real app (simplified here)
        # We can pass request_id to our application logs
        logger.info(f"Incoming Request: {request.method} {request.url.path}", extra={"request_id": request_id})
        
        response = await call_next(request)
        
        # Ensure we return the ID back to the client
        response.headers["X-Request-ID"] = request_id
        logger.info(f"Outgoing Response: {response.status_code}", extra={"request_id": request_id})
        
        return response
