export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  questions: SurveyQuestion[];
  category: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  category: string;
  order: number;
  required: boolean;
  type: 'slider' | 'photo';
}

export const surveyTemplates: SurveyTemplate[] = [
  {
    id: 'template-1',
    name: 'Core Pulse',
    description: 'Essential workplace satisfaction and engagement metrics',
    category: 'core',
    questions: [
      {
        id: 'q1',
        text: 'How happy and satisfied do you feel at work lately?',
        category: 'job_satisfaction',
        order: 0,
        required: true,
        type: 'photo'
      },
      {
        id: 'q2',
        text: 'How likely are you to recommend working here to a friend?',
        category: 'enps',
        order: 1,
        required: true,
        type: 'photo'
      },
      {
        id: 'q3',
        text: 'Do you feel supported by your manager?',
        category: 'manager_relationship',
        order: 2,
        required: true,
        type: 'photo'
      },
      {
        id: 'q4',
        text: 'How connected do you feel with your teammates?',
        category: 'peer_collaboration',
        order: 3,
        required: true,
        type: 'photo'
      },
      {
        id: 'q5',
        text: 'Do you feel your work is valued here?',
        category: 'recognition',
        order: 4,
        required: true,
        type: 'photo'
      },
      {
        id: 'q6',
        text: 'Do you get the information you need to do your job well?',
        category: 'communication',
        order: 5,
        required: true,
        type: 'photo'
      }
    ]
  },
  {
    id: 'template-2',
    name: 'Team Health Deep Dive',
    description: 'Focus on team dynamics and manager relationships',
    category: 'team',
    questions: [
      {
        id: 'q1',
        text: 'How happy and satisfied do you feel at work lately?',
        category: 'job_satisfaction',
        order: 0,
        required: true,
        type: 'photo'
      },
      {
        id: 'q2',
        text: 'How likely are you to recommend working here to a friend?',
        category: 'enps',
        order: 1,
        required: true,
        type: 'photo'
      },
      {
        id: 'q3',
        text: 'Do your colleagues support you when needed?',
        category: 'peer_collaboration',
        order: 2,
        required: true,
        type: 'photo'
      },
      {
        id: 'q4',
        text: 'How strong is the sense of unity in your team?',
        category: 'peer_collaboration',
        order: 3,
        required: true,
        type: 'photo'
      },
      {
        id: 'q5',
        text: 'How approachable is your manager when you need help?',
        category: 'manager_relationship',
        order: 4,
        required: true,
        type: 'photo'
      },
      {
        id: 'q6',
        text: 'Do you feel respected by your manager?',
        category: 'manager_relationship',
        order: 5,
        required: true,
        type: 'photo'
      }
    ]
  },
  {
    id: 'template-3',
    name: 'Growth & Engagement',
    description: 'Career development and motivation focus',
    category: 'growth',
    questions: [
      {
        id: 'q1',
        text: 'How happy and satisfied do you feel at work lately?',
        category: 'job_satisfaction',
        order: 0,
        required: true,
        type: 'photo'
      },
      {
        id: 'q2',
        text: 'How likely are you to recommend working here to a friend?',
        category: 'enps',
        order: 1,
        required: true,
        type: 'photo'
      },
      {
        id: 'q3',
        text: 'Do you feel like you are growing and developing at work?',
        category: 'career_growth',
        order: 2,
        required: true,
        type: 'photo'
      },
      {
        id: 'q4',
        text: 'Do you have opportunities to advance in your career here?',
        category: 'career_growth',
        order: 3,
        required: true,
        type: 'photo'
      },
      {
        id: 'q5',
        text: 'How motivated are you to give your best at work?',
        category: 'engagement',
        order: 4,
        required: true,
        type: 'photo'
      },
      {
        id: 'q6',
        text: 'Do you feel excited about your work most days?',
        category: 'engagement',
        order: 5,
        required: true,
        type: 'photo'
      }
    ]
  },
  {
    id: 'template-4',
    name: 'Culture & Collaboration Check',
    description: 'Values alignment and communication focus',
    category: 'culture',
    questions: [
      {
        id: 'q1',
        text: 'How happy and satisfied do you feel at work lately?',
        category: 'job_satisfaction',
        order: 0,
        required: true,
        type: 'photo'
      },
      {
        id: 'q2',
        text: 'How likely are you to recommend working here to a friend?',
        category: 'enps',
        order: 1,
        required: true,
        type: 'photo'
      },
      {
        id: 'q3',
        text: 'Do you feel your values align with the company\'s values?',
        category: 'value_alignment',
        order: 2,
        required: true,
        type: 'photo'
      },
      {
        id: 'q4',
        text: 'How well do you believe in the company\'s mission?',
        category: 'value_alignment',
        order: 3,
        required: true,
        type: 'photo'
      },
      {
        id: 'q5',
        text: 'How openly do people share important updates here?',
        category: 'communication',
        order: 4,
        required: true,
        type: 'photo'
      },
      {
        id: 'q6',
        text: 'Do you feel kept in the loop about changes that affect you?',
        category: 'communication',
        order: 5,
        required: true,
        type: 'photo'
      }
    ]
  },
  {
    id: 'template-5',
    name: 'Wellness & Environment Focus',
    description: 'Physical well-being and work environment',
    category: 'wellness',
    questions: [
      {
        id: 'q1',
        text: 'How happy and satisfied do you feel at work lately?',
        category: 'job_satisfaction',
        order: 0,
        required: true,
        type: 'photo'
      },
      {
        id: 'q2',
        text: 'How likely are you to recommend working here to a friend?',
        category: 'enps',
        order: 1,
        required: true,
        type: 'photo'
      },
      {
        id: 'q3',
        text: 'Do you feel your physical well-being is looked after here?',
        category: 'wellness',
        order: 2,
        required: true,
        type: 'photo'
      },
      {
        id: 'q4',
        text: 'How manageable is your workload for maintaining balance?',
        category: 'wellness',
        order: 3,
        required: true,
        type: 'photo'
      },
      {
        id: 'q5',
        text: 'Do you have the tools and equipment you need to do your job well?',
        category: 'work_environment',
        order: 4,
        required: true,
        type: 'photo'
      },
      {
        id: 'q6',
        text: 'Do you feel physically comfortable during your workday?',
        category: 'work_environment',
        order: 5,
        required: true,
        type: 'photo'
      }
    ]
  },
  {
    id: 'template-6',
    name: 'Review Lite (Snapshot)',
    description: 'Quick overview of key engagement metrics',
    category: 'snapshot',
    questions: [
      {
        id: 'q1',
        text: 'How happy and satisfied do you feel at work lately?',
        category: 'job_satisfaction',
        order: 0,
        required: true,
        type: 'photo'
      },
      {
        id: 'q2',
        text: 'How likely are you to recommend working here to a friend?',
        category: 'enps',
        order: 1,
        required: true,
        type: 'photo'
      },
      {
        id: 'q3',
        text: 'Does your manager listen to your ideas and concerns?',
        category: 'manager_relationship',
        order: 2,
        required: true,
        type: 'photo'
      },
      {
        id: 'q4',
        text: 'Do you feel your work is valued here?',
        category: 'recognition',
        order: 3,
        required: true,
        type: 'photo'
      },
      {
        id: 'q5',
        text: 'Do you feel like you are growing and developing at work?',
        category: 'career_growth',
        order: 4,
        required: true,
        type: 'photo'
      },
      {
        id: 'q6',
        text: 'How motivated are you to give your best at work?',
        category: 'engagement',
        order: 5,
        required: true,
        type: 'photo'
      }
    ]
  }
];

export const getTemplateById = (id: string): SurveyTemplate | undefined => {
  return surveyTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): SurveyTemplate[] => {
  return surveyTemplates.filter(template => template.category === category);
};
