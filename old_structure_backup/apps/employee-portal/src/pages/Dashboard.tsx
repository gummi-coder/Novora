import React from 'react';
import styled from 'styled-components';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { SurveyResponseRate } from '../components/dashboard/SurveyResponseRate';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.lg};
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const DashboardTitle = styled.h2`
  grid-column: 1 / -1;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
`;

const mockResponseData = [
  {
    surveyId: '1',
    surveyName: 'Employee Satisfaction Survey 2024',
    responseRate: 75,
    totalResponses: 45,
    targetResponses: 60
  },
  {
    surveyId: '2',
    surveyName: 'Team Performance Review',
    responseRate: 85,
    totalResponses: 34,
    targetResponses: 40
  },
  {
    surveyId: '3',
    surveyName: 'Workplace Culture Assessment',
    responseRate: 60,
    totalResponses: 30,
    targetResponses: 50
  }
];

const mockActivities = [
  {
    id: '1',
    type: 'survey_created' as const,
    timestamp: new Date().toISOString(),
    details: {
      surveyName: 'Employee Satisfaction Survey 2024',
    },
  },
  {
    id: '2',
    type: 'survey_completed' as const,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: {
      surveyName: 'Team Performance Review',
      responseCount: 15,
    },
  },
  {
    id: '3',
    type: 'user_registered' as const,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: {
      userName: 'John Doe',
    },
  },
];

const Dashboard: React.FC = () => {
  return (
    <>
      <DashboardTitle>Dashboard</DashboardTitle>
      <DashboardContainer>
        <SurveyResponseRate data={mockResponseData} />
        <RecentActivity activities={mockActivities} />
      </DashboardContainer>
    </>
  );
};

export default Dashboard; 