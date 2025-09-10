# Owner Dashboard Components

This folder contains all the specialized dashboard components designed specifically for business owners and administrators.

## Components

### TeamUsageSnapshot
**Purpose**: Comprehensive overview of team engagement and activity
**Features**:
- Active teams count and change percentage
- Survey completion rates with trends
- New signups tracking (weekly/monthly)
- Team activity decay detection
- Top 5 most engaged teams for case studies/referrals

**API Endpoint**: `/analytics/team-usage-snapshot`

### SurveyActivityLog
**Purpose**: Monitor survey performance and detect issues early
**Features**:
- Last survey sent and response volume
- Smart flagging system (zero responses, score drops, urgent comments)
- Configurable score delta thresholds
- Auto-tagging of comments (well-being, leadership, culture, etc.)
- Billing error detection and payment failure tracking

**API Endpoints**:
- `/analytics/survey-activity-log`
- `/analytics/score-threshold`
- `/analytics/comment-tags`

### PlanBillingOverview
**Purpose**: Manage subscription, billing, and plan usage
**Features**:
- Current plan details (Starter/Growth/Enterprise)
- Usage tracking against plan limits
- Trial status and days remaining
- Upgrade potential detection (>80% usage)
- Billing events and payment history
- Stripe integration for payment processing

**API Endpoint**: `/analytics/plan-billing-overview`

## Usage

```typescript
import { 
  TeamUsageSnapshot, 
  SurveyActivityLog, 
  PlanBillingOverview 
} from "@/components/dashboard/owner";

// Use in dashboard
<TeamUsageSnapshot />
<SurveyActivityLog />
<PlanBillingOverview />
```

## Data Flow

1. **TeamUsageSnapshot**: Fetches team engagement data and calculates metrics
2. **SurveyActivityLog**: Monitors survey performance and flags issues
3. **PlanBillingOverview**: Tracks subscription status and billing events

All components include:
- Loading states
- Error handling with fallback data
- Real-time data updates
- Responsive design
- Toast notifications for user feedback

## Owner Dashboard Layout

The owner dashboard displays these components in the following order:
1. **Team Usage Snapshot** - Top priority overview
2. **Survey Activity Log** - Performance monitoring
3. **Plan & Billing Overview** - Subscription management
4. **Pulse Overview** - General dashboard metrics
5. **Team Breakdown** - Detailed team analytics
6. **Anonymous Comments Viewer** - Feedback management
7. **Quick Actions Panel** - Common actions
8. **Advanced Capabilities** - Enterprise features 