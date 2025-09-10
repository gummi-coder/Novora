"""
Cache configuration and utilities using Redis
"""
import json
import logging
from typing import Any, Optional, Union
from functools import wraps
from app.core.database import get_redis_client
from app.core.config import settings

logger = logging.getLogger(__name__)

class CacheManager:
    """Redis cache manager with TTL and prefix support"""
    
    def __init__(self):
        self.prefix = settings.CACHE_PREFIX
        self.default_ttl = settings.CACHE_TTL
        self.client = None
    
    def _get_client(self):
        """Get Redis client with lazy initialization"""
        if self.client is None:
            self.client = get_redis_client()
        return self.client
    
    def _get_key(self, key: str) -> str:
        """Get prefixed cache key"""
        return f"{self.prefix}:{key}"
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set cache value with TTL"""
        try:
            client = self._get_client()
            if client is None:
                return False
            
            cache_key = self._get_key(key)
            serialized_value = json.dumps(value)
            ttl = ttl or self.default_ttl
            
            result = client.setex(cache_key, ttl, serialized_value)
            logger.debug(f"Cache SET: {cache_key} (TTL: {ttl}s)")
            return result
        except Exception as e:
            logger.error(f"Cache SET failed for key {key}: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get cache value"""
        try:
            client = self._get_client()
            if client is None:
                return None
            
            cache_key = self._get_key(key)
            value = client.get(cache_key)
            
            if value is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return json.loads(value)
            else:
                logger.debug(f"Cache MISS: {cache_key}")
                return None
        except Exception as e:
            logger.error(f"Cache GET failed for key {key}: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """Delete cache key"""
        try:
            client = self._get_client()
            if client is None:
                return False
            
            cache_key = self._get_key(key)
            result = client.delete(cache_key)
            logger.debug(f"Cache DELETE: {cache_key}")
            return result > 0
        except Exception as e:
            logger.error(f"Cache DELETE failed for key {key}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if cache key exists"""
        try:
            client = self._get_client()
            if client is None:
                return False
            
            cache_key = self._get_key(key)
            return client.exists(cache_key) > 0
        except Exception as e:
            logger.error(f"Cache EXISTS failed for key {key}: {e}")
            return False
    
    def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for cache key"""
        try:
            client = self._get_client()
            if client is None:
                return False
            
            cache_key = self._get_key(key)
            result = client.expire(cache_key, ttl)
            logger.debug(f"Cache EXPIRE: {cache_key} (TTL: {ttl}s)")
            return result
        except Exception as e:
            logger.error(f"Cache EXPIRE failed for key {key}: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        try:
            client = self._get_client()
            if client is None:
                return 0
            
            full_pattern = self._get_key(pattern)
            keys = client.keys(full_pattern)
            
            if keys:
                deleted = client.delete(*keys)
                logger.debug(f"Cache CLEAR PATTERN: {full_pattern} ({deleted} keys)")
                return deleted
            return 0
        except Exception as e:
            logger.error(f"Cache CLEAR PATTERN failed for pattern {pattern}: {e}")
            return 0
    
    def clear_all(self) -> int:
        """Clear all cache keys with prefix"""
        return self.clear_pattern("*")

# Global cache instance
cache = CacheManager()

def cached(ttl: Optional[int] = None, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache first
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

def invalidate_cache(pattern: str):
    """Decorator to invalidate cache after function execution"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            cache.clear_pattern(pattern)
            return result
        return wrapper
    return decorator
