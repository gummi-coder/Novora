import React from 'react';
import { SurveyPreview } from '../components/survey/SurveyPreview';
import type { Survey as SurveyType, SurveyResponse } from '../lib/types/survey';

const sampleSurvey: SurveyType = {
  id: '1',
  title: 'Employee Engagement Survey 2024',
  description: 'Help us understand how we can improve your work experience',
  languages: ['en', 'is', 'pl', 'lt'],
  pages: [
    {
      id: '1',
      title: 'Work Environment',
      questions: [
        {
          id: '1-1',
          type: 'scale_1_10',
          text: 'How satisfied are you with your work environment?',
          required: true,
          leftLabel: 'Very Dissatisfied',
          rightLabel: 'Very Satisfied'
        }
      ]
    },
    {
      id: '2',
      title: 'Work-Life Balance',
      questions: [
        {
          id: '2-1',
          type: 'scale_1_10',
          text: 'How would you rate your work-life balance?',
          required: true,
          leftLabel: 'Poor Balance',
          rightLabel: 'Excellent Balance'
        }
      ]
    },
    {
      id: '3',
      title: 'Career Growth',
      questions: [
        {
          id: '3-1',
          type: 'scale_1_10',
          text: 'How satisfied are you with your career growth opportunities?',
          required: true,
          leftLabel: 'Very Dissatisfied',
          rightLabel: 'Very Satisfied'
        }
      ]
    },
    {
      id: '4',
      title: 'Team Support',
      questions: [
        {
          id: '4-1',
          type: 'scale_1_10',
          text: 'How supported do you feel by your team members?',
          required: true,
          leftLabel: 'Not Supported',
          rightLabel: 'Very Supported'
        }
      ]
    },
    {
      id: '5',
      title: 'Management',
      questions: [
        {
          id: '5-1',
          type: 'scale_1_10',
          text: 'How would you rate your relationship with your manager?',
          required: true,
          leftLabel: 'Poor',
          rightLabel: 'Excellent'
        }
      ]
    },
    {
      id: '6',
      title: 'Communication',
      questions: [
        {
          id: '6-1',
          type: 'scale_1_10',
          text: 'How well-informed do you feel about company updates?',
          required: true,
          leftLabel: 'Not Informed',
          rightLabel: 'Very Well Informed'
        }
      ]
    },
    {
      id: '7',
      title: 'Resources',
      questions: [
        {
          id: '7-1',
          type: 'scale_1_10',
          text: 'How would you rate the resources available to do your job effectively?',
          required: true,
          leftLabel: 'Insufficient',
          rightLabel: 'Excellent'
        }
      ]
    },
    {
      id: '8',
      title: 'Recognition',
      questions: [
        {
          id: '8-1',
          type: 'scale_1_10',
          text: 'How valued do you feel for your contributions?',
          required: true,
          leftLabel: 'Not Valued',
          rightLabel: 'Highly Valued'
        }
      ]
    },
    {
      id: '9',
      title: 'Company Culture',
      questions: [
        {
          id: '9-1',
          type: 'scale_1_10',
          text: 'How well does the company culture align with your values?',
          required: true,
          leftLabel: 'Not at all',
          rightLabel: 'Completely'
        }
      ]
    },
    {
      id: '10',
      title: 'Future Outlook',
      questions: [
        {
          id: '10-1',
          type: 'scale_1_10',
          text: 'How likely are you to recommend this company as a place to work?',
          required: true,
          leftLabel: 'Not Likely',
          rightLabel: 'Very Likely'
        }
      ]
    }
  ],
  finalQuestion: 'Is there anything else you would like to share about your work experience?',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin',
  status: 'active'
};

export default function SurveyTest() {
  const handleShare = (link: string) => {
    console.log('Share link:', link);
  };

  return (
    <div className="container mx-auto py-8">
      <SurveyPreview survey={sampleSurvey} onShare={handleShare} />
    </div>
  );
} 