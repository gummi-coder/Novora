# Question Bank System

## Overview

The Question Bank is a centralized, structured system for managing survey questions across the Novora platform. It provides:

- **88 Pre-built Questions** across 11 key metrics
- **Multi-language Support** (English, Spanish, Icelandic, German, French)
- **Auto-rotation Logic** for preventing question fatigue
- **Sensitive Question Handling** with skip prompts
- **Integration** with Survey Builder and Auto-Pilot plans

## Architecture

### Database Schema

#### Metrics Table
```sql
metrics (
  id (Primary Key)
  name (e.g., "Job Satisfaction & Happiness")
  category (e.g., "job_satisfaction")
  description
  is_core (boolean - always included in auto-pilot)
  display_order
  created_at, updated_at
)
```

#### Question Bank Table
```sql
question_bank (
  id (Primary Key)
  metric_id (Foreign Key to metrics)
  question_text_en, question_text_es, question_text_is, question_text_de, question_text_fr
  active (boolean - can be retired without deletion)
  variation_order (for auto-rotation)
  sensitive (boolean - for skip prompts)
  reverse_scored (boolean - for negatively worded questions)
  created_at, updated_at
)
```

#### Auto-Pilot Tables
```sql
auto_pilot_plans (
  id, company_id, plan_id, name, start_date, status, created_at, updated_at
)

auto_pilot_surveys (
  id, plan_id, survey_id, month, template, name, description,
  send_date, first_reminder, second_reminder, close_date, status, created_at
)
```

## Metrics & Questions

### 1. Job Satisfaction & Happiness (Core)
- How happy and satisfied do you feel at work lately?
- Overall, how satisfied are you with your job right now?
- How positive is your daily experience at work?
- Do you feel good about coming to work each day?
- How content are you with your current role?
- How well does your work bring you a sense of fulfillment?
- How enjoyable do you find your work most days?
- How satisfied are you with your current responsibilities?

### 2. eNPS (Employee Net Promoter Score) (Core)
- How likely are you to recommend working here to a friend?
- Would you tell a friend this is a good place to work?
- How likely are you to encourage others to join this company?
- If a friend was job-hunting, would you suggest they apply here?
- Would you speak positively about working here to others?
- How likely are you to promote this company as a workplace?
- Would you tell people this is a great team to join?
- How likely are you to refer someone for a job here?

### 3. Manager Relationship
- Do you feel supported by your manager?
- How well does your manager help you succeed?
- Do you trust your manager's leadership?
- Does your manager listen to your ideas and concerns?
- How approachable is your manager when you need help?
- Do you feel respected by your manager?
- Does your manager provide helpful feedback regularly?
- Do you feel your manager values your input?

### 4. Peer Collaboration
- How connected do you feel with your teammates?
- Do you feel like you belong in your team?
- How well do you and your teammates work together?
- Do your colleagues support you when needed?
- How good is the teamwork in your department?
- Do you feel encouraged to collaborate with others?
- Do you trust your teammates to deliver quality work?
- How strong is the sense of unity in your team?

### 5. Recognition
- Do you feel your work is valued here?
- How often do you feel appreciated for what you do?
- Do you get enough recognition when you do good work?
- How recognized do you feel for your contributions?
- Does your manager/team acknowledge your efforts regularly?
- Do you feel unseen or underappreciated for your work? (reverse scored)
- How good is the company at celebrating success?
- Do you feel your contributions make a difference?

### 6. Career Growth
- Do you feel like you are growing and developing at work?
- How much progress have you made in your skills lately?
- Do you have opportunities to advance in your career here?
- Do you feel challenged in a way that helps you grow?
- Does your work help you learn new things?
- Are you building the skills you want for your career?
- Do you have a clear career path here?
- How much support do you get for professional growth?

### 7. Value Alignment
- Do you feel your values align with the company's values?
- How well do you believe in the company's mission?
- Do you agree with the direction the company is heading?
- Do you feel the company acts in line with its stated values?
- Does the company's purpose inspire you?
- Do you feel proud to be part of this company?
- Do you share the same priorities as the company leadership?
- Do you feel connected to the company's goals?

### 8. Communication
- How clear is communication within your team?
- Do you get the information you need to do your job well?
- How openly do people share important updates here?
- Do you feel kept in the loop about changes that affect you?
- How well does leadership communicate with the team?
- Are you comfortable raising concerns openly?
- Do you get feedback that helps you improve?
- How effective is the flow of information in the company?

