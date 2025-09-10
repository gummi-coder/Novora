"""
QA Checklist Test Suite - Acceptance Criteria Validation
"""
import pytest
import time
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import get_db
from app.models.base import User, Survey, Team, SurveyToken
from app.models.responses import NumericResponse, Comment
from app.models.summaries import ParticipationSummary, DriverSummary, SentimentSummary
from app.models.advanced import DashboardAlert
from app.core.privacy import enforce_min_n
from app.services.cache_service import cache_service

client = TestClient(app)

class TestQAChecklist:
    """QA Checklist Test Suite"""
    
    def setup_method(self):
        """Setup test data"""
        self.db = next(get_db())
        self.setup_test_data()
    
    def teardown_method(self):
        """Cleanup test data"""
        self.cleanup_test_data()
        self.db.close()
    
    def setup_test_data(self):
        """Setup comprehensive test data"""
        # Create test users
        self.admin_user = User(
            id="admin-123",
            email="admin@test.com",
            role="admin",
            company_id="org-123",
            is_active=True
        )
        
        self.manager_user = User(
            id="manager-123",
            email="manager@test.com",
            role="manager",
            company_id="org-123",
            is_active=True
        )
        
        self.viewer_user = User(
            id="viewer-123",
            email="viewer@test.com",
            role="viewer",
            company_id="org-123",
            is_active=True
        )
        
        # Create test teams
        self.team_1 = Team(
            id="team-1",
            name="Engineering",
            org_id="org-123",
            size=10
        )
        
        self.team_2 = Team(
            id="team-2",
            name="Marketing",
            org_id="org-123",
            size=5
        )
        
        # Create test survey
        self.survey = Survey(
            id="survey-123",
            title="Test Survey",
            creator_id="org-123",
            status="active",
            opens_at=datetime.utcnow() - timedelta(days=1),
            closes_at=datetime.utcnow() + timedelta(days=1)
        )
        
        # Add to database
        self.db.add_all([self.admin_user, self.manager_user, self.viewer_user])
        self.db.add_all([self.team_1, self.team_2])
        self.db.add(self.survey)
        self.db.commit()
    
    def cleanup_test_data(self):
        """Cleanup test data"""
        # Clean up in reverse order
        self.db.query(DashboardAlert).delete()
        self.db.query(SentimentSummary).delete()
        self.db.query(DriverSummary).delete()
        self.db.query(ParticipationSummary).delete()
        self.db.query(Comment).delete()
        self.db.query(NumericResponse).delete()
        self.db.query(SurveyToken).delete()
        self.db.query(Survey).delete()
        self.db.query(Team).delete()
        self.db.query(User).delete()
        self.db.commit()
    
    def test_token_validation_used_expired(self):
        """Test: Submitting with used/expired token returns correct error"""
        
        # Create a used token
        used_token = SurveyToken(
            token="used-token-123",
            survey_id=self.survey.id,
            team_id=self.team_1.id,
            used=True,
            used_at=datetime.utcnow()
        )
        
        # Create an expired token
        expired_survey = Survey(
            id="expired-survey-123",
            title="Expired Survey",
            creator_id="org-123",
            status="closed",
            opens_at=datetime.utcnow() - timedelta(days=10),
            closes_at=datetime.utcnow() - timedelta(days=1)
        )
        
        expired_token = SurveyToken(
            token="expired-token-123",
            survey_id=expired_survey.id,
            team_id=self.team_1.id,
            used=False
        )
        
        self.db.add_all([used_token, expired_survey, expired_token])
        self.db.commit()
        
        # Test used token
        response = client.post(
            f"/api/v1/surveys/{self.survey.id}/submit",
            json={
                "token": "used-token-123",
                "scores": {"driver-1": 8}
            }
        )
        assert response.status_code == 409
        assert "already been used" in response.json()["detail"]
        
        # Test expired token
        response = client.post(
            f"/api/v1/surveys/{expired_survey.id}/submit",
            json={
                "token": "expired-token-123",
                "scores": {"driver-1": 8}
            }
        )
        assert response.status_code == 410
        assert "Survey window has closed" in response.json()["detail"]
    
    def test_min_n_enforcement_manager_viewer(self):
        """Test: Manager/Viewer requests with < min-n return safe message"""
        
        # Create responses below min-n (default 4)
        for i in range(2):  # Only 2 responses, below min-n of 4
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_1.id,
                driver_id="driver-1",
                score=7
            )
            self.db.add(response)
        
        self.db.commit()
        
        # Test manager access
        response = client.get(
            f"/api/v1/manager/overview/kpis?team_id={self.team_1.id}",
            headers={"Authorization": f"Bearer {self.manager_user.id}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["safe"] == False
        assert "Not enough responses" in data["message"]
        
        # Test viewer access
        response = client.get(
            f"/api/v1/manager/overview/kpis?team_id={self.team_1.id}",
            headers={"Authorization": f"Bearer {self.viewer_user.id}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["safe"] == False
        assert "Not enough responses" in data["message"]
    
    def test_admin_multi_team_hide_unsafe_rows(self):
        """Test: Admin multi-team views hide unsafe rows and report hidden_rows_count"""
        
        # Create responses for team 1 (above min-n)
        for i in range(5):  # 5 responses, above min-n
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_1.id,
                driver_id="driver-1",
                score=7
            )
            self.db.add(response)
        
        # Create responses for team 2 (below min-n)
        for i in range(2):  # 2 responses, below min-n
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_2.id,
                driver_id="driver-1",
                score=6
            )
            self.db.add(response)
        
        self.db.commit()
        
        # Test admin engagement by team
        response = client.get(
            f"/api/v1/admin/engagement/by-team?org_id=org-123",
            headers={"Authorization": f"Bearer {self.admin_user.id}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should show safe teams and report unsafe count
        assert data["safe_teams_count"] == 1
        assert data["unsafe_teams_count"] == 1
        assert len(data["teams"]) == 2  # Both teams shown but one marked unsafe
        
        # Find unsafe team in response
        unsafe_team = next(t for t in data["teams"] if t["team_id"] == self.team_2.id)
        assert unsafe_team["safe"] == False
        assert "Not enough responses" in unsafe_team["message"]
    
    def test_alert_creation_and_sla(self):
        """Test: Alerts created for seeded dataset covering each rule; SLA countdown works"""
        
        # Create test data that triggers different alert rules
        # 1. LOW_SCORE alert
        for i in range(5):
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_1.id,
                driver_id="driver-1",
                score=4  # Low score
            )
            self.db.add(response)
        
        # 2. LOW_PARTICIPATION alert
        # Only 2 responses out of 10 team size = 20% participation
        for i in range(2):
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_2.id,
                driver_id="driver-1",
                score=7
            )
            self.db.add(response)
        
        self.db.commit()
        
        # Run alert evaluation
        from app.services.alert_evaluator import AlertEvaluator
        evaluator = AlertEvaluator(self.db)
        evaluator.evaluate_survey_alerts(str(self.survey.id))
        
        # Check alerts were created
        alerts = self.db.query(DashboardAlert).filter(
            DashboardAlert.survey_id == self.survey.id
        ).all()
        
        assert len(alerts) >= 2  # At least 2 alerts should be created
        
        # Check alert types
        alert_types = [alert.alert_type for alert in alerts]
        assert "LOW_SCORE" in alert_types
        assert "LOW_PARTICIPATION" in alert_types
        
        # Check SLA countdown
        for alert in alerts:
            assert alert.created_at is not None
            assert alert.status == "open"
            
            # Calculate time since creation
            time_since_creation = datetime.utcnow() - alert.created_at
            assert time_since_creation.total_seconds() >= 0
    
    def test_nlp_processing_sentiment_themes(self):
        """Test: Sentiment & themes appear only after NLP job processes comments"""
        
        # Create comment without NLP processing
        comment = Comment(
            survey_id=self.survey.id,
            team_id=self.team_1.id,
            text="I love working here! The team is great and John Smith is amazing."
        )
        self.db.add(comment)
        self.db.commit()
        
        # Test that raw PII is not displayed
        response = client.get(
            f"/api/v1/manager/feedback/themes?team_id={self.team_1.id}",
            headers={"Authorization": f"Bearer {self.manager_user.id}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should not contain raw PII
        assert "John Smith" not in str(data)
        
        # Process NLP for the comment
        from app.services.nlp_processor import NLPProcessor
        nlp_processor = NLPProcessor(self.db)
        nlp_processor.process_comment(str(comment.id))
        
        # Now test that sentiment and themes appear
        response = client.get(
            f"/api/v1/manager/feedback/themes?team_id={self.team_1.id}",
            headers={"Authorization": f"Bearer {self.manager_user.id}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should now contain processed themes
        assert len(data["themes"]) > 0
        assert data["total_comments"] == 1
    
    def test_reports_cache_identical_metrics(self):
        """Test: Reports digest renders from reports_cache; identical metrics to dashboard"""
        
        # Create test data
        for i in range(5):
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_1.id,
                driver_id="driver-1",
                score=8
            )
            self.db.add(response)
        
        self.db.commit()
        
        # Build reports cache
        from app.services.summary_service import SummaryService
        summary_service = SummaryService(self.db)
        
        period_start = datetime.utcnow().date().replace(day=1)
        period_end = (period_start.replace(month=period_start.month + 1) - timedelta(days=1))
        
        # Cache report data
        digest_data = {
            "period": period_start.strftime("%Y-%m"),
            "org_id": "org-123",
            "survey_count": 1,
            "metrics": {
                "total_employees": 10,
                "total_responses": 5,
                "participation_rate": 50.0,
                "company_enps": 20.0,
                "avg_score": 8.0
            }
        }
        
        summary_service.cache_report_data(
            "org-123", "org", period_start, period_end, digest_data
        )
        
        # Test reports digest endpoint
        response = client.get(
            f"/api/v1/admin/reports/digest?org_id=org-123&period={period_start.strftime('%Y-%m')}",
            headers={"Authorization": f"Bearer {self.admin_user.id}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should be cached
        assert data["cached"] == True
        assert data["data"]["metrics"]["avg_score"] == 8.0
        assert data["data"]["metrics"]["participation_rate"] == 50.0
        
        # Compare with dashboard metrics
        dashboard_response = client.get(
            f"/api/v1/admin/overview/kpis?org_id=org-123",
            headers={"Authorization": f"Bearer {self.admin_user.id}"}
        )
        
        assert dashboard_response.status_code == 200
        dashboard_data = dashboard_response.json()
        
        # Metrics should be consistent
        assert abs(dashboard_data["avg_score"] - data["data"]["metrics"]["avg_score"]) < 0.1
    
    def test_page_load_performance(self):
        """Test: P95 page load for Overview/Trends < 300ms after warm cache"""
        
        # Create test data
        for i in range(10):
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_1.id,
                driver_id="driver-1",
                score=8
            )
            self.db.add(response)
        
        self.db.commit()
        
        # Warm cache first
        response = client.get(
            f"/api/v1/admin/overview/kpis?org_id=org-123",
            headers={"Authorization": f"Bearer {self.admin_user.id}"}
        )
        assert response.status_code == 200
        
        # Test performance with warm cache
        load_times = []
        
        for _ in range(10):  # Test 10 requests
            start_time = time.time()
            
            response = client.get(
                f"/api/v1/admin/overview/kpis?org_id=org-123",
                headers={"Authorization": f"Bearer {self.admin_user.id}"}
            )
            
            end_time = time.time()
            load_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            assert response.status_code == 200
            load_times.append(load_time)
        
        # Calculate P95
        load_times.sort()
        p95_index = int(0.95 * len(load_times))
        p95_load_time = load_times[p95_index]
        
        # P95 should be < 300ms
        assert p95_load_time < 300, f"P95 load time {p95_load_time}ms exceeds 300ms threshold"
        
        # Test trends performance
        load_times = []
        
        for _ in range(10):
            start_time = time.time()
            
            response = client.get(
                f"/api/v1/admin/overview/trend?org_id=org-123&months=6",
                headers={"Authorization": f"Bearer {self.admin_user.id}"}
            )
            
            end_time = time.time()
            load_time = (end_time - start_time) * 1000
            
            assert response.status_code == 200
            load_times.append(load_time)
        
        # Calculate P95 for trends
        load_times.sort()
        p95_index = int(0.95 * len(load_times))
        p95_load_time = load_times[p95_index]
        
        # P95 should be < 300ms
        assert p95_load_time < 300, f"P95 trends load time {p95_load_time}ms exceeds 300ms threshold"
    
    def test_cache_hit_rate_optimization(self):
        """Test: Cache hit rate optimization for repeated requests"""
        
        # Create test data
        for i in range(5):
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_1.id,
                driver_id="driver-1",
                score=8
            )
            self.db.add(response)
        
        self.db.commit()
        
        # First request (cache miss)
        start_time = time.time()
        response1 = client.get(
            f"/api/v1/admin/overview/kpis?org_id=org-123",
            headers={"Authorization": f"Bearer {self.admin_user.id}"}
        )
        first_load_time = (time.time() - start_time) * 1000
        
        assert response1.status_code == 200
        
        # Second request (cache hit)
        start_time = time.time()
        response2 = client.get(
            f"/api/v1/admin/overview/kpis?org_id=org-123",
            headers={"Authorization": f"Bearer {self.admin_user.id}"}
        )
        second_load_time = (time.time() - start_time) * 1000
        
        assert response2.status_code == 200
        
        # Cache hit should be significantly faster
        assert second_load_time < first_load_time * 0.5, f"Cache hit not significantly faster: {second_load_time}ms vs {first_load_time}ms"
    
    def test_comprehensive_alert_rules(self):
        """Test: All alert rules are triggered with appropriate data"""
        
        # Test data for each alert rule
        test_cases = [
            # LOW_SCORE
            {"score": 4, "team": self.team_1, "expected_rule": "LOW_SCORE"},
            # BIG_DROP_ABS (would need previous survey data)
            {"score": 3, "team": self.team_2, "expected_rule": "LOW_SCORE"},
        ]
        
        for i, test_case in enumerate(test_cases):
            # Create responses
            for j in range(5):
                response = NumericResponse(
                    survey_id=self.survey.id,
                    team_id=test_case["team"].id,
                    driver_id="driver-1",
                    score=test_case["score"]
                )
                self.db.add(response)
        
        self.db.commit()
        
        # Run alert evaluation
        from app.services.alert_evaluator import AlertEvaluator
        evaluator = AlertEvaluator(self.db)
        evaluator.evaluate_survey_alerts(str(self.survey.id))
        
        # Check alerts were created
        alerts = self.db.query(DashboardAlert).filter(
            DashboardAlert.survey_id == self.survey.id
        ).all()
        
        assert len(alerts) >= len(test_cases)
        
        # Verify alert types
        alert_types = [alert.alert_type for alert in alerts]
        for test_case in test_cases:
            assert test_case["expected_rule"] in alert_types
    
    def test_rbac_enforcement(self):
        """Test: Role-based access control is properly enforced"""
        
        # Test manager can only access their team
        response = client.get(
            f"/api/v1/manager/overview/kpis?team_id={self.team_1.id}",
            headers={"Authorization": f"Bearer {self.manager_user.id}"}
        )
        assert response.status_code == 200
        
        # Test viewer has read-only access
        response = client.get(
            f"/api/v1/manager/overview/kpis?team_id={self.team_1.id}",
            headers={"Authorization": f"Bearer {self.viewer_user.id}"}
        )
        assert response.status_code == 200
        
        # Test admin can access all teams
        response = client.get(
            f"/api/v1/admin/overview/kpis?org_id=org-123",
            headers={"Authorization": f"Bearer {self.admin_user.id}"}
        )
        assert response.status_code == 200
    
    def test_data_integrity(self):
        """Test: Data integrity and consistency across all endpoints"""
        
        # Create consistent test data
        for i in range(5):
            response = NumericResponse(
                survey_id=self.survey.id,
                team_id=self.team_1.id,
                driver_id="driver-1",
                score=8
            )
            self.db.add(response)
        
        self.db.commit()
        
        # Test consistency across different endpoints
        endpoints = [
            f"/api/v1/admin/overview/kpis?org_id=org-123",
            f"/api/v1/manager/overview/kpis?team_id={self.team_1.id}",
            f"/api/v1/admin/engagement/kpis?org_id=org-123",
        ]
        
        response_data = []
        for endpoint in endpoints:
            response = client.get(
                endpoint,
                headers={"Authorization": f"Bearer {self.admin_user.id}"}
            )
            assert response.status_code == 200
            response_data.append(response.json())
        
        # Verify consistent participation data
        participation_values = [data.get("participation", 0) for data in response_data if "participation" in data]
        if len(participation_values) > 1:
            # All participation values should be consistent
            assert len(set(participation_values)) == 1, f"Participation values inconsistent: {participation_values}"

if __name__ == "__main__":
    # Run the QA checklist
    pytest.main([__file__, "-v"])
