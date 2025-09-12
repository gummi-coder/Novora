"""
Cache Service for Performance Optimization with Redis
"""
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import redis
from sqlalchemy.orm import Session

from app.core.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_CACHE_DB,
                password=settings.REDIS_PASSWORD,
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Redis connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            self.redis_client = None
    
    def _is_connected(self) -> bool:
        """Check if Redis is connected"""
        return self.redis_client is not None
    
    def _generate_key(self, *parts: str) -> str:
        """Generate cache key from parts"""
        return ":".join(str(part) for part in parts if part)
    
    def set_kpis_cache(
        self,
        org_id: str,
        team_id: Optional[str],
        survey_id: str,
        kpis_data: Dict[str, Any],
        ttl_minutes: int = 10
    ) -> bool:
        """Cache KPIs data for org/team"""
        try:
            if not self._is_connected():
                return False
            
            key = self._generate_key("org", org_id, "team", team_id or "all", "survey", survey_id, "kpis")
            ttl_seconds = ttl_minutes * 60
            
            self.redis_client.setex(
                key,
                ttl_seconds,
                json.dumps(kpis_data, default=str)
            )
            
            logger.info(f"Cached KPIs for {key} with TTL {ttl_minutes} minutes")
            return True
            
        except Exception as e:
            logger.error(f"Error caching KPIs: {str(e)}")
            return False
    
    def get_kpis_cache(
        self,
        org_id: str,
        team_id: Optional[str],
        survey_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get cached KPIs data"""
        try:
            if not self._is_connected():
                return None
            
            key = self._generate_key("org", org_id, "team", team_id or "all", "survey", survey_id, "kpis")
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.info(f"Cache hit for {key}")
                return json.loads(cached_data)
            
            logger.info(f"Cache miss for {key}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached KPIs: {str(e)}")
            return None
    
    def set_heatmap_cache(
        self,
        org_id: str,
        survey_id: str,
        heatmap_data: Dict[str, Any],
        ttl_minutes: int = 15
    ) -> bool:
        """Cache heatmap data"""
        try:
            if not self._is_connected():
                return False
            
            key = self._generate_key("org", org_id, "survey", survey_id, "heatmap")
            ttl_seconds = ttl_minutes * 60
            
            self.redis_client.setex(
                key,
                ttl_seconds,
                json.dumps(heatmap_data, default=str)
            )
            
            logger.info(f"Cached heatmap for {key} with TTL {ttl_minutes} minutes")
            return True
            
        except Exception as e:
            logger.error(f"Error caching heatmap: {str(e)}")
            return False
    
    def get_heatmap_cache(
        self,
        org_id: str,
        survey_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get cached heatmap data"""
        try:
            if not self._is_connected():
                return None
            
            key = self._generate_key("org", org_id, "survey", survey_id, "heatmap")
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.info(f"Cache hit for {key}")
                return json.loads(cached_data)
            
            logger.info(f"Cache miss for {key}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached heatmap: {str(e)}")
            return None
    
    def set_trend_cache(
        self,
        org_id: str,
        team_id: Optional[str],
        months: int,
        trend_data: Dict[str, Any],
        ttl_minutes: int = 20
    ) -> bool:
        """Cache trend data"""
        try:
            if not self._is_connected():
                return False
            
            key = self._generate_key("org", org_id, "team", team_id or "all", "trend", f"{months}m")
            ttl_seconds = ttl_minutes * 60
            
            self.redis_client.setex(
                key,
                ttl_seconds,
                json.dumps(trend_data, default=str)
            )
            
            logger.info(f"Cached trend for {key} with TTL {ttl_minutes} minutes")
            return True
            
        except Exception as e:
            logger.error(f"Error caching trend: {str(e)}")
            return False
    
    def get_trend_cache(
        self,
        org_id: str,
        team_id: Optional[str],
        months: int
    ) -> Optional[Dict[str, Any]]:
        """Get cached trend data"""
        try:
            if not self._is_connected():
                return None
            
            key = self._generate_key("org", org_id, "team", team_id or "all", "trend", f"{months}m")
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.info(f"Cache hit for {key}")
                return json.loads(cached_data)
            
            logger.info(f"Cache miss for {key}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached trend: {str(e)}")
            return None
    
    def set_themes_cache(
        self,
        org_id: str,
        survey_id: str,
        themes_data: Dict[str, Any],
        ttl_minutes: int = 30
    ) -> bool:
        """Cache themes data"""
        try:
            if not self._is_connected():
                return False
            
            key = self._generate_key("org", org_id, "survey", survey_id, "themes")
            ttl_seconds = ttl_minutes * 60
            
            self.redis_client.setex(
                key,
                ttl_seconds,
                json.dumps(themes_data, default=str)
            )
            
            logger.info(f"Cached themes for {key} with TTL {ttl_minutes} minutes")
            return True
            
        except Exception as e:
            logger.error(f"Error caching themes: {str(e)}")
            return False
    
    def get_themes_cache(
        self,
        org_id: str,
        survey_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get cached themes data"""
        try:
            if not self._is_connected():
                return None
            
            key = self._generate_key("org", org_id, "survey", survey_id, "themes")
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.info(f"Cache hit for {key}")
                return json.loads(cached_data)
            
            logger.info(f"Cache miss for {key}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached themes: {str(e)}")
            return None
    
    def invalidate_survey_cache(
        self,
        org_id: str,
        survey_id: str
    ) -> bool:
        """Invalidate all cache entries for a survey"""
        try:
            if not self._is_connected():
                return False
            
            # Get all keys matching the pattern
            pattern = self._generate_key("org", org_id, "survey", survey_id, "*")
            keys = self.redis_client.keys(pattern)
            
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache entries for survey {survey_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error invalidating survey cache: {str(e)}")
            return False
    
    def invalidate_team_cache(
        self,
        org_id: str,
        team_id: str
    ) -> bool:
        """Invalidate all cache entries for a team"""
        try:
            if not self._is_connected():
                return False
            
            # Get all keys matching the pattern
            pattern = self._generate_key("org", org_id, "team", team_id, "*")
            keys = self.redis_client.keys(pattern)
            
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache entries for team {team_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error invalidating team cache: {str(e)}")
            return False
    
    def invalidate_org_cache(
        self,
        org_id: str
    ) -> bool:
        """Invalidate all cache entries for an organization"""
        try:
            if not self._is_connected():
                return False
            
            # Get all keys matching the pattern
            pattern = self._generate_key("org", org_id, "*")
            keys = self.redis_client.keys(pattern)
            
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache entries for org {org_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error invalidating org cache: {str(e)}")
            return False
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            if not self._is_connected():
                return {"error": "Redis not connected"}
            
            info = self.redis_client.info()
            
            return {
                "connected": True,
                "used_memory": info.get("used_memory_human", "Unknown"),
                "connected_clients": info.get("connected_clients", 0),
                "total_commands_processed": info.get("total_commands_processed", 0),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": self._calculate_hit_rate(info)
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_hit_rate(self, info: Dict[str, Any]) -> float:
        """Calculate cache hit rate"""
        hits = info.get("keyspace_hits", 0)
        misses = info.get("keyspace_misses", 0)
        total = hits + misses
        
        if total == 0:
            return 0.0
        
        return round((hits / total) * 100, 2)
    
    def clear_all_cache(self) -> bool:
        """Clear all cache entries (use with caution)"""
        try:
            if not self._is_connected():
                return False
            
            self.redis_client.flushdb()
            logger.warning("All cache entries cleared")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
            return False

# Global cache service instance
cache_service = CacheService()
