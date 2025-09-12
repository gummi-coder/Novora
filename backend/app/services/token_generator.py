"""
Token Generator Service
Generates secure, unique tokens for survey invitations
"""
import secrets
import string
import hashlib
from typing import Optional
import uuid

class TokenGenerator:
    """Generates secure tokens for survey invitations"""
    
    def __init__(self, token_length: int = 32):
        """
        Initialize token generator
        
        Args:
            token_length: Length of generated tokens (default: 32)
        """
        self.token_length = token_length
        self.alphabet = string.ascii_letters + string.digits
    
    def generate_token(self) -> str:
        """
        Generate a secure, random token
        
        Returns:
            A secure random token string
        """
        return ''.join(secrets.choice(self.alphabet) for _ in range(self.token_length))
    
    def generate_uuid_token(self) -> str:
        """
        Generate a UUID-based token
        
        Returns:
            A UUID-based token string
        """
        return str(uuid.uuid4()).replace('-', '')
    
    def generate_hash_token(self, base_data: str, salt: Optional[str] = None) -> str:
        """
        Generate a hash-based token from base data
        
        Args:
            base_data: Base data to hash
            salt: Optional salt for additional security
            
        Returns:
            A hash-based token string
        """
        if salt is None:
            salt = secrets.token_hex(16)
        
        data_to_hash = f"{base_data}:{salt}"
        hash_obj = hashlib.sha256(data_to_hash.encode())
        return hash_obj.hexdigest()[:self.token_length]
    
    def validate_token_format(self, token: str) -> bool:
        """
        Validate token format
        
        Args:
            token: Token to validate
            
        Returns:
            True if token format is valid
        """
        if not token or len(token) != self.token_length:
            return False
        
        # Check if token contains only valid characters
        return all(c in self.alphabet for c in token)
    
    def generate_batch_tokens(self, count: int) -> list[str]:
        """
        Generate multiple tokens at once
        
        Args:
            count: Number of tokens to generate
            
        Returns:
            List of generated tokens
        """
        tokens = []
        for _ in range(count):
            tokens.append(self.generate_token())
        return tokens
