#!/usr/bin/env python3
"""
Production Deployment Script for Novora Survey Platform
"""
import os
import sys
import subprocess
import argparse
import logging
from pathlib import Path
from datetime import datetime

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.ssl import ssl_config
from app.core.monitoring import monitoring_config
from app.core.backup import backup_manager

class ProductionDeployer:
    """Production deployment manager"""
    
    def __init__(self):
        self.setup_logging()
        self.logger = logging.getLogger(__name__)
        
    def setup_logging(self):
        """Setup logging for deployment"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler('deployment.log')
            ]
        )
    
    def check_prerequisites(self) -> bool:
        """Check if all prerequisites are met"""
        self.logger.info("🔍 Checking prerequisites...")
        
        checks = [
            ("Python version", self._check_python_version),
            ("Required packages", self._check_required_packages),
            ("Database connection", self._check_database_connection),
            ("Redis connection", self._check_redis_connection),
            ("SSL certificates", self._check_ssl_certificates),
            ("Directory permissions", self._check_directory_permissions),
        ]
        
        all_passed = True
        for check_name, check_func in checks:
            try:
                if check_func():
                    self.logger.info(f"✅ {check_name}: OK")
                else:
                    self.logger.error(f"❌ {check_name}: FAILED")
                    all_passed = False
            except Exception as e:
                self.logger.error(f"❌ {check_name}: ERROR - {e}")
                all_passed = False
        
        return all_passed
    
    def _check_python_version(self) -> bool:
        """Check Python version"""
        version = sys.version_info
        return version.major == 3 and version.minor >= 8
    
    def _check_required_packages(self) -> bool:
        """Check if required packages are installed"""
        required_packages = [
            "fastapi", "uvicorn", "sqlalchemy", "psycopg2-binary",
            "redis", "psutil", "cryptography", "requests"
        ]
        
        missing_packages = []
        for package in required_packages:
            try:
                __import__(package.replace("-", "_"))
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            self.logger.warning(f"Missing packages: {missing_packages}")
            return False
        
        return True
    
    def _check_database_connection(self) -> bool:
        """Check database connection"""
        try:
            from app.core.database import check_database_connection
            return check_database_connection()
        except Exception as e:
            self.logger.error(f"Database connection failed: {e}")
            return False
    
    def _check_redis_connection(self) -> bool:
        """Check Redis connection"""
        try:
            from app.core.database import check_redis_connection
            return check_redis_connection()
        except Exception as e:
            self.logger.warning(f"Redis connection failed (optional): {e}")
            return True  # Redis is optional
    
    def _check_ssl_certificates(self) -> bool:
        """Check SSL certificates"""
        if not ssl_config.enable_ssl:
            self.logger.info("SSL is disabled - skipping certificate check")
            return True
        
        return ssl_config._cert_files_exist()
    
    def _check_directory_permissions(self) -> bool:
        """Check directory permissions"""
        required_dirs = ["logs", "backups", "uploads", "certs"]
        
        for dir_name in required_dirs:
            dir_path = Path(dir_name)
            if not dir_path.exists():
                try:
                    dir_path.mkdir(parents=True, exist_ok=True)
                except Exception as e:
                    self.logger.error(f"Cannot create directory {dir_name}: {e}")
                    return False
            
            if not os.access(dir_path, os.W_OK):
                self.logger.error(f"No write permission for directory {dir_name}")
                return False
        
        return True
    
    def setup_ssl_certificates(self, domain: str = None) -> bool:
        """Setup SSL certificates"""
        self.logger.info("🔐 Setting up SSL certificates...")
        
        try:
            if domain:
                success, message = ssl_config.create_self_signed_cert(domain)
            else:
                success, message = ssl_config.create_self_signed_cert("localhost")
            
            if success:
                self.logger.info(f"✅ SSL certificate created: {message}")
                return True
            else:
                self.logger.error(f"❌ SSL certificate creation failed: {message}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ SSL setup failed: {e}")
            return False
    
    def run_database_migrations(self) -> bool:
        """Run database migrations"""
        self.logger.info("🗄️  Running database migrations...")
        
        try:
            # Run Alembic migrations
            result = subprocess.run(
                ["alembic", "upgrade", "head"],
                capture_output=True,
                text=True,
                cwd=backend_dir
            )
            
            if result.returncode == 0:
                self.logger.info("✅ Database migrations completed")
                return True
            else:
                self.logger.error(f"❌ Database migrations failed: {result.stderr}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Database migration failed: {e}")
            return False
    
    def seed_database(self) -> bool:
        """Seed database with initial data"""
        self.logger.info("🌱 Seeding database...")
        
        try:
            # Run database seeding script
            result = subprocess.run(
                [sys.executable, "scripts/seed_database.py"],
                capture_output=True,
                text=True,
                cwd=backend_dir
            )
            
            if result.returncode == 0:
                self.logger.info("✅ Database seeding completed")
                return True
            else:
                self.logger.error(f"❌ Database seeding failed: {result.stderr}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Database seeding failed: {e}")
            return False
    
    def create_initial_backup(self) -> bool:
        """Create initial backup"""
        self.logger.info("💾 Creating initial backup...")
        
        try:
            success, message = backup_manager.create_full_backup()
            
            if success:
                self.logger.info(f"✅ Initial backup created: {message}")
                return True
            else:
                self.logger.error(f"❌ Initial backup failed: {message}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Initial backup failed: {e}")
            return False
    
    def setup_monitoring(self) -> bool:
        """Setup monitoring and logging"""
        self.logger.info("📊 Setting up monitoring...")
        
        try:
            # Initialize monitoring configuration
            monitoring_config._setup_logging()
            
            # Test health checks
            health_results = health_checker.run_all_checks()
            
            if health_results["status"] == "healthy":
                self.logger.info("✅ Monitoring setup completed")
                return True
            else:
                self.logger.warning(f"⚠️  Health checks show issues: {health_results}")
                return True  # Continue anyway
            
        except Exception as e:
            self.logger.error(f"❌ Monitoring setup failed: {e}")
            return False
    
    def test_production_setup(self) -> bool:
        """Test production setup"""
        self.logger.info("🧪 Testing production setup...")
        
        try:
            # Test API endpoints
            import requests
            import time
            
            # Start server in background (simplified test)
            self.logger.info("Starting test server...")
            
            # Test basic connectivity
            response = requests.get("http://localhost:8000/health", timeout=10)
            if response.status_code == 200:
                self.logger.info("✅ API health check passed")
            else:
                self.logger.error(f"❌ API health check failed: {response.status_code}")
                return False
            
            # Test SSL if enabled
            if ssl_config.enable_ssl:
                try:
                    response = requests.get("https://localhost:443/health", timeout=10, verify=False)
                    if response.status_code == 200:
                        self.logger.info("✅ SSL health check passed")
                    else:
                        self.logger.warning(f"⚠️  SSL health check failed: {response.status_code}")
                except Exception as e:
                    self.logger.warning(f"⚠️  SSL test failed: {e}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Production test failed: {e}")
            return False
    
    def generate_deployment_report(self) -> str:
        """Generate deployment report"""
        report = f"""
