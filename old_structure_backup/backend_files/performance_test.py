#!/usr/bin/env python3
"""
Performance Testing Script for Novora Survey Platform
Validates P95 page load < 300ms requirement
"""
import time
import requests
import statistics
import json
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse

class PerformanceTester:
    def __init__(self, base_url: str, auth_token: str):
        self.base_url = base_url.rstrip('/')
        self.auth_token = auth_token
        self.headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_endpoint_performance(
        self,
        endpoint: str,
        params: Dict[str, Any] = None,
        num_requests: int = 100,
        concurrent: int = 10
    ) -> Dict[str, Any]:
        """Test endpoint performance with concurrent requests"""
        
        print(f"Testing endpoint: {endpoint}")
        print(f"Parameters: {params}")
        print(f"Requests: {num_requests}, Concurrent: {concurrent}")
        
        # Warm up cache first
        print("Warming up cache...")
        for _ in range(5):
            try:
                response = requests.get(
                    f"{self.base_url}{endpoint}",
                    headers=self.headers,
                    params=params,
                    timeout=10
                )
                if response.status_code == 200:
                    break
            except Exception as e:
                print(f"Warning: Cache warmup failed: {e}")
        
        # Performance test
        load_times = []
        errors = 0
        
        def make_request():
            try:
                start_time = time.time()
                response = requests.get(
                    f"{self.base_url}{endpoint}",
                    headers=self.headers,
                    params=params,
                    timeout=10
                )
                end_time = time.time()
                
                load_time = (end_time - start_time) * 1000  # Convert to milliseconds
                
                if response.status_code == 200:
                    return {"success": True, "load_time": load_time, "status_code": response.status_code}
                else:
                    return {"success": False, "load_time": load_time, "status_code": response.status_code, "error": response.text}
                    
            except Exception as e:
                return {"success": False, "load_time": 0, "error": str(e)}
        
        # Run concurrent requests
        with ThreadPoolExecutor(max_workers=concurrent) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            
            for future in as_completed(futures):
                result = future.result()
                if result["success"]:
                    load_times.append(result["load_time"])
                else:
                    errors += 1
                    print(f"Request failed: {result.get('error', 'Unknown error')}")
        
        # Calculate statistics
        if load_times:
            load_times.sort()
            p50 = statistics.median(load_times)
            p95_index = int(0.95 * len(load_times))
            p95 = load_times[p95_index] if p95_index < len(load_times) else load_times[-1]
            p99_index = int(0.99 * len(load_times))
            p99 = load_times[p99_index] if p99_index < len(load_times) else load_times[-1]
            
            stats = {
                "endpoint": endpoint,
                "total_requests": num_requests,
                "successful_requests": len(load_times),
                "failed_requests": errors,
                "success_rate": len(load_times) / num_requests * 100,
                "min_time": min(load_times),
                "max_time": max(load_times),
                "avg_time": statistics.mean(load_times),
                "p50_time": p50,
                "p95_time": p95,
                "p99_time": p99,
                "p95_passed": p95 < 300,
                "all_times": load_times
            }
        else:
            stats = {
                "endpoint": endpoint,
                "total_requests": num_requests,
                "successful_requests": 0,
                "failed_requests": errors,
                "success_rate": 0,
                "error": "No successful requests"
            }
        
        return stats
    
    def test_all_endpoints(self, org_id: str, team_id: str) -> Dict[str, Any]:
        """Test performance of all critical endpoints"""
        
        endpoints = [
            # Admin endpoints
            {
                "endpoint": "/api/v1/admin/overview/kpis",
                "params": {"org_id": org_id},
                "name": "Admin Overview KPIs"
            },
            {
                "endpoint": "/api/v1/admin/overview/trend",
                "params": {"org_id": org_id, "months": 6},
                "name": "Admin Overview Trend"
            },
            {
                "endpoint": "/api/v1/admin/engagement/kpis",
                "params": {"org_id": org_id},
                "name": "Admin Engagement KPIs"
            },
            {
                "endpoint": "/api/v1/admin/engagement/by-team",
                "params": {"org_id": org_id},
                "name": "Admin Engagement by Team"
            },
            {
                "endpoint": "/api/v1/admin/trends/heatmap",
                "params": {"org_id": org_id},
                "name": "Admin Trends Heatmap"
            },
            {
                "endpoint": "/api/v1/admin/feedback/themes",
                "params": {"org_id": org_id},
                "name": "Admin Feedback Themes"
            },
            
            # Manager endpoints
            {
                "endpoint": "/api/v1/manager/overview/kpis",
                "params": {"team_id": team_id},
                "name": "Manager Overview KPIs"
            },
            {
                "endpoint": "/api/v1/manager/overview/trend",
                "params": {"team_id": team_id, "months": 6},
                "name": "Manager Overview Trend"
            },
            {
                "endpoint": "/api/v1/manager/trend/overall",
                "params": {"team_id": team_id},
                "name": "Manager Trend Overall"
            },
            {
                "endpoint": "/api/v1/manager/feedback/themes",
                "params": {"team_id": team_id},
                "name": "Manager Feedback Themes"
            },
            
            # Cache endpoints
            {
                "endpoint": "/api/v1/cache/stats",
                "params": {},
                "name": "Cache Statistics"
            }
        ]
        
        results = {}
        overall_stats = {
            "total_endpoints": len(endpoints),
            "passed_endpoints": 0,
            "failed_endpoints": 0,
            "overall_p95_passed": True
        }
        
        for endpoint_config in endpoints:
            print(f"\n{'='*60}")
            print(f"Testing: {endpoint_config['name']}")
            print(f"{'='*60}")
            
            result = self.test_endpoint_performance(
                endpoint_config["endpoint"],
                endpoint_config["params"]
            )
            
            results[endpoint_config["name"]] = result
            
            # Check if P95 passed
            if result.get("p95_passed", False):
                overall_stats["passed_endpoints"] += 1
                print(f"✅ PASSED: P95 = {result['p95_time']:.1f}ms")
            else:
                overall_stats["failed_endpoints"] += 1
                overall_stats["overall_p95_passed"] = False
                print(f"❌ FAILED: P95 = {result['p95_time']:.1f}ms (threshold: 300ms)")
            
            # Print detailed stats
            if "avg_time" in result:
                print(f"   Success Rate: {result['success_rate']:.1f}%")
                print(f"   Avg Time: {result['avg_time']:.1f}ms")
                print(f"   P50 Time: {result['p50_time']:.1f}ms")
                print(f"   P95 Time: {result['p95_time']:.1f}ms")
                print(f"   P99 Time: {result['p99_time']:.1f}ms")
        
        overall_stats["results"] = results
        return overall_stats
    
    def generate_report(self, stats: Dict[str, Any], output_file: str = None):
        """Generate performance test report"""
        
        report = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "base_url": self.base_url,
            "summary": {
                "total_endpoints": stats["total_endpoints"],
                "passed_endpoints": stats["passed_endpoints"],
                "failed_endpoints": stats["failed_endpoints"],
                "overall_p95_passed": stats["overall_p95_passed"],
                "pass_rate": stats["passed_endpoints"] / stats["total_endpoints"] * 100
            },
            "detailed_results": stats["results"]
        }
        
        # Print summary
        print(f"\n{'='*80}")
        print("PERFORMANCE TEST SUMMARY")
        print(f"{'='*80}")
        print(f"Timestamp: {report['timestamp']}")
        print(f"Base URL: {report['base_url']}")
        print(f"Total Endpoints: {stats['total_endpoints']}")
        print(f"Passed: {stats['passed_endpoints']}")
        print(f"Failed: {stats['failed_endpoints']}")
        print(f"Pass Rate: {report['summary']['pass_rate']:.1f}%")
        print(f"Overall P95 Passed: {'✅ YES' if stats['overall_p95_passed'] else '❌ NO'}")
        
        # Print failed endpoints
        if stats["failed_endpoints"] > 0:
            print(f"\nFailed Endpoints:")
            for name, result in stats["results"].items():
                if not result.get("p95_passed", True):
                    print(f"  ❌ {name}: P95 = {result['p95_time']:.1f}ms")
        
        # Save report
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"\nDetailed report saved to: {output_file}")
        
        return report

