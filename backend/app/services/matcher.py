from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from ..models.schemas import DemandLead, Listing, MatchEvent, LeadStatus
from typing import List

class MatcherService:
    def __init__(self, db: Session):
        self.db = db
        
    def find_matches_for_lead(self, lead_id: str, limit: int = 5, threshold: float = 0.5) -> List[MatchEvent]:
        """
        Executes a hybrid search combining vector similarity and metadata filtering
        to find relevant commercial listings for a demand lead.
        """
        lead = self.db.query(DemandLead).filter(DemandLead.id == lead_id).first()
        if not lead or not lead.embedding:
            return []

        # We construct a query that:
        # 1. Filters by exact metadata match (City, Property Type)
        # 2. Orders by vector cosine distance
        
        # pgvector cosine distance operator is <=>
        # We convert distance to similarity: similarity = 1 - distance
        cosine_distance = Listing.embedding.cosine_distance(lead.embedding)
        similarity_score = 1.0 - cosine_distance

        query = (
            select(Listing, similarity_score.label('similarity'))
            .filter(
                and_(
                    Listing.is_active == True,
                    Listing.property_type == lead.property_type,
                    func.lower(Listing.city) == func.lower(lead.target_city)
                )
            )
        )
        
        # Add square footage constraints if specified
        if lead.min_square_footage:
             query = query.filter(Listing.square_footage >= (lead.min_square_footage * 0.8)) # 20% tolerance
        if lead.max_square_footage:
             query = query.filter(Listing.square_footage <= (lead.max_square_footage * 1.2))

        # Order by similarity
        query = query.order_by(cosine_distance).limit(limit)
        
        results = self.db.execute(query).all()
        
        match_events = []
        for listing, similarity in results:
            if similarity >= threshold:
                # Create a MatchEvent record
                match = MatchEvent(
                    lead_id=lead.id,
                    listing_id=listing.id,
                    broker_id=listing.broker_id,
                    match_score=float(similarity)
                )
                self.db.add(match)
                match_events.append(match)
        
        if match_events:
            lead.status = LeadStatus.MATCHED.value
            self.db.commit()
            
        return match_events
