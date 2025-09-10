export interface AutoPilotPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in months
  schedule: AutoPilotSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutoPilotSchedule {
  month: number;
  templateId: string;
  templateName: string;
  description: string;
}

export const autoPilotPlans: AutoPilotPlan[] = [
  {
    id: 'quarterly-plan',
    name: 'Quarterly Plan',
    description: '3-month rotation of core survey templates',
    duration: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schedule: [
      {
        month: 1,
        templateId: 'template-1',
        templateName: 'Core Pulse',
        description: 'Essential workplace satisfaction and engagement metrics'
      },
      {
        month: 2,
        templateId: 'template-2',
        templateName: 'Team Health Deep Dive',
        description: 'Focus on team dynamics and manager relationships'
      },
      {
        month: 3,
        templateId: 'template-3',
        templateName: 'Growth & Engagement',
        description: 'Career development and motivation focus'
      }
    ]
  },
  {
    id: 'half-year-plan',
    name: 'Half-Year Plan',
    description: '6-month comprehensive survey rotation',
    duration: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schedule: [
      {
        month: 1,
        templateId: 'template-1',
        templateName: 'Core Pulse',
        description: 'Essential workplace satisfaction and engagement metrics'
      },
      {
        month: 2,
        templateId: 'template-2',
        templateName: 'Team Health Deep Dive',
        description: 'Focus on team dynamics and manager relationships'
      },
      {
        month: 3,
        templateId: 'template-3',
        templateName: 'Growth & Engagement',
        description: 'Career development and motivation focus'
      },
      {
        month: 4,
        templateId: 'template-4',
        templateName: 'Culture & Collaboration Check',
        description: 'Values alignment and communication focus'
      },
      {
        month: 5,
        templateId: 'template-5',
        templateName: 'Wellness & Environment Focus',
        description: 'Physical well-being and work environment'
      },
      {
        month: 6,
        templateId: 'template-6',
        templateName: 'Review Lite (Snapshot)',
        description: 'Quick overview of key engagement metrics'
      }
    ]
  },
  {
    id: 'annual-plan',
    name: 'Annual Plan',
    description: '12-month complete survey cycle (repeats twice)',
    duration: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schedule: [
      // First 6 months
      {
        month: 1,
        templateId: 'template-1',
        templateName: 'Core Pulse',
        description: 'Essential workplace satisfaction and engagement metrics'
      },
      {
        month: 2,
        templateId: 'template-2',
        templateName: 'Team Health Deep Dive',
        description: 'Focus on team dynamics and manager relationships'
      },
      {
        month: 3,
        templateId: 'template-3',
        templateName: 'Growth & Engagement',
        description: 'Career development and motivation focus'
      },
      {
        month: 4,
        templateId: 'template-4',
        templateName: 'Culture & Collaboration Check',
        description: 'Values alignment and communication focus'
      },
      {
        month: 5,
        templateId: 'template-5',
        templateName: 'Wellness & Environment Focus',
        description: 'Physical well-being and work environment'
      },
      {
        month: 6,
        templateId: 'template-6',
        templateName: 'Review Lite (Snapshot)',
        description: 'Quick overview of key engagement metrics'
      },
      // Second 6 months (repeat)
      {
        month: 7,
        templateId: 'template-1',
        templateName: 'Core Pulse',
        description: 'Essential workplace satisfaction and engagement metrics'
      },
      {
        month: 8,
        templateId: 'template-2',
        templateName: 'Team Health Deep Dive',
        description: 'Focus on team dynamics and manager relationships'
      },
      {
        month: 9,
        templateId: 'template-3',
        templateName: 'Growth & Engagement',
        description: 'Career development and motivation focus'
      },
      {
        month: 10,
        templateId: 'template-4',
        templateName: 'Culture & Collaboration Check',
        description: 'Values alignment and communication focus'
      },
      {
        month: 11,
        templateId: 'template-5',
        templateName: 'Wellness & Environment Focus',
        description: 'Physical well-being and work environment'
      },
      {
        month: 12,
        templateId: 'template-6',
        templateName: 'Review Lite (Snapshot)',
        description: 'Quick overview of key engagement metrics'
      }
    ]
  }
];

export const getPlanById = (id: string): AutoPilotPlan | undefined => {
  return autoPilotPlans.find(plan => plan.id === id);
};

export const getActivePlans = (): AutoPilotPlan[] => {
  return autoPilotPlans.filter(plan => plan.isActive);
};

export const getCurrentMonthTemplate = (planId: string, currentMonth: number): AutoPilotSchedule | undefined => {
  const plan = getPlanById(planId);
  if (!plan) return undefined;
  
  // Calculate which month in the cycle we're in
  const cycleMonth = ((currentMonth - 1) % plan.duration) + 1;
  
  return plan.schedule.find(schedule => schedule.month === cycleMonth);
};
