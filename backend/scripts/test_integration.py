#!/usr/bin/env python3
"""
Integration test script for Novora Survey Platform
Tests frontend-backend communication, CORS, and authentication flow
"""
import requests
import json
import time
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings

class IntegrationTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message="", data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "data": data
        })
        
        return success
    
    def test_backend_health(self):
        """Test basic backend health"""
        try:
            response = self.session.get(f"{self.base_url}/api/v1/health")
            if response.status_code == 200:
                data = response.json()
                return self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend is healthy - Status: {data.get('status')}, Version: {data.get('version')}",
                    data
                )
            else:
                return self.log_test(
                    "Backend Health Check",
                    False,
                    f"Backend returned status {response.status_code}"
                )
        except Exception as e:
            return self.log_test(
                "Backend Health Check",
                False,
                f"Failed to connect to backend: {str(e)}"
            )
    
    def test_api_health(self):
        """Test API health with database and Redis status"""
        try:
            response = self.session.get(f"{self.base_url}/api/v1/health")
            if response.status_code == 200:
                data = response.json()
                services = data.get('services', {})
                db_status = services.get('database', 'unknown')
                redis_status = services.get('redis', 'unknown')
                
                return self.log_test(
                    "API Health Check",
                    True,
                    f"API is healthy - DB: {db_status}, Redis: {redis_status}",
                    data
                )
            else:
                return self.log_test(
                    "API Health Check",
                    False,
                    f"API returned status {response.status_code}"
                )
        except Exception as e:
            return self.log_test(
                "API Health Check",
                False,
                f"Failed to connect to API: {str(e)}"
            )
    
    def test_cors_preflight(self):
        """Test CORS preflight request"""
        try:
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            
            response = self.session.options(
                f"{self.base_url}/api/v1/auth/login",
                headers=headers
            )
            
            if response.status_code == 200:
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                }
                
                return self.log_test(
                    "CORS Preflight",
                    True,
                    f"CORS preflight successful - Allow-Origin: {cors_headers['Access-Control-Allow-Origin']}",
                    cors_headers
                )
            else:
                return self.log_test(
                    "CORS Preflight",
                    False,
                    f"CORS preflight failed with status {response.status_code}"
                )
        except Exception as e:
            return self.log_test(
                "CORS Preflight",
                False,
                f"CORS preflight failed: {str(e)}"
            )
    
    def test_user_registration(self):
        """Test user registration"""
        try:
            test_email = f"test_{int(time.time())}@example.com"
            test_password = "TestPassword123!"
            
            registration_data = {
                "email": test_email,
                "password": test_password,
                "company_name": "Test Company"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/v1/auth/register",
                json=registration_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                data = response.json()
                return self.log_test(
                    "User Registration",
                    True,
                    f"User registered successfully - ID: {data.get('user_id')}",
                    {"email": test_email, "user_id": data.get('user_id')}
                )
            else:
                error_data = response.json() if response.content else {}
                return self.log_test(
                    "User Registration",
                    False,
                    f"Registration failed with status {response.status_code}: {error_data.get('detail', 'Unknown error')}"
                )
        except Exception as e:
            return self.log_test(
                "User Registration",
                False,
                f"Registration failed: {str(e)}"
            )
    
    def test_user_login(self):
        """Test user login"""
        try:
            test_email = f"test_{int(time.time())}@example.com"
            test_password = "TestPassword123!"
            
            # First register a user
            registration_data = {
                "email": test_email,
                "password": test_password,
                "company_name": "Test Company"
            }
            
            reg_response = self.session.post(
                f"{self.base_url}/api/v1/auth/register",
                json=registration_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if reg_response.status_code != 201:
                return self.log_test(
                    "User Login",
                    False,
                    "Failed to register test user for login test"
                )
            
            # Now test login
            login_data = {
                "username": test_email,
                "password": test_password
            }
            
            response = self.session.post(
                f"{self.base_url}/api/v1/auth/login",
                data=login_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                data = response.json()
                access_token = data.get('access_token')
                
                if access_token:
                    return self.log_test(
                        "User Login",
                        True,
                        f"Login successful - Token received",
                        {"email": test_email, "has_token": bool(access_token)}
                    )
                else:
                    return self.log_test(
                        "User Login",
                        False,
                        "Login successful but no access token received"
                    )
            else:
                error_data = response.json() if response.content else {}
                return self.log_test(
                    "User Login",
                    False,
                    f"Login failed with status {response.status_code}: {error_data.get('detail', 'Unknown error')}"
                )
        except Exception as e:
            return self.log_test(
                "User Login",
                False,
                f"Login failed: {str(e)}"
            )
    
    def test_authenticated_endpoint(self):
        """Test authenticated endpoint access"""
        try:
            test_email = f"test_{int(time.time())}@example.com"
            test_password = "TestPassword123!"
            
            # Register and login to get token
            registration_data = {
                "email": test_email,
                "password": test_password,
                "company_name": "Test Company"
            }
            
            reg_response = self.session.post(
                f"{self.base_url}/api/v1/auth/register",
                json=registration_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if reg_response.status_code != 201:
                return self.log_test(
                    "Authenticated Endpoint",
                    False,
                    "Failed to register test user for auth test"
                )
            
            login_data = {
                "username": test_email,
                "password": test_password
            }
            
            login_response = self.session.post(
                f"{self.base_url}/api/v1/auth/login",
                data=login_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if login_response.status_code != 200:
                return self.log_test(
                    "Authenticated Endpoint",
                    False,
                    "Failed to login for auth test"
                )
            
            login_data = login_response.json()
            access_token = login_data.get('access_token')
            
            # Test authenticated endpoint
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{self.base_url}/api/v1/users/me",
                headers=headers
            )
            
            if response.status_code == 200:
                user_data = response.json()
                return self.log_test(
                    "Authenticated Endpoint",
                    True,
                    f"Authenticated access successful - User: {user_data.get('email')}",
                    {"email": user_data.get('email'), "id": user_data.get('id')}
                )
            else:
                error_data = response.json() if response.content else {}
                return self.log_test(
                    "Authenticated Endpoint",
                    False,
                    f"Authenticated access failed with status {response.status_code}: {error_data.get('detail', 'Unknown error')}"
                )
        except Exception as e:
            return self.log_test(
                "Authenticated Endpoint",
                False,
                f"Authenticated endpoint test failed: {str(e)}"
            )
    
    def test_survey_endpoints(self):
        """Test survey-related endpoints"""
        try:
            # First get authentication token
            test_email = f"test_{int(time.time())}@example.com"
            test_password = "TestPassword123!"
            
            # Register and login
            registration_data = {
                "email": test_email,
                "password": test_password,
                "company_name": "Test Company"
            }
            
            reg_response = self.session.post(
                f"{self.base_url}/api/v1/auth/register",
                json=registration_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if reg_response.status_code != 201:
                return self.log_test(
                    "Survey Endpoints",
                    False,
                    "Failed to register test user for survey test"
                )
            
            login_data = {
                "username": test_email,
                "password": test_password
            }
            
            login_response = self.session.post(
                f"{self.base_url}/api/v1/auth/login",
                data=login_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if login_response.status_code != 200:
                return self.log_test(
                    "Survey Endpoints",
                    False,
                    "Failed to login for survey test"
                )
            
            login_data = login_response.json()
            access_token = login_data.get('access_token')
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Test getting surveys
            response = self.session.get(
                f"{self.base_url}/api/v1/surveys",
                headers=headers
            )
            
            if response.status_code == 200:
                surveys = response.json()
                return self.log_test(
                    "Survey Endpoints",
                    True,
                    f"Survey endpoints accessible - Found {len(surveys)} surveys",
                    {"survey_count": len(surveys)}
                )
            else:
                error_data = response.json() if response.content else {}
                return self.log_test(
                    "Survey Endpoints",
                    False,
                    f"Survey endpoints failed with status {response.status_code}: {error_data.get('detail', 'Unknown error')}"
                )
        except Exception as e:
            return self.log_test(
                "Survey Endpoints",
                False,
                f"Survey endpoints test failed: {str(e)}"
            )
    
    def test_frontend_api_compatibility(self):
        """Test API compatibility with frontend expectations"""
        try:
            # Test that API returns expected structure
            response = self.session.get(f"{self.base_url}/api/v1/health")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for expected fields
                expected_fields = ['status', 'environment', 'version', 'services']
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields:
                    return self.log_test(
                        "Frontend API Compatibility",
                        True,
                        f"API structure compatible with frontend expectations",
                        {"available_fields": list(data.keys())}
                    )
                else:
                    return self.log_test(
                        "Frontend API Compatibility",
                        False,
                        f"Missing expected fields: {missing_fields}"
                    )
            else:
                return self.log_test(
                    "Frontend API Compatibility",
                    False,
                    f"API health check failed with status {response.status_code}"
                )
        except Exception as e:
            return self.log_test(
                "Frontend API Compatibility",
                False,
                f"Frontend API compatibility test failed: {str(e)}"
            )
    
    def run_all_tests(self):
        """Run all integration tests"""
        print("🚀 Starting Novora Integration Tests")
        print("=" * 50)
        
        tests = [
            self.test_backend_health,
            self.test_api_health,
            self.test_cors_preflight,
            self.test_user_registration,
            self.test_user_login,
            self.test_authenticated_endpoint,
            self.test_survey_endpoints,
            self.test_frontend_api_compatibility,
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_test(test.__name__, False, f"Test crashed: {str(e)}")
                failed += 1
        
        print("\n" + "=" * 50)
        print("📊 Integration Test Results")
        print("=" * 50)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed == 0:
            print("\n🎉 All integration tests passed!")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
            return False

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Run Novora integration tests")
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="Base URL for the backend API (default: http://localhost:8000)"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    
    args = parser.parse_args()
    
    # Create tester instance
    tester = IntegrationTester(args.base_url)
    
    # Run tests
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
