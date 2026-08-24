import hashlib
import json
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.schemas import Broker, AuditLedger
from ..core.logging import logger

class VerificationEngine:
    def __init__(self, db: Session):
        self.db = db

    def _mock_state_registry_lookup(self, license_number: str, state: str = "TX") -> dict:
        """
        Simulates an API call to a state regulatory body (e.g. TREC in Texas) 
        to verify a commercial real estate broker's license.
        """
        # For demonstration, we assume any license starting with 'V' is verified and active.
        if license_number and license_number.upper().startswith('V'):
            return {
                "status": "ACTIVE",
                "disciplinary_actions": 0,
                "years_active": 5
            }
        return {
            "status": "INVALID_OR_EXPIRED",
            "disciplinary_actions": 0,
            "years_active": 0
        }

    def verify_broker_license(self, broker_id: str, license_number: str) -> bool:
        """
        Validates the broker's license and updates their verified status.
        Also writes an immutable receipt to the audit ledger.
        """
        broker = self.db.query(Broker).filter(Broker.id == broker_id).first()
        if not broker:
            logger.error(f"Cannot verify license: Broker {broker_id} not found.")
            return False

        registry_response = self._mock_state_registry_lookup(license_number)
        
        is_valid = registry_response["status"] == "ACTIVE"
        broker.is_verified = is_valid
        
        if is_valid:
            # Calculate a trust/reliability score based on history
            base_score = 1.0
            history_bonus = min(0.5, registry_response["years_active"] * 0.1)
            broker.performance_score = base_score + history_bonus
            
            # Generate cryptographic receipt
            self._record_audit_receipt(
                entity_type="Broker",
                entity_id=broker_id,
                action="LICENSE_VERIFICATION",
                payload={"license_number": license_number, "registry_data": registry_response}
            )
            
        self.db.commit()
        return is_valid

    def generate_property_title_receipt(self, listing_id: int, title_deed_data: dict) -> str:
        """
        Generates a cryptographic SHA-256 hash receipt for verified property titles
        to guarantee tenant credibility.
        """
        receipt_hash = self._record_audit_receipt(
            entity_type="Listing",
            entity_id=str(listing_id),
            action="TITLE_DEED_VERIFICATION",
            payload=title_deed_data
        )
        self.db.commit()
        return receipt_hash

    def _record_audit_receipt(self, entity_type: str, entity_id: str, action: str, payload: dict) -> str:
        """
        Creates an immutable cryptographic hash of the verification event and stores it.
        """
        payload["timestamp"] = datetime.utcnow().isoformat()
        
        # Canonical JSON string for stable hashing
        canonical_string = json.dumps(payload, sort_keys=True)
        hash_receipt = hashlib.sha256(canonical_string.encode('utf-8')).hexdigest()
        
        audit_record = AuditLedger(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            hash_receipt=hash_receipt
        )
        self.db.add(audit_record)
        
        logger.info(f"Audit Ledger Entry Created: {action} for {entity_type} {entity_id}. Hash: {hash_receipt}")
        return hash_receipt
