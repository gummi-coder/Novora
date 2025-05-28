import React from 'react';
import styled from 'styled-components';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { formatDistanceToNow } from 'date-fns';

const Container = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.background.default};

  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const ActivityIcon = styled.div<{ type: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.type) {
      case 'survey_created':
        return props.theme.colors.primary.light;
      case 'survey_completed':
        return props.theme.colors.success.light;
      case 'user_registered':
        return props.theme.colors.info.light;
      default:
        return props.theme.colors.secondary.light;
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'survey_created':
        return props.theme.colors.primary.main;
      case 'survey_completed':
        return props.theme.colors.success.main;
      case 'user_registered':
        return props.theme.colors.info.main;
      default:
        return props.theme.colors.secondary.main;
    }
  }};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ActivityTime = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

interface Activity {
  id: string;
  type: 'survey_created' | 'survey_completed' | 'user_registered';
  timestamp: string;
  details: {
    surveyName?: string;
    userName?: string;
    responseCount?: number;
  };
}

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { t } = useTypedTranslation();

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'survey_created':
        return '📝';
      case 'survey_completed':
        return '✅';
      case 'user_registered':
        return '👤';
      default:
        return '📌';
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case 'survey_created':
        return t('dashboard.newSurveyCreated', { name: activity.details.surveyName || 'Unnamed Survey' });
      case 'survey_completed':
        return t('dashboard.surveyCompleted', {
          name: activity.details.surveyName || 'Unnamed Survey',
          count: activity.details.responseCount || 0,
        });
      case 'user_registered':
        return t('dashboard.newUserRegistered', { name: activity.details.userName || 'Anonymous User' });
      default:
        return '';
    }
  };

  return (
    <Container>
      <ActivityList>
        {activities.map(activity => (
          <ActivityItem key={activity.id}>
            <ActivityIcon type={activity.type}>
              {getActivityIcon(activity.type)}
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>{getActivityTitle(activity)}</ActivityTitle>
              <ActivityTime>
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </ActivityTime>
            </ActivityContent>
          </ActivityItem>
        ))}
      </ActivityList>
    </Container>
  );
}; 