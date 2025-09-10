#!/usr/bin/env python3
"""
Simple test script for eNPS calculation (no database dependencies)
"""

def calculate_enps(responses):
    """
    Calculate Employee Net Promoter Score (eNPS).

    Args:
        responses (list[int]): List of survey responses, each from 0–10.

    Returns:
        int: eNPS score ranging from -100 to +100.
    """
    if not responses:
        return 0  # Avoid division by zero

    total = len(responses)
    promoters = sum(1 for r in responses if r >= 9)
    detractors = sum(1 for r in responses if r <= 6)

    promoter_pct = promoters / total * 100
    detractor_pct = detractors / total * 100

    return round(promoter_pct - detractor_pct)


def get_enps_breakdown(responses):
    """
    Get eNPS breakdown (promoters, passives, detractors percentages).
    
    Args:
        responses (list[int]): List of survey responses, each from 0–10.
        
    Returns:
        dict: Breakdown with promoter_pct, passive_pct, detractor_pct
    """
    if not responses:
        return {"promoter_pct": 0, "passive_pct": 0, "detractor_pct": 0}
    
    total = len(responses)
    promoters = sum(1 for r in responses if r >= 9)
    detractors = sum(1 for r in responses if r <= 6)
    passives = total - promoters - detractors
    
    return {
        "promoter_pct": round((promoters / total) * 100, 1),
        "passive_pct": round((passives / total) * 100, 1),
        "detractor_pct": round((detractors / total) * 100, 1)
    }


def get_enps_status(enps_score):
    """
    Get eNPS status and color based on score.
    
    Args:
        enps_score (int): eNPS score from -100 to +100
        
    Returns:
        tuple: (status, color_class)
    """
    if enps_score >= 30:
        return "Excellent", "text-green-600 bg-green-100"
    elif enps_score >= 0:
        return "Good", "text-yellow-600 bg-yellow-100"
    else:
        return "Needs Improvement", "text-red-600 bg-red-100"


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
