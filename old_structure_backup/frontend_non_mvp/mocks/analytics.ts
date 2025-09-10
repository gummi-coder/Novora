// Mock analytics service
export const mockAnalyticsService = {
  getAnalytics: async () => {
    return {
      totalSurveys: 15,
      totalResponses: 234,
      averageResponseRate: 78.5,
      recentActivity: [
        { date: '2024-01-15', surveys: 3, responses: 45 },
        { date: '2024-01-14', surveys: 2, responses: 32 },
        { date: '2024-01-13', surveys: 1, responses: 28 }
      ]
    };
  },
  
  getSurveyAnalytics: async (surveyId: string) => {
    return {
      surveyId,
      totalInvites: 50,
      totalResponses: 38,
      responseRate: 76,
      averageScore: 4.2,
      departmentBreakdown: {
        'Engineering': { responses: 15, averageScore: 4.1 },
        'Marketing': { responses: 8, averageScore: 4.3 },
        'Sales': { responses: 12, averageScore: 4.0 },
        'HR': { responses: 3, averageScore: 4.5 }
      }
    };
  }
};
