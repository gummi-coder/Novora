import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import { SurveyFormState } from '../../types/survey';
import { RatingScaleInput } from './RatingScaleInput';

interface SurveyPreviewProps {
  survey: SurveyFormState;
}

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({ survey }) => {
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" gutterBottom>
        {survey.title || 'Untitled Survey'}
      </Typography>

      {survey.description && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          {survey.description}
        </Typography>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Survey Period
        </Typography>
        <Typography variant="body2">
          {survey.startDate && survey.endDate
            ? `${survey.startDate.toLocaleDateString()} - ${survey.endDate.toLocaleDateString()}`
            : 'No dates set'}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Survey Settings
        </Typography>
        <Typography variant="body2">
          {survey.isAnonymous ? 'Anonymous' : 'Identified'} •{' '}
          {survey.isRepeatable ? 'Multiple submissions allowed' : 'Single submission only'}
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>
        Questions
      </Typography>

      {survey.questions.map((question, index) => (
        <Box key={question.id} sx={{ mb: 4 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Question {index + 1}
          </Typography>
          <RatingScaleInput
            question={question}
            preview
          />
        </Box>
      ))}
    </Paper>
  );
}; 