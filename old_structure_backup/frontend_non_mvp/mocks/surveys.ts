// Mock surveys service
export const mockSurveyService = {
  getSurveys: async () => {
    return [
      {
        id: '1',
        title: 'Employee Satisfaction Survey',
        status: 'active',
        responses: 15,
        total_employees: 25
      }
    ];
  },
  
  createSurvey: async (data: any) => {
    return {
      id: 'new-survey-id',
      ...data,
      status: 'draft'
    };
  },
  
  launchSurvey: async (data: any) => {
    return {
      success: true,
      message: 'Survey launched successfully! 25 invitations sent.',
      survey_id: 'survey-123',
      invite_count: 25
    };
  }
};