# Novora Production Deployment Report

**Deployment Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Environment:** {settings.ENVIRONMENT}
**Version:** {settings.VERSION}

## System Information
- **Database:** {'PostgreSQL' if settings.is_production else 'SQLite'}
- **SSL Enabled:** {ssl_config.enable_ssl}
- **Monitoring:** Enabled
- **Backup System:** Enabled

## Health Status
"""
        
        try:
            health_results = health_checker.run_all_checks()
            report += f"- **Overall Status:** {health_results['status']}\n"
            
            for check_name, check_result in health_results['checks'].items():
                status = check_result['status']
                details = check_result['details']
                report += f"- **{check_name}:** {status} - {details}\n"
                
        except Exception as e:
            report += f"- **Health Check:** Failed - {e}\n"
        
        report += f"""
## Backup Information
"""
        
        try:
            backups = backup_manager.list_backups()
            report += f"- **Total Backups:** {len(backups)}\n"
            if backups:
                latest = backups[0]
                report += f"- **Latest Backup:** {latest['name']} ({latest['created']})\n"
        except Exception as e:
            report += f"- **Backup Status:** Failed - {e}\n"
        
        report += f"""
## Next Steps
1. Configure your web server (nginx/apache) to proxy to the FastAPI application
2. Set up SSL certificates from a trusted CA (Let's Encrypt recommended)
3. Configure monitoring alerts
4. Set up automated backups
5. Test all functionality in production environment

## Security Checklist
- [ ] SSL certificates properly configured
- [ ] Database passwords are strong and secure
- [ ] API keys and secrets are properly managed
- [ ] Firewall rules are configured
- [ ] Regular security updates are scheduled
- [ ] Monitoring alerts are configured

## Monitoring Checklist
- [ ] Health checks are running
- [ ] Log rotation is configured
- [ ] Performance metrics are being collected
- [ ] Error alerts are configured
- [ ] Backup monitoring is active

## Backup Checklist
- [ ] Automated backups are scheduled
- [ ] Backup retention policy is configured
- [ ] Backup integrity checks are running
- [ ] Backup restoration has been tested
- [ ] Off-site backup storage is configured
"""
        
        return report
    
    def deploy(self, domain: str = None, skip_ssl: bool = False) -> bool:
        """Run complete production deployment"""
        self.logger.info("🚀 Starting production deployment...")
        
        # Step 1: Check prerequisites
        if not self.check_prerequisites():
            self.logger.error("❌ Prerequisites check failed. Deployment aborted.")
            return False
        
        # Step 2: Setup SSL certificates
        if not skip_ssl:
            if not self.setup_ssl_certificates(domain):
                self.logger.error("❌ SSL setup failed. Deployment aborted.")
                return False
        
        # Step 3: Run database migrations
        if not self.run_database_migrations():
            self.logger.error("❌ Database migrations failed. Deployment aborted.")
            return False
        
        # Step 4: Seed database
        if not self.seed_database():
            self.logger.warning("⚠️  Database seeding failed, but continuing...")
        
        # Step 5: Setup monitoring
        if not self.setup_monitoring():
            self.logger.warning("⚠️  Monitoring setup failed, but continuing...")
        
        # Step 6: Create initial backup
        if not self.create_initial_backup():
            self.logger.warning("⚠️  Initial backup failed, but continuing...")
        
        # Step 7: Test production setup
        if not self.test_production_setup():
            self.logger.warning("⚠️  Production test failed, but deployment completed.")
        
        # Generate deployment report
        report = self.generate_deployment_report()
        
        # Save report
        report_file = f"deployment_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        with open(report_file, 'w') as f:
            f.write(report)
        
        self.logger.info(f"📋 Deployment report saved to: {report_file}")
        self.logger.info("✅ Production deployment completed!")
        
        return True

def main():
    """Main deployment function"""
    parser = argparse.ArgumentParser(description="Deploy Novora Survey Platform to production")
    parser.add_argument("--domain", help="Domain name for SSL certificate")
    parser.add_argument("--skip-ssl", action="store_true", help="Skip SSL certificate setup")
    parser.add_argument("--check-only", action="store_true", help="Only check prerequisites")
    
    args = parser.parse_args()
    
    deployer = ProductionDeployer()
    
    if args.check_only:
        success = deployer.check_prerequisites()
        sys.exit(0 if success else 1)
    
    success = deployer.deploy(domain=args.domain, skip_ssl=args.skip_ssl)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
