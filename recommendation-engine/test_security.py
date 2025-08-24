#!/usr/bin/env python3
"""
Basic security and functionality tests for the recommendation engine
Run with: python test_security.py
"""

import asyncio
import httpx
import os
from datetime import datetime

# Test configuration
BASE_URL = os.getenv("TEST_API_URL", "http://localhost:8000")
TIMEOUT = 10

class SecurityTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=TIMEOUT)
    
    async def test_health_endpoint(self):
        """Test health endpoint (no auth required)"""
        print("🏥 Testing health endpoint...")
        try:
            response = await self.client.get(f"{self.base_url}/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            print("✅ Health check passed")
            return True
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            return False
    
    async def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints reject requests without auth"""
        print("🔒 Testing protected endpoint without auth...")
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/recommendations",
                json={
                    "user_id": "test-user",
                    "recommendation_type": "friends",
                    "limit": 10
                }
            )
            assert response.status_code == 401 or response.status_code == 422
            print("✅ Protected endpoint correctly rejects unauthorized requests")
            return True
        except Exception as e:
            print(f"❌ Auth test failed: {e}")
            return False
    
    async def test_cors_headers(self):
        """Test CORS headers are present"""
        print("🌐 Testing CORS headers...")
        try:
            response = await self.client.options(
                f"{self.base_url}/api/v1/recommendations",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "POST"
                }
            )
            
            # Check for CORS headers
            cors_headers = [
                "access-control-allow-origin",
                "access-control-allow-methods"
            ]
            
            present_headers = [h for h in cors_headers if h in response.headers]
            
            if len(present_headers) >= 1:
                print("✅ CORS headers present")
                return True
            else:
                print("⚠️ Some CORS headers missing")
                return False
        except Exception as e:
            print(f"❌ CORS test failed: {e}")
            return False
    
    async def test_security_headers(self):
        """Test security headers are present"""
        print("🛡️ Testing security headers...")
        try:
            response = await self.client.get(f"{self.base_url}/health")
            
            security_headers = [
                "x-frame-options",
                "x-content-type-options", 
                "referrer-policy",
                "x-xss-protection"
            ]
            
            present_headers = []
            for header in security_headers:
                if header in response.headers:
                    present_headers.append(header)
                    print(f"  ✓ {header}: {response.headers[header]}")
            
            if len(present_headers) >= 3:
                print("✅ Security headers present")
                return True
            else:
                print(f"⚠️ Only {len(present_headers)}/4 security headers present")
                return False
        except Exception as e:
            print(f"❌ Security headers test failed: {e}")
            return False
    
    async def test_rate_limiting(self):
        """Test basic rate limiting (if enabled)"""
        print("⏱️ Testing rate limiting...")
        try:
            # Make several rapid requests
            responses = []
            for i in range(10):
                try:
                    response = await self.client.get(f"{self.base_url}/health")
                    responses.append(response.status_code)
                except:
                    responses.append(429)  # Assume rate limited
            
            # Check if we got any rate limit responses
            rate_limited = any(status == 429 for status in responses)
            
            if rate_limited:
                print("✅ Rate limiting is active")
                return True
            else:
                print("ℹ️ No rate limiting detected (may not be configured)")
                return True  # Not necessarily a failure
        except Exception as e:
            print(f"❌ Rate limiting test failed: {e}")
            return False
    
    async def test_invalid_json(self):
        """Test that invalid JSON is handled properly"""
        print("📝 Testing invalid JSON handling...")
        try:
            response = await self.client.post(
                f"{self.base_url}/api/v1/recommendations",
                content="invalid json",
                headers={"Content-Type": "application/json"}
            )
            
            # Should return 4xx error, not 5xx
            assert 400 <= response.status_code < 500
            print("✅ Invalid JSON handled properly")
            return True
        except Exception as e:
            print(f"❌ Invalid JSON test failed: {e}")
            return False
    
    async def run_all_tests(self):
        """Run all security tests"""
        print(f"🔍 Starting security tests for {self.base_url}")
        print(f"⏰ Timestamp: {datetime.now().isoformat()}")
        print("-" * 50)
        
        tests = [
            self.test_health_endpoint,
            self.test_protected_endpoint_without_auth,
            self.test_cors_headers,
            self.test_security_headers,
            self.test_rate_limiting,
            self.test_invalid_json
        ]
        
        results = []
        for test in tests:
            try:
                result = await test()
                results.append(result)
            except Exception as e:
                print(f"❌ Test {test.__name__} crashed: {e}")
                results.append(False)
            print()
        
        # Summary
        passed = sum(results)
        total = len(results)
        print("-" * 50)
        print(f"📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All security tests passed!")
        elif passed >= total * 0.8:
            print("⚠️ Most tests passed, review warnings")
        else:
            print("❌ Multiple test failures, review security setup")
        
        await self.client.aclose()
        return passed == total

async def main():
    """Main test runner"""
    tester = SecurityTester(BASE_URL)
    success = await tester.run_all_tests()
    
    if not success:
        exit(1)

if __name__ == "__main__":
    print("🛡️ BITSPARK Recommendation Engine Security Test")
    print("=" * 60)
    asyncio.run(main())
