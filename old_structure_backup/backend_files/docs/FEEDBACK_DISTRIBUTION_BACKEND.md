# Feedback Distribution Backend Implementation

## Overview

This document describes the backend implementation for the Weakness/Strength Distribution feature, which provides detailed analytics on survey question performance and comment analysis.

## Database Schema

### New Tables

#### 1. `survey_responses`
Stores individual survey responses with driver mapping for distribution analysis.

```sql
CREATE TABLE survey_responses (
    id INTEGER PRIMARY KEY,
    employee_id VARCHAR(100) NOT NULL,  -- anonymized hash
    team_id INTEGER NOT NULL,
    survey_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    driver VARCHAR(100) NOT NULL,       -- maps question → driver
    score INTEGER NOT NULL,             -- 0-10 scale
    timestamp DATETIME,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (survey_id) REFERENCES surveys(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

#### 2. `survey_comments`
Stores open-text comments with driver context for filtering.

```sql
CREATE TABLE survey_comments (
    id INTEGER PRIMARY KEY,
    comment_id VARCHAR(100) UNIQUE NOT NULL,  -- e.g., "cmt_345"
    team_id INTEGER NOT NULL,
    survey_id INTEGER NOT NULL,
    driver VARCHAR(100) NOT NULL,             -- driver context for filtering
    sentiment VARCHAR(20) NOT NULL,           -- positive, neutral, negative
    text TEXT NOT NULL,
    employee_id VARCHAR(100) NOT NULL,        -- anonymized hash
    is_flagged BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    tags JSON,                                -- auto-tagged themes
    created_at DATETIME,
    FOREIGN KEY (survey_id) REFERENCES surveys(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

#### 3. `drivers`
Mapping table for question_id → driver name.

```sql
CREATE TABLE drivers (
    id INTEGER PRIMARY KEY,
    question_id INTEGER NOT NULL,
    driver_name VARCHAR(100) NOT NULL,        -- e.g., "Collaboration", "Recognition"
    description TEXT,
    category VARCHAR(50),                     -- e.g., "Team", "Leadership", "Work Environment"
    created_at DATETIME,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

#### 4. `metrics_summary`
Cached results per team/driver/survey for fast dashboard loads.

```sql
CREATE TABLE metrics_summary (
    id INTEGER PRIMARY KEY,
    team_id INTEGER NOT NULL,
    driver VARCHAR(100) NOT NULL,
    survey_id INTEGER NOT NULL,
    avg_score FLOAT NOT NULL,
    change FLOAT DEFAULT 0.0,                 -- vs previous survey
    distribution JSON NOT NULL,               -- {"detractors": 40, "passives": 30, "promoters": 30}
    response_count INTEGER NOT NULL,
    participation_rate FLOAT NOT NULL,
    last_calculated DATETIME,
    FOREIGN KEY (survey_id) REFERENCES surveys(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

### Indexes

Performance indexes for efficient querying:

```sql
-- Survey responses
CREATE INDEX ix_survey_responses_team_driver_survey ON survey_responses (team_id, driver, survey_id);
CREATE INDEX ix_survey_responses_employee_id ON survey_responses (employee_id);
CREATE INDEX ix_survey_responses_timestamp ON survey_responses (timestamp);

-- Survey comments
CREATE INDEX ix_survey_comments_team_driver ON survey_comments (team_id, driver);
CREATE INDEX ix_survey_comments_sentiment ON survey_comments (sentiment);
CREATE INDEX ix_survey_comments_created_at ON survey_comments (created_at);
CREATE INDEX ix_survey_comments_flagged ON survey_comments (is_flagged);

-- Drivers
CREATE INDEX ix_drivers_question_id ON drivers (question_id);
CREATE INDEX ix_drivers_driver_name ON drivers (driver_name);

-- Metrics summary
CREATE INDEX ix_metrics_summary_team_driver_survey ON metrics_summary (team_id, driver, survey_id);
CREATE INDEX ix_metrics_summary_last_calculated ON metrics_summary (last_calculated);
```

## API Endpoints

### 1. GET `/api/v1/feedback/distribution`

Get weakness/strength distribution data for feedback analysis.

**Query Parameters:**
- `team_id` (string, required): Team ID or 'all' for all teams
- `survey_id` (string, required): Survey ID or 'current' for latest survey
- `driver` (string, optional): Specific driver to filter by

**Response Example:**
```json
[
  {
    "driver": "Collaboration",
    "avg_score": 6.2,
    "change": -0.5,
    "distribution": {
      "detractors": 40.0,
      "passives": 30.0,
      "promoters": 30.0
    },
    "response_count": 50,
    "participation_rate": 0.92
  },
  {
    "driver": "Recognition",
    "avg_score": 7.8,
    "change": 0.3,
    "distribution": {
      "detractors": 20.0,
      "passives": 25.0,
      "promoters": 55.0
    },
    "response_count": 45,
    "participation_rate": 0.88
  }
]
```

### 2. GET `/api/v1/feedback/comments`

Get feedback comments with filtering options.

**Query Parameters:**
- `team_id` (string, optional): Team ID to filter by
- `driver` (string, optional): Driver to filter by
- `sentiment` (string, optional): Sentiment filter (positive, neutral, negative)
- `flagged_only` (boolean, optional): Show only flagged comments
- `search` (string, optional): Search in comment text
- `limit` (integer, optional): Number of comments to return (default: 50)
- `offset` (integer, optional): Offset for pagination (default: 0)

**Response Example:**
```json
{
  "comments": [
    {
      "id": 1,
      "comment_id": "cmt_345",
      "team_id": 1,
      "survey_id": 1,
      "driver": "Collaboration",
      "sentiment": "negative",
      "text": "We don't communicate well across teams.",
      "employee_id": "emp_001",
      "is_flagged": false,
      "is_pinned": false,
      "tags": ["communication", "teamwork"],
      "created_at": "2025-01-27T10:30:00Z"
    }
  ],
  "total_count": 150,
  "limit": 50,
  "offset": 0
}
```

### 3. POST `/api/v1/feedback/comments/{comment_id}/flag`

Flag or unflag a feedback comment.

**Request Body:**
```json
{
  "flagged": true
}
```

### 4. POST `/api/v1/feedback/comments/{comment_id}/pin`

Pin or unpin a feedback comment.

**Request Body:**
```json
{
  "pinned": true
}
```

## Processing Logic

### Distribution Calculation

For each driver, the system calculates:

1. **Average Score**: `avg_score = sum(scores) / len(scores)`

2. **Distribution Buckets**:
   - Detractors: `count(score in [0-6]) / total_responses * 100`
   - Passives: `count(score in [7-8]) / total_responses * 100`
   - Promoters: `count(score in [9-10]) / total_responses * 100`

3. **Trend vs Previous Period**:
   - Fetch same driver's avg_score from previous survey
   - `change = current_avg - last_avg`

4. **Participation Rate**:
   - `participation_rate = unique_respondents / team_size`

### Comment Filtering

When a user clicks on a driver bar in the frontend, the system filters comments where `driver = "selected_driver"`.

## Services

### FeedbackAnalyticsService

Located in `app/services/feedback_analytics.py`, this service provides:

- `calculate_driver_metrics()`: Calculate metrics for drivers
- `cache_metrics_summary()`: Cache calculated metrics for fast dashboard loads
- `get_cached_metrics()`: Retrieve cached metrics
- `get_comment_insights()`: Analyze themes and sentiment from comments

## Data Flow

1. **Survey Response Collection**:
   - Employee submits survey response
   - Response stored in `survey_responses` with driver mapping
   - Employee ID anonymized using hash

2. **Metrics Calculation**:
   - When survey closes or periodically
   - System calculates per team × driver × period
   - Results cached in `metrics_summary` table

3. **Comment Analysis**:
   - Open-text comments stored with driver context
   - Sentiment analysis applied
   - Auto-tagging for themes

4. **Dashboard Display**:
   - Frontend requests distribution data via API
   - Cached metrics returned for fast response
   - Comments filtered by driver when bar clicked

## Setup Instructions

### 1. Run Database Migration

```bash
cd backend
alembic upgrade head
```

### 2. Seed Sample Data

```bash
python scripts/seed_feedback_data.py
```

### 3. Test API Endpoints

```bash
# Get distribution data
curl "http://localhost:8000/api/v1/feedback/distribution?team_id=all&survey_id=current"

# Get comments
curl "http://localhost:8000/api/v1/feedback/comments?driver=Collaboration"
```

## Performance Considerations

1. **Caching**: Metrics are pre-calculated and cached in `metrics_summary` table
2. **Indexing**: Strategic indexes on frequently queried columns
3. **Pagination**: Comments endpoint supports pagination for large datasets
4. **Anonymization**: Employee IDs hashed for privacy

## Security

- All endpoints require authentication
- Employee data anonymized using hashes
- Team-based access control
- Input validation on all parameters

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live dashboard updates
2. **Advanced Analytics**: Machine learning for sentiment analysis
3. **Export Features**: CSV/PDF export of distribution data
4. **Custom Drivers**: User-defined driver categories
5. **Benchmarking**: Compare against industry standards
