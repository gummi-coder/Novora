#!/usr/bin/env python3
"""
Simple integration test for Novora Survey Platform
"""
import requests
import json
import time

def test_backend_connection():
    """Test basic backend connection"""
    try:
        # Test if backend is running
        response = requests.get("http://localhost:8000/api/v1/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is running - Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def test_cors():
    """Test CORS configuration"""
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        
        response = requests.options(
            "http://localhost:8000/api/v1/auth/login",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            cors_headers = response.headers.get('Access-Control-Allow-Origin')
            print(f"✅ CORS is configured - Allow-Origin: {cors_headers}")
            return True
        else:
            print(f"❌ CORS preflight failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def test_user_registration():
    """Test user registration"""
    try:
        test_email = f"test_{int(time.time())}@example.com"
        test_password = "TestPassword123!"
        
        registration_data = {
            "email": test_email,
            "password": test_password,
            "company_name": "Test Company"
        }
        
        response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=registration_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"✅ User registration successful - User ID: {data.get('user_id', 'N/A')}")
            return True
        else:
            error_data = response.json() if response.content else {}
            print(f"❌ User registration failed - Status: {response.status_code}, Error: {error_data.get('detail', 'Unknown')}")
            return False
    except Exception as e:
        print(f"❌ User registration test failed: {e}")
        return False

def test_user_login():
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
        
        reg_response = requests.post(
            "http://localhost:8000/api/v1/auth/register",
            json=registration_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if reg_response.status_code not in [200, 201]:
            print("❌ Failed to register test user for login test")
            return False
        
        # Now test login
        login_data = {
            "username": test_email,
            "password": test_password
        }
        
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get('access_token')
            if access_token:
                print(f"✅ User login successful - Token received")
                return True
            else:
                print("❌ Login successful but no access token received")
                return False
        else:
            error_data = response.json() if response.content else {}
            print(f"❌ User login failed - Status: {response.status_code}, Error: {error_data.get('detail', 'Unknown')}")
            return False
    except Exception as e:
        print(f"❌ User login test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Simple Integration Test for Novora Survey Platform")
    print("=" * 60)
    
    tests = [
        ("Backend Connection", test_backend_connection),
        ("CORS Configuration", test_cors),
        ("User Registration", test_user_registration),
        ("User Login", test_user_login),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1
        else:
            failed += 1
    
    print("\n" + "=" * 60)
    print("📊 Test Results")
    print("=" * 60)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {(passed / (passed + failed) * 100):.1f}%")
    
    if failed == 0:
        print("\n🎉 All tests passed! Integration is working correctly.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