### 9. Work Environment
- Do you have the tools and equipment you need to do your job well?
- How comfortable is your workspace?
- Does the company provide a safe work environment?
- Do you have the resources you need to be effective?
- How well does your work environment help you focus?
- Do you feel physically comfortable during your workday?
- How satisfied are you with the office setup or remote tools?
- Do you have access to the technology you need for your role?

### 10. Health & Wellness
- How well does the company support your mental health?
- Do you feel your physical well-being is looked after here?
- How manageable is your workload for maintaining balance?
- Does the company care about your health and wellness?
- Do you have enough flexibility to manage personal needs?
- How much does work negatively affect your well-being? (reverse scored)
- Do you feel supported during stressful periods?
- Does the company encourage healthy work habits?

### 11. Engagement
- How motivated are you to give your best at work?
- Do you feel excited about your work most days?
- How committed are you to helping the company succeed?
- Do you put extra effort into your work because you want to?
- How connected do you feel to the company's success?
- Do you feel energized by your daily tasks?
- Are you motivated to contribute beyond your core duties?
- How often do you go above and beyond at work?

## API Endpoints

### Public Endpoints

#### Get Metrics
```http
GET /api/v1/question-bank/metrics?include_core_only=false
```

#### Get Specific Metric with Questions
```http
GET /api/v1/question-bank/metrics/{metric_id}
```

#### Get Questions with Filtering
```http
GET /api/v1/question-bank/questions?metric_id=1&category=job_satisfaction&active_only=true&language=en
```

#### Get Random Questions (for auto-pilot)
```http
GET /api/v1/question-bank/questions/random?metric_ids=[1,2,3]&count_per_metric=1&exclude_questions=[10,15]
```

#### Get Specific Question
```http
GET /api/v1/question-bank/questions/{question_id}?language=en
```

### Admin Endpoints

#### Create Metric
```http
POST /api/v1/question-bank/admin/metrics
```

#### Create Question
```http
POST /api/v1/question-bank/admin/questions
```

#### Update Question
```http
PUT /api/v1/question-bank/admin/questions/{question_id}
```

#### Delete Question (deactivate)
```http
DELETE /api/v1/question-bank/admin/questions/{question_id}
```

## Frontend Integration

### Question Bank Component
The `QuestionBank` component provides:
- **Search functionality** across questions and metrics
- **Category filtering** by metric type
- **Sensitive question toggle** for privacy
- **Drag-and-drop integration** with survey builder
- **Auto-pilot integration** for random question selection

### Usage in Survey Builder
```tsx
import { QuestionBank } from '@/components/survey/QuestionBank';

<QuestionBank
  onQuestionSelect={(question) => addQuestionToSurvey(question)}
  selectedQuestions={currentQuestions}
/>
```

### Auto-Pilot Integration
```tsx
import { QuestionBankService } from '@/services/questionBank';

// Get random questions for auto-pilot
const questions = await QuestionBankService.getRandomQuestions({
  metricIds: [1, 2, 3], // Core metrics
  countPerMetric: 1,
  excludeQuestions: previouslyUsedQuestions
});
```

## Setup Instructions

### 1. Run Migration
```bash
cd Novora/backend
python scripts/migrate_question_bank.py
```

### 2. Seed Data
```bash
python scripts/seed_question_bank.py
```

### 3. Complete Setup (Recommended)
```bash
python scripts/setup_question_bank.py
```

## Features

### Multi-language Support
- Questions stored in multiple languages
- Automatic fallback to English
- Easy to add new languages

### Auto-rotation Logic
- Prevents question fatigue
- Tracks previously used questions
- Ensures variety in auto-pilot surveys

### Sensitive Question Handling
- Flagged questions can show skip prompts
- Mental health and manager-related questions marked as sensitive
- Respects user privacy preferences

### Reverse Scoring
- Negatively worded questions automatically reverse scored
- Maintains data consistency across variations

### Admin Management
- Easy to add new questions
- Retire old questions without deletion
- Update translations
- Manage question variations

## Benefits

1. **Centralized Management**: All questions in one place
2. **Consistency**: Standardized question variations
3. **Scalability**: Easy to add new metrics and questions
4. **Localization**: Multi-language support
5. **Quality Control**: Admin oversight of question bank
6. **Auto-Pilot Ready**: Seamless integration with automated surveys
7. **Data Integrity**: Proper scoring and categorization

## Future Enhancements

- **Question Analytics**: Track which questions perform best
- **A/B Testing**: Test different question variations
- **AI Suggestions**: Recommend questions based on context
- **Custom Metrics**: Allow companies to create their own metrics
- **Advanced Filtering**: Filter by question type, difficulty, etc.
- **Bulk Operations**: Import/export questions in bulk
