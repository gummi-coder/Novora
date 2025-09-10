#!/usr/bin/env python3
"""
Test script for eNPS calculation
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.metrics import calculate_enps, get_enps_breakdown, get_enps_status

def test_enps_calculation():
    """Test the eNPS calculation with various scenarios"""
    
    print("Testing eNPS Calculation\n")
    
    # Test cases
    test_cases = [
        {
            "name": "High Promoters (Excellent)",
            "responses": [9, 10, 9, 10, 8, 9, 10, 9, 8, 9],
            "expected_score": 80  # 80% promoters, 20% passives, 0% detractors
        },
        {
            "name": "Mixed Responses (Good)",
            "responses": [7, 8, 9, 6, 7, 8, 9, 7, 8, 6],
            "expected_score": 20  # 30% promoters, 50% passives, 20% detractors
        },
        {
            "name": "Low Score (Needs Improvement)",
            "responses": [3, 4, 5, 6, 4, 3, 5, 4, 6, 5],
            "expected_score": -100  # 0% promoters, 0% passives, 100% detractors
        },
        {
            "name": "Empty Responses",
            "responses": [],
            "expected_score": 0
        },
        {
            "name": "Realistic Company Data",
            "responses": [9, 10, 8, 7, 9, 6, 8, 9, 10, 7, 8, 9, 6, 8, 9],
            "expected_score": 33  # 40% promoters, 47% passives, 13% detractors
        }
    ]
    
    for test_case in test_cases:
        print(f"Test: {test_case['name']}")
        print(f"Responses: {test_case['responses']}")
        
        # Calculate eNPS
        enps_score = calculate_enps(test_case['responses'])
        breakdown = get_enps_breakdown(test_case['responses'])
        status, color_class = get_enps_status(enps_score)
        
        print(f"Calculated eNPS: {enps_score}")
        print(f"Expected eNPS: {test_case['expected_score']}")
        print(f"Status: {status}")
        print(f"Breakdown: Promoters {breakdown['promoter_pct']}%, Passives {breakdown['passive_pct']}%, Detractors {breakdown['detractor_pct']}%")
        
        # Verify calculation
        if test_case['responses']:
            promoters = sum(1 for r in test_case['responses'] if r >= 9)
            detractors = sum(1 for r in test_case['responses'] if r <= 6)
            total = len(test_case['responses'])
            expected = round((promoters / total * 100) - (detractors / total * 100))
            
            if enps_score == expected:
                print("✅ PASS")
            else:
                print(f"❌ FAIL - Expected {expected}, got {enps_score}")
        else:
            if enps_score == 0:
                print("✅ PASS")
            else:
                print(f"❌ FAIL - Expected 0, got {enps_score}")
        
        print("-" * 50)

if __name__ == "__main__":
    test_enps_calculation()
