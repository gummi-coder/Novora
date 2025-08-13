"""
SSL/TLS Configuration for Production
"""
import os
import ssl
from pathlib import Path
from typing import Optional, Tuple
from app.core.config import settings

class SSLConfig:
    """SSL/TLS configuration for production"""
    
    def __init__(self):
        self.cert_file = os.getenv("SSL_CERT_FILE", "certs/cert.pem")
        self.key_file = os.getenv("SSL_KEY_FILE", "certs/key.pem")
        self.ca_file = os.getenv("SSL_CA_FILE", "certs/ca.pem")
        self.enable_ssl = os.getenv("ENABLE_SSL", "false").lower() == "true"
        
    def get_ssl_context(self) -> Optional[ssl.SSLContext]:
        """Get SSL context for production"""
        if not self.enable_ssl:
            return None
            
        try:
            # Create SSL context
            ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            
            # Load certificate and key
            if self._cert_files_exist():
                ssl_context.load_cert_chain(
                    certfile=self.cert_file,
                    keyfile=self.key_file
                )
                
                # Load CA certificate if provided
                if os.path.exists(self.ca_file):
                    ssl_context.load_verify_locations(self.ca_file)
                
                # Set SSL options
                ssl_context.options |= ssl.OP_NO_SSLv2
                ssl_context.options |= ssl.OP_NO_SSLv3
                ssl_context.options |= ssl.OP_NO_TLSv1
                ssl_context.options |= ssl.OP_NO_TLSv1_1
                
                # Set cipher suite
                ssl_context.set_ciphers('ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256')
                
                # Set minimum TLS version
                ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
                
                return ssl_context
            else:
                print(f"⚠️  SSL certificate files not found. SSL disabled.")
                return None
                
        except Exception as e:
            print(f"❌ SSL configuration failed: {e}")
            return None
    
    def _cert_files_exist(self) -> bool:
        """Check if SSL certificate files exist"""
        cert_exists = os.path.exists(self.cert_file)
        key_exists = os.path.exists(self.key_file)
        
        if not cert_exists:
            print(f"⚠️  SSL certificate file not found: {self.cert_file}")
        if not key_exists:
            print(f"⚠️  SSL key file not found: {self.key_file}")
            
        return cert_exists and key_exists
    
    def create_self_signed_cert(self, domain: str = "localhost") -> Tuple[bool, str]:
        """Create self-signed certificate for development/testing"""
        try:
            from cryptography import x509
            from cryptography.x509.oid import NameOID
            from cryptography.hazmat.primitives import hashes, serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            from datetime import datetime, timedelta, timezone
            
            # Create certificates directory
            cert_dir = Path("certs")
            cert_dir.mkdir(exist_ok=True)
            
            # Generate private key
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
            )
            
            # Create certificate
            subject = issuer = x509.Name([
                x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "California"),
                x509.NameAttribute(NameOID.LOCALITY_NAME, "San Francisco"),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Novora Survey Platform"),
                x509.NameAttribute(NameOID.COMMON_NAME, domain),
            ])
            
            cert = x509.CertificateBuilder().subject_name(
                subject
            ).issuer_name(
                issuer
            ).public_key(
                private_key.public_key()
            ).serial_number(
                x509.random_serial_number()
            ).not_valid_before(
                datetime.now(timezone.utc)
            ).not_valid_after(
                datetime.now(timezone.utc) + timedelta(days=365)
            ).add_extension(
                x509.SubjectAlternativeName([
                    x509.DNSName(domain),
                    x509.DNSName(f"*.{domain}"),
                ]),
                critical=False,
            ).sign(private_key, hashes.SHA256())
            
            # Write certificate and key files
            with open(self.cert_file, "wb") as f:
                f.write(cert.public_bytes(serialization.Encoding.PEM))
                
            with open(self.key_file, "wb") as f:
                f.write(private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            
            return True, f"Self-signed certificate created for {domain}"
            
        except ImportError:
            return False, "cryptography library not installed. Run: pip install cryptography"
        except Exception as e:
            return False, f"Failed to create certificate: {e}"
    
    def verify_certificate(self) -> Tuple[bool, str]:
        """Verify SSL certificate validity"""
        try:
            if not self._cert_files_exist():
                return False, "Certificate files not found"
            
            import ssl
            import socket
            
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            with socket.create_connection(('localhost', 443)) as sock:
                with context.wrap_socket(sock, server_hostname='localhost') as ssock:
                    cert = ssock.getpeercert()
                    return True, f"Certificate valid until: {cert['notAfter']}"
                    
        except Exception as e:
            return False, f"Certificate verification failed: {e}"

# Global SSL configuration
ssl_config = SSLConfig()