def main():
    parser = argparse.ArgumentParser(description="Performance Testing for Novora Survey Platform")
    parser.add_argument("--base-url", default="http://localhost:8000", help="Base URL of the API")
    parser.add_argument("--auth-token", required=True, help="Authentication token")
    parser.add_argument("--org-id", required=True, help="Organization ID for testing")
    parser.add_argument("--team-id", required=True, help="Team ID for testing")
    parser.add_argument("--output", help="Output file for detailed report")
    parser.add_argument("--requests", type=int, default=100, help="Number of requests per endpoint")
    parser.add_argument("--concurrent", type=int, default=10, help="Number of concurrent requests")
    
    args = parser.parse_args()
    
    # Create tester
    tester = PerformanceTester(args.base_url, args.auth_token)
    
    # Run tests
    print("Starting Performance Tests...")
    print(f"Base URL: {args.base_url}")
    print(f"Organization ID: {args.org_id}")
    print(f"Team ID: {args.team_id}")
    print(f"Requests per endpoint: {args.requests}")
    print(f"Concurrent requests: {args.concurrent}")
    
    stats = tester.test_all_endpoints(args.org_id, args.team_id)
    
    # Generate report
    report = tester.generate_report(stats, args.output)
    
    # Exit with appropriate code
    if stats["overall_p95_passed"]:
        print("\n🎉 All performance tests PASSED!")
        exit(0)
    else:
        print("\n💥 Some performance tests FAILED!")
        exit(1)

if __name__ == "__main__":
    main()
