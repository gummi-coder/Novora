#!/usr/bin/env python3
"""
QA Test Runner Script
Executes the complete QA checklist and acceptance criteria validation
"""
import subprocess
import sys
import os
import time
import json
from datetime import datetime
from typing import Dict, Any, List

class QATestRunner:
    def __init__(self):
        self.results = {}
        self.start_time = datetime.now()
    
    def run_command(self, command: str, description: str) -> Dict[str, Any]:
        """Run a command and capture results"""
        print(f"\n{'='*60}")
        print(f"Running: {description}")
        print(f"Command: {command}")
        print(f"{'='*60}")
        
        start_time = time.time()
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            end_time = time.time()
            duration = end_time - start_time
            
            success = result.returncode == 0
            
            return {
                "description": description,
                "command": command,
                "success": success,
                "return_code": result.returncode,
                "duration": round(duration, 2),
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
        except subprocess.TimeoutExpired:
            return {
                "description": description,
                "command": command,
                "success": False,
                "return_code": -1,
                "duration": 300,
                "stdout": "",
                "stderr": "Command timed out after 5 minutes"
            }
        except Exception as e:
            return {
                "description": description,
                "command": command,
                "success": False,
                "return_code": -1,
                "duration": 0,
                "stdout": "",
                "stderr": str(e)
            }
    
    def run_database_migrations(self) -> Dict[str, Any]:
        """Run database migrations"""
        return self.run_command(
            "cd backend && alembic upgrade head",
            "Database Migrations"
        )
    
    def run_unit_tests(self) -> Dict[str, Any]:
        """Run unit tests"""
        return self.run_command(
            "cd backend && python -m pytest tests/ -v --tb=short",
            "Unit Tests"
        )
    
    def run_qa_checklist_tests(self) -> Dict[str, Any]:
        """Run QA checklist tests"""
        return self.run_command(
            "cd backend && python -m pytest tests/test_qa_checklist.py -v",
            "QA Checklist Tests"
        )
    
    def run_performance_tests(self, auth_token: str, org_id: str, team_id: str) -> Dict[str, Any]:
        """Run performance tests"""
        return self.run_command(
            f"cd backend && python scripts/performance_test.py --auth-token {auth_token} --org-id {org_id} --team-id {team_id} --output performance_report.json",
            "Performance Tests"
        )
    
    def check_health_endpoints(self, base_url: str = "http://localhost:8000") -> Dict[str, Any]:
        """Check health endpoints"""
        import requests
        
        health_checks = {}
        
        endpoints = [
            ("/health", "Health Check"),
            ("/ready", "Readiness Check"),
            ("/metrics", "System Metrics"),
            ("/cache/stats", "Cache Statistics"),
            ("/performance/check", "Performance Check")
        ]
        
        for endpoint, name in endpoints:
            try:
                start_time = time.time()
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
                end_time = time.time()
                
                health_checks[name] = {
                    "success": response.status_code == 200,
                    "status_code": response.status_code,
                    "response_time": round((end_time - start_time) * 1000, 2),
                    "response": response.json() if response.status_code == 200 else response.text
                }
                
            except Exception as e:
                health_checks[name] = {
                    "success": False,
                    "error": str(e),
                    "response_time": 0
                }
        
        return {
            "description": "Health Endpoints Check",
            "command": f"Health checks against {base_url}",
            "success": all(check["success"] for check in health_checks.values()),
            "checks": health_checks
        }
    
    def run_all_tests(self, auth_token: str = None, org_id: str = None, team_id: str = None) -> Dict[str, Any]:
        """Run all QA tests"""
        
        print("🚀 Starting QA Test Suite")
        print(f"Start Time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 1. Database migrations
        self.results["migrations"] = self.run_database_migrations()
        
        # 2. Unit tests
        self.results["unit_tests"] = self.run_unit_tests()
        
        # 3. QA checklist tests
        self.results["qa_checklist"] = self.run_qa_checklist_tests()
        
        # 4. Health endpoints check
        self.results["health_checks"] = self.check_health_endpoints()
        
        # 5. Performance tests (if credentials provided)
        if auth_token and org_id and team_id:
            self.results["performance_tests"] = self.run_performance_tests(auth_token, org_id, team_id)
        
        # Calculate overall results
        self.end_time = datetime.now()
        self.duration = (self.end_time - self.start_time).total_seconds()
        
        # Determine overall success
        all_passed = all(
            result["success"] 
            for result in self.results.values() 
            if isinstance(result, dict) and "success" in result
        )
        
        overall_results = {
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "duration_seconds": round(self.duration, 2),
            "overall_success": all_passed,
            "results": self.results
        }
        
        return overall_results
    
    def generate_report(self, results: Dict[str, Any], output_file: str = "qa_test_report.json"):
        """Generate QA test report"""
        
        print(f"\n{'='*80}")
        print("QA TEST SUITE RESULTS")
        print(f"{'='*80}")
        print(f"Start Time: {results['start_time']}")
        print(f"End Time: {results['end_time']}")
        print(f"Duration: {results['duration_seconds']} seconds")
        print(f"Overall Success: {'✅ PASSED' if results['overall_success'] else '❌ FAILED'}")
        
        print(f"\nDetailed Results:")
        for test_name, result in results["results"].items():
            if isinstance(result, dict) and "success" in result:
                status = "✅ PASS" if result["success"] else "❌ FAIL"
                duration = f" ({result.get('duration', 0)}s)" if "duration" in result else ""
                print(f"  {status} {test_name}{duration}")
                
                if not result["success"] and "stderr" in result and result["stderr"]:
                    print(f"    Error: {result['stderr'][:200]}...")
        
        # Save detailed report
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\nDetailed report saved to: {output_file}")
        
        return results

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="QA Test Runner for Novora Survey Platform")
    parser.add_argument("--auth-token", help="Authentication token for performance tests")
    parser.add_argument("--org-id", help="Organization ID for performance tests")
    parser.add_argument("--team-id", help="Team ID for performance tests")
    parser.add_argument("--output", default="qa_test_report.json", help="Output file for test report")
    parser.add_argument("--skip-performance", action="store_true", help="Skip performance tests")
    
    args = parser.parse_args()
    
    # Create test runner
    runner = QATestRunner()
    
    # Run tests
    if args.skip_performance:
        results = runner.run_all_tests()
    else:
        results = runner.run_all_tests(
            auth_token=args.auth_token,
            org_id=args.org_id,
            team_id=args.team_id
        )
    
    # Generate report
    runner.generate_report(results, args.output)
    
    # Exit with appropriate code
    if results["overall_success"]:
        print("\n🎉 All QA tests PASSED!")
        sys.exit(0)
    else:
        print("\n💥 Some QA tests FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
