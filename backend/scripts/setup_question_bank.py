#!/usr/bin/env python3
"""
Complete setup script for question bank
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from migrate_question_bank import migrate_question_bank
from seed_question_bank import seed_question_bank

def setup_question_bank():
    """Complete setup for question bank"""
    try:
        print("🚀 Setting up Question Bank...")
        print("=" * 50)
        
        # Step 1: Create tables
        print("📋 Step 1: Creating database tables...")
        migrate_question_bank()
        
        # Step 2: Seed data
        print("\n🌱 Step 2: Seeding question bank data...")
        seed_question_bank()
        
        print("\n" + "=" * 50)
        print("✅ Question Bank setup completed successfully!")
        print("\n📊 What was created:")
        print("   • 11 Metrics (Job Satisfaction, eNPS, Manager Relationship, etc.)")
        print("   • 88 Questions across all metrics")
        print("   • Auto-pilot plan tables")
        print("   • API endpoints for question bank management")
        print("\n🔗 API Endpoints available:")
        print("   • GET /api/v1/question-bank/metrics")
        print("   • GET /api/v1/question-bank/questions")
        print("   • GET /api/v1/question-bank/questions/random")
        print("   • Admin endpoints for managing questions")
        
    except Exception as e:
        print(f"\n❌ Error during setup: {e}")
        raise

if __name__ == "__main__":
    setup_question_bank()
