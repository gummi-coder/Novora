"""
Advanced Analytics Service with Machine Learning and AI Insights
Provides predictive analytics, trend forecasting, and intelligent insights
"""
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
import json
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

from app.models.summaries import DriverSummary, ParticipationSummary, SentimentSummary
from app.models.responses import NumericResponse, Comment
from app.models.base import Survey, Team
from app.models.advanced import DashboardAlert
from app.core.edge_case_handler import handle_db_errors, handle_validation

logger = logging.getLogger(__name__)

class AdvancedAnalyticsService:
    """Advanced analytics service with ML capabilities"""
    
    def __init__(self, db: Session):
        self.db = db
        self.models_dir = "ml_models"
        self._ensure_models_directory()
    
    def _ensure_models_directory(self):
        """Ensure ML models directory exists"""
        if not os.path.exists(self.models_dir):
            os.makedirs(self.models_dir)
    
    @handle_db_errors
    @handle_validation
    async def predict_engagement_trends(
        self,
        org_id: str,
        team_id: Optional[str] = None,
        driver_id: Optional[str] = None,
        forecast_months: int = 3
    ) -> Dict[str, Any]:
        """Predict engagement trends using machine learning"""
        try:
            # Get historical data
            historical_data = await self._get_historical_data(org_id, team_id, driver_id)
            
            if len(historical_data) < 6:
                return {
                    "error": "Insufficient historical data for prediction",
                    "min_required": 6,
                    "available": len(historical_data)
                }
            
            # Prepare features for ML
            features, targets = self._prepare_ml_features(historical_data)
            
            # Train model
            model = await self._train_prediction_model(features, targets)
            
            # Make predictions
            future_features = self._generate_future_features(historical_data, forecast_months)
            predictions = model.predict(future_features)
            
            # Calculate confidence intervals
            confidence_intervals = self._calculate_confidence_intervals(predictions, model, features, targets)
            
            # Generate insights
            insights = await self._generate_prediction_insights(historical_data, predictions)
            
            return {
                "predictions": [
                    {
                        "month": (datetime.now() + timedelta(days=30*i)).strftime("%Y-%m"),
                        "predicted_score": round(float(pred), 2),
                        "confidence_lower": round(float(ci[0]), 2),
                        "confidence_upper": round(float(ci[1]), 2)
                    }
                    for i, (pred, ci) in enumerate(zip(predictions, confidence_intervals))
                ],
                "model_accuracy": round(float(model.score(features, targets)), 3),
                "insights": insights,
                "trend_direction": "increasing" if predictions[-1] > predictions[0] else "decreasing",
                "confidence_level": "high" if len(historical_data) >= 12 else "medium"
            }
            
        except Exception as e:
            logger.error(f"Error in engagement trend prediction: {str(e)}")
            raise
    
    @handle_db_errors
    @handle_validation
    async def generate_ai_insights(
        self,
        org_id: str,
        survey_id: Optional[str] = None,
        analysis_depth: str = "comprehensive"
    ) -> Dict[str, Any]:
        """Generate AI-powered insights from survey data"""
        try:
            # Get survey data
            survey_data = await self._get_survey_data(org_id, survey_id)
            
            if not survey_data:
                return {"error": "No survey data available for analysis"}
            
            insights = []
            
            # 1. Participation Insights
            participation_insights = await self._analyze_participation_patterns(survey_data)
            insights.extend(participation_insights)
            
            # 2. Score Analysis
            score_insights = await self._analyze_score_patterns(survey_data)
            insights.extend(score_insights)
            
            # 3. Sentiment Analysis
            sentiment_insights = await self._analyze_sentiment_patterns(survey_data)
            insights.extend(sentiment_insights)
            
            # 4. Trend Analysis
            trend_insights = await self._analyze_trend_patterns(survey_data)
            insights.extend(trend_insights)
            
            # 5. Anomaly Detection
            anomaly_insights = await self._detect_anomalies(survey_data)
            insights.extend(anomaly_insights)
            
            # 6. Predictive Insights
            predictive_insights = await self._generate_predictive_insights(survey_data)
            insights.extend(predictive_insights)
            
            # 7. Actionable Recommendations
            recommendations = await self._generate_recommendations(insights)
            
            return {
                "insights": insights,
                "recommendations": recommendations,
                "summary": {
                    "total_insights": len(insights),
                    "high_priority": len([i for i in insights if i.get("priority") == "high"]),
                    "medium_priority": len([i for i in insights if i.get("priority") == "medium"]),
                    "low_priority": len([i for i in insights if i.get("priority") == "low"])
                },
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {str(e)}")
            raise
    
    @handle_db_errors
    @handle_validation
    async def detect_engagement_anomalies(
        self,
        org_id: str,
        team_id: Optional[str] = None,
        sensitivity: float = 0.1
    ) -> Dict[str, Any]:
        """Detect anomalies in engagement patterns"""
        try:
            # Get engagement data
            engagement_data = await self._get_engagement_data(org_id, team_id)
            
            if len(engagement_data) < 3:
                return {"error": "Insufficient data for anomaly detection"}
            
            # Convert to DataFrame for analysis
            df = pd.DataFrame(engagement_data)
            
            # Calculate statistical measures
            mean_score = df['avg_score'].mean()
            std_score = df['avg_score'].std()
            
            # Detect anomalies using Z-score method
            z_scores = np.abs((df['avg_score'] - mean_score) / std_score)
            anomalies = df[z_scores > (1.96 * sensitivity)]  # 95% confidence interval
            
            # Detect trend anomalies
            trend_anomalies = await self._detect_trend_anomalies(df)
            
            # Detect participation anomalies
            participation_anomalies = await self._detect_participation_anomalies(df)
            
            return {
                "anomalies": {
                    "score_anomalies": [
                        {
                            "survey_id": str(row['survey_id']),
                            "team_id": str(row['team_id']),
                            "avg_score": float(row['avg_score']),
                            "z_score": float(z_scores.loc[idx]),
                            "anomaly_type": "score_deviation"
                        }
                        for idx, row in anomalies.iterrows()
                    ],
                    "trend_anomalies": trend_anomalies,
                    "participation_anomalies": participation_anomalies
                },
                "statistics": {
                    "total_surveys": len(df),
                    "anomaly_count": len(anomalies),
                    "anomaly_percentage": round(len(anomalies) / len(df) * 100, 2),
                    "mean_score": round(float(mean_score), 2),
                    "std_score": round(float(std_score), 2)
                }
            }
            
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}")
            raise
    
    @handle_db_errors
    @handle_validation
    async def generate_benchmark_analysis(
        self,
        org_id: str,
        industry: Optional[str] = None,
        company_size: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate benchmark analysis against industry standards"""
        try:
            # Get organization data
            org_data = await self._get_organization_benchmark_data(org_id)
            
            # Get industry benchmarks (mock data for now)
            industry_benchmarks = self._get_industry_benchmarks(industry, company_size)
            
            # Calculate benchmark comparisons
            comparisons = []
            for driver, org_score in org_data.items():
                if driver in industry_benchmarks:
                    benchmark = industry_benchmarks[driver]
                    difference = org_score - benchmark['average']
                    percentile = self._calculate_percentile(org_score, benchmark['distribution'])
                    
                    comparisons.append({
                        "driver": driver,
                        "org_score": round(org_score, 2),
                        "industry_average": round(benchmark['average'], 2),
                        "difference": round(difference, 2),
                        "percentile": round(percentile, 1),
                        "performance_level": self._get_performance_level(percentile),
                        "recommendation": self._get_benchmark_recommendation(difference, percentile)
                    })
            
            return {
                "benchmark_analysis": {
                    "organization_id": org_id,
                    "industry": industry or "General",
                    "company_size": company_size or "Medium",
                    "comparisons": comparisons,
                    "overall_performance": self._calculate_overall_performance(comparisons)
                },
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating benchmark analysis: {str(e)}")
            raise
    
    async def _get_historical_data(
        self,
        org_id: str,
        team_id: Optional[str] = None,
        driver_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get historical data for ML training"""
        query = self.db.query(DriverSummary).join(Survey).filter(Survey.org_id == org_id)
        
        if team_id:
            query = query.filter(DriverSummary.team_id == team_id)
        if driver_id:
            query = query.filter(DriverSummary.driver_id == driver_id)
        
        results = query.order_by(DriverSummary.survey_id).limit(24).all()
        
        return [
            {
                "survey_id": str(r.survey_id),
                "team_id": str(r.team_id),
                "driver_id": str(r.driver_id),
                "avg_score": float(r.avg_score),
                "respondents": int(r.respondents),
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in results
        ]
    
    def _prepare_ml_features(self, data: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features for machine learning"""
        df = pd.DataFrame(data)
        
        # Create time-based features
        df['created_at'] = pd.to_datetime(df['created_at'])
        df['month'] = df['created_at'].dt.month
        df['quarter'] = df['created_at'].dt.quarter
        df['year'] = df['created_at'].dt.year
        
        # Create lag features
        df['score_lag_1'] = df['avg_score'].shift(1)
        df['score_lag_2'] = df['avg_score'].shift(2)
        df['score_lag_3'] = df['avg_score'].shift(3)
        
        # Create rolling statistics
        df['score_rolling_mean'] = df['avg_score'].rolling(window=3).mean()
        df['score_rolling_std'] = df['avg_score'].rolling(window=3).std()
        
        # Drop NaN values
        df = df.dropna()
        
        # Prepare features and targets
        feature_columns = ['month', 'quarter', 'year', 'respondents', 'score_lag_1', 'score_lag_2', 'score_lag_3', 'score_rolling_mean', 'score_rolling_std']
        features = df[feature_columns].values
        targets = df['avg_score'].values
        
        return features, targets
    
    async def _train_prediction_model(self, features: np.ndarray, targets: np.ndarray) -> RandomForestRegressor:
        """Train prediction model"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(features, targets, test_size=0.2, random_state=42)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Save model
        model_path = os.path.join(self.models_dir, f"engagement_model_{datetime.now().strftime('%Y%m%d')}.joblib")
        joblib.dump((model, scaler), model_path)
        
        return model
    
    def _generate_future_features(self, data: List[Dict[str, Any]], months: int) -> np.ndarray:
        """Generate features for future predictions"""
        # This is a simplified version - in production, you'd want more sophisticated feature generation
        future_features = []
        
        for i in range(months):
            # Use the last known values as base
            last_data = data[-1]
            month = (datetime.now() + timedelta(days=30*i)).month
            quarter = ((month - 1) // 3) + 1
            year = (datetime.now() + timedelta(days=30*i)).year
            
            feature_vector = [
                month, quarter, year,
                last_data['respondents'],  # Assume same respondents
                last_data['avg_score'],    # Use last score as lag
                data[-2]['avg_score'] if len(data) > 1 else last_data['avg_score'],
                data[-3]['avg_score'] if len(data) > 2 else last_data['avg_score'],
                last_data['avg_score'],    # Rolling mean
                0.1                        # Rolling std (assume small variation)
            ]
            future_features.append(feature_vector)
        
        return np.array(future_features)
    
    def _calculate_confidence_intervals(self, predictions: np.ndarray, model: RandomForestRegressor, features: np.ndarray, targets: np.ndarray) -> List[Tuple[float, float]]:
        """Calculate confidence intervals for predictions"""
        # Use model's feature importances and training error to estimate confidence
        mse = mean_squared_error(targets, model.predict(features))
        std_error = np.sqrt(mse)
        
        confidence_intervals = []
        for pred in predictions:
            # 95% confidence interval
            lower = max(0, pred - 1.96 * std_error)
            upper = min(10, pred + 1.96 * std_error)
            confidence_intervals.append((lower, upper))
        
        return confidence_intervals
    
    async def _generate_prediction_insights(self, historical_data: List[Dict[str, Any]], predictions: np.ndarray) -> List[Dict[str, Any]]:
        """Generate insights from predictions"""
        insights = []
        
        # Trend analysis
        if len(predictions) >= 2:
            trend = predictions[-1] - predictions[0]
            if trend > 0.5:
                insights.append({
                    "type": "positive_trend",
                    "title": "Positive Engagement Trend Predicted",
                    "description": f"Engagement is predicted to increase by {trend:.1f} points over the next {len(predictions)} months",
                    "priority": "medium"
                })
            elif trend < -0.5:
                insights.append({
                    "type": "negative_trend",
                    "title": "Declining Engagement Trend Detected",
                    "description": f"Engagement is predicted to decrease by {abs(trend):.1f} points over the next {len(predictions)} months",
                    "priority": "high"
                })
        
        # Volatility analysis
        if len(predictions) >= 3:
            volatility = np.std(predictions)
            if volatility > 1.0:
                insights.append({
                    "type": "high_volatility",
                    "title": "High Engagement Volatility",
                    "description": "Engagement scores show high variability, indicating unstable patterns",
                    "priority": "medium"
                })
        
        return insights
    
    async def _get_survey_data(self, org_id: str, survey_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get comprehensive survey data for analysis"""
        query = self.db.query(DriverSummary).join(Survey).filter(Survey.org_id == org_id)
        
        if survey_id:
            query = query.filter(DriverSummary.survey_id == survey_id)
        
        results = query.order_by(desc(DriverSummary.created_at)).limit(100).all()
        
        return [
            {
                "survey_id": str(r.survey_id),
                "team_id": str(r.team_id),
                "driver_id": str(r.driver_id),
                "avg_score": float(r.avg_score),
                "respondents": int(r.respondents),
                "promoters_pct": float(r.promoters_pct),
                "passives_pct": float(r.passives_pct),
                "detractors_pct": float(r.detractors_pct),
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in results
        ]
    
    async def _analyze_participation_patterns(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze participation patterns"""
        insights = []
        
        # Calculate participation statistics
        participation_rates = [d.get('respondents', 0) for d in data]
        avg_participation = np.mean(participation_rates)
        
        if avg_participation < 50:
            insights.append({
                "type": "low_participation",
                "title": "Low Participation Rate",
                "description": f"Average participation rate is {avg_participation:.1f}%, which is below recommended levels",
                "priority": "high",
                "recommendation": "Implement targeted communication campaigns to increase engagement"
            })
        
        return insights
    
    async def _analyze_score_patterns(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze score patterns"""
        insights = []
        
        scores = [d.get('avg_score', 0) for d in data]
        avg_score = np.mean(scores)
        
        if avg_score < 6.0:
            insights.append({
                "type": "low_scores",
                "title": "Low Engagement Scores",
                "description": f"Average engagement score is {avg_score:.1f}/10, indicating areas for improvement",
                "priority": "high",
                "recommendation": "Focus on drivers with lowest scores and implement improvement initiatives"
            })
        
        return insights
    
    async def _analyze_sentiment_patterns(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze sentiment patterns"""
        insights = []
        
        # This would analyze sentiment data from comments
        # For now, return empty list as sentiment analysis is handled elsewhere
        return insights
    
    async def _analyze_trend_patterns(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze trend patterns"""
        insights = []
        
        if len(data) >= 2:
            recent_scores = [d.get('avg_score', 0) for d in data[:3]]
            older_scores = [d.get('avg_score', 0) for d in data[-3:]]
            
            recent_avg = np.mean(recent_scores)
            older_avg = np.mean(older_scores)
            
            change = recent_avg - older_avg
            
            if change > 0.5:
                insights.append({
                    "type": "improving_trend",
                    "title": "Improving Engagement Trend",
                    "description": f"Engagement has improved by {change:.1f} points recently",
                    "priority": "low",
                    "recommendation": "Maintain current initiatives and share positive feedback with teams"
                })
            elif change < -0.5:
                insights.append({
                    "type": "declining_trend",
                    "title": "Declining Engagement Trend",
                    "description": f"Engagement has declined by {abs(change):.1f} points recently",
                    "priority": "high",
                    "recommendation": "Investigate causes and implement immediate improvement measures"
                })
        
        return insights
    
    async def _detect_anomalies(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect anomalies in data"""
        insights = []
        
        scores = [d.get('avg_score', 0) for d in data]
        mean_score = np.mean(scores)
        std_score = np.std(scores)
        
        # Detect outliers
        for d in data:
            z_score = abs((d.get('avg_score', 0) - mean_score) / std_score)
            if z_score > 2.0:  # 95% confidence interval
                insights.append({
                    "type": "score_anomaly",
                    "title": "Unusual Score Detected",
                    "description": f"Score of {d.get('avg_score', 0):.1f} is significantly different from average",
                    "priority": "medium",
                    "recommendation": "Investigate this specific case for potential issues or successes"
                })
        
        return insights
    
    async def _generate_predictive_insights(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate predictive insights"""
        insights = []
        
        # Simple trend prediction
        if len(data) >= 3:
            recent_trend = data[0].get('avg_score', 0) - data[2].get('avg_score', 0)
            
            if recent_trend > 0:
                insights.append({
                    "type": "positive_prediction",
                    "title": "Positive Future Outlook",
                    "description": "Based on recent trends, engagement is likely to continue improving",
                    "priority": "low"
                })
            elif recent_trend < 0:
                insights.append({
                    "type": "negative_prediction",
                    "title": "Potential Future Decline",
                    "description": "Based on recent trends, engagement may continue to decline",
                    "priority": "high",
                    "recommendation": "Implement proactive measures to reverse the trend"
                })
        
        return insights
    
    async def _generate_recommendations(self, insights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on insights"""
        recommendations = []
        
        high_priority_insights = [i for i in insights if i.get("priority") == "high"]
        
        if high_priority_insights:
            recommendations.append({
                "type": "immediate_action",
                "title": "Immediate Action Required",
                "description": f"Address {len(high_priority_insights)} high-priority issues",
                "actions": [
                    "Schedule team meetings to discuss concerns",
                    "Implement targeted improvement initiatives",
                    "Increase communication frequency"
                ]
            })
        
        return recommendations
    
    async def _get_engagement_data(self, org_id: str, team_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get engagement data for anomaly detection"""
        query = self.db.query(DriverSummary).join(Survey).filter(Survey.org_id == org_id)
        
        if team_id:
            query = query.filter(DriverSummary.team_id == team_id)
        
        results = query.order_by(DriverSummary.created_at).limit(50).all()
        
        return [
            {
                "survey_id": str(r.survey_id),
                "team_id": str(r.team_id),
                "avg_score": float(r.avg_score),
                "respondents": int(r.respondents),
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in results
        ]
    
    async def _detect_trend_anomalies(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect anomalies in trends"""
        anomalies = []
        
        if len(df) >= 3:
            # Calculate rolling average and detect deviations
            rolling_avg = df['avg_score'].rolling(window=3).mean()
            deviations = abs(df['avg_score'] - rolling_avg)
            
            # Find points with large deviations
            threshold = deviations.std() * 2
            anomaly_indices = deviations > threshold
            
            for idx in df[anomaly_indices].index:
                anomalies.append({
                    "survey_id": str(df.loc[idx, 'survey_id']),
                    "team_id": str(df.loc[idx, 'team_id']),
                    "avg_score": float(df.loc[idx, 'avg_score']),
                    "expected_score": float(rolling_avg.loc[idx]),
                    "deviation": float(deviations.loc[idx]),
                    "anomaly_type": "trend_deviation"
                })
        
        return anomalies
    
    async def _detect_participation_anomalies(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect anomalies in participation"""
        anomalies = []
        
        if len(df) >= 3:
            # Calculate participation statistics
            mean_participation = df['respondents'].mean()
            std_participation = df['respondents'].std()
            
            # Find participation anomalies
            z_scores = abs((df['respondents'] - mean_participation) / std_participation)
            anomaly_indices = z_scores > 2.0
            
            for idx in df[anomaly_indices].index:
                anomalies.append({
                    "survey_id": str(df.loc[idx, 'survey_id']),
                    "team_id": str(df.loc[idx, 'team_id']),
                    "respondents": int(df.loc[idx, 'respondents']),
                    "expected_respondents": int(mean_participation),
                    "z_score": float(z_scores.loc[idx]),
                    "anomaly_type": "participation_deviation"
                })
        
        return anomalies
    
    async def _get_organization_benchmark_data(self, org_id: str) -> Dict[str, float]:
        """Get organization data for benchmarking"""
        results = self.db.query(DriverSummary).join(Survey).filter(
            Survey.org_id == org_id
        ).all()
        
        # Calculate average scores by driver
        driver_scores = {}
        for r in results:
            driver_id = str(r.driver_id)
            if driver_id not in driver_scores:
                driver_scores[driver_id] = []
            driver_scores[driver_id].append(float(r.avg_score))
        
        # Calculate averages
        return {driver: np.mean(scores) for driver, scores in driver_scores.items()}
    
    def _get_industry_benchmarks(self, industry: Optional[str], company_size: Optional[str]) -> Dict[str, Dict[str, Any]]:
        """Get industry benchmarks (mock data)"""
        # In production, this would fetch from a benchmark database
        return {
            "collaboration": {
                "average": 7.2,
                "distribution": [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0]
            },
            "recognition": {
                "average": 6.8,
                "distribution": [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5]
            },
            "leadership": {
                "average": 7.0,
                "distribution": [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0]
            }
        }
    
    def _calculate_percentile(self, score: float, distribution: List[float]) -> float:
        """Calculate percentile rank"""
        return sum(1 for x in distribution if x <= score) / len(distribution) * 100
    
    def _get_performance_level(self, percentile: float) -> str:
        """Get performance level based on percentile"""
        if percentile >= 80:
            return "excellent"
        elif percentile >= 60:
            return "good"
        elif percentile >= 40:
            return "average"
        elif percentile >= 20:
            return "below_average"
        else:
            return "poor"
    
    def _get_benchmark_recommendation(self, difference: float, percentile: float) -> str:
        """Get recommendation based on benchmark comparison"""
        if difference > 1.0:
            return "Maintain current practices - performing above industry average"
        elif difference > 0:
            return "Continue improvement efforts - slightly above industry average"
        elif difference > -1.0:
            return "Focus on targeted improvements - close to industry average"
        else:
            return "Implement comprehensive improvement plan - below industry average"
    
    def _calculate_overall_performance(self, comparisons: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate overall performance metrics"""
        if not comparisons:
            return {}
        
        avg_percentile = np.mean([c['percentile'] for c in comparisons])
        above_average_count = sum(1 for c in comparisons if c['difference'] > 0)
        
        return {
            "average_percentile": round(avg_percentile, 1),
            "above_average_drivers": above_average_count,
            "total_drivers": len(comparisons),
            "performance_level": self._get_performance_level(avg_percentile)
        }
