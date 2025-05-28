import React from 'react';
import styled from 'styled-components';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

const Container = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
`;

const CreateButton = styled.button`
  background-color: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-weight: ${props => props.theme.typography.fontWeight.medium};

  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
`;

const SurveyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const SurveyCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const SurveyTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const SurveyInfo = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const mockSurveys = [
  {
    id: '1',
    title: 'Employee Satisfaction Survey 2024',
    status: 'active',
    responses: 45,
    total: 60,
    lastUpdated: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Team Performance Review',
    status: 'completed',
    responses: 34,
    total: 40,
    lastUpdated: '2024-03-10T15:30:00Z'
  },
  {
    id: '3',
    title: 'Workplace Culture Assessment',
    status: 'draft',
    responses: 0,
    total: 50,
    lastUpdated: '2024-03-05T09:15:00Z'
  }
];

const Surveys: React.FC = () => {
  const { t } = useTypedTranslation();

  return (
    <Container>
      <Header>
        <Title>Surveys</Title>
        <CreateButton>Create New Survey</CreateButton>
      </Header>
      <SurveyGrid>
        {mockSurveys.map(survey => (
          <SurveyCard key={survey.id}>
            <SurveyTitle>{survey.title}</SurveyTitle>
            <SurveyInfo>
              <div>Status: {survey.status}</div>
              <div>Responses: {survey.responses}/{survey.total}</div>
              <div>Last updated: {new Date(survey.lastUpdated).toLocaleDateString()}</div>
            </SurveyInfo>
          </SurveyCard>
        ))}
      </SurveyGrid>
    </Container>
  );
};

export default Surveys; 