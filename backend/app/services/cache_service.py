"""
Simplified Cache Service for MVP
"""
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class CacheService:
    """Simplified cache service for MVP (no Redis dependency)"""
    
    def __init__(self):
        logger.info("Cache service initialized (simplified for MVP)")
    
    def get_kpis_cache(self, org_id: str, team_id: Optional[str], survey_id: str) -> Optional[Dict[str, Any]]:
        """Get cached KPIs data (simplified - always returns None for MVP)"""
        return None
    
    def set_kpis_cache(self, org_id: str, team_id: Optional[str], survey_id: str, kpis_data: Dict[str, Any], ttl_minutes: int = 10) -> bool:
        """Cache KPIs data (simplified - no-op for MVP)"""
        return True
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics (simplified for MVP)"""
        return {
            "connected": False,
            "message": "Cache disabled for MVP"
        }

# Global cache service instance
cache_service = CacheService()
