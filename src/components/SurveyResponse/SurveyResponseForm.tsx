import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Survey } from '../../types/survey';
import { SurveyResponseFormState, SurveyResponseProgress } from '../../types/surveyResponse';
import { RatingScaleInput } from '../SurveyBuilder/RatingScaleInput';
import { surveyResponseService } from '../../services/surveyResponseService';
import { validateResponses } from '../../utils/surveyResponseValidation';

interface SurveyResponseFormProps {
  survey: Survey;
  onComplete?: () => void;
}

const calculateProgress = (
  responses: { [key: string]: number },
  questions: Survey['questions']
): SurveyResponseProgress => {
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(responses).length;
  const isComplete = questions.every(
    (q) => q.required ? responses[q.id] !== undefined : true
  );

  return {
    totalQuestions,
    answeredQuestions,
    isComplete,
    percentage: (answeredQuestions / totalQuestions) * 100,
  };
};

export const SurveyResponseForm: React.FC<SurveyResponseFormProps> = ({
  survey,
  onComplete,
}) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<SurveyResponseFormState>({
    responses: {},
    isSubmitting: false,
    errors: {},
  });
  const [progress, setProgress] = useState<SurveyResponseProgress>({
    totalQuestions: survey.questions.length,
    answeredQuestions: 0,
    isComplete: false,
    percentage: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setProgress(calculateProgress(formState.responses, survey.questions));
  }, [formState.responses, survey.questions]);

  const handleResponseChange = (questionId: string, value: number) => {
    setFormState((prev) => {
      const newErrors = { ...prev.errors };
      delete newErrors[questionId];

      return {
        ...prev,
        responses: {
          ...prev.responses,
          [questionId]: value,
        },
        errors: newErrors,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateResponses(formState.responses, survey.questions);
    if (Object.keys(validationErrors).length > 0) {
      setFormState((prev) => ({
        ...prev,
        errors: validationErrors,
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await surveyResponseService.createResponse({
        surveyId: survey.id,
        responses: Object.entries(formState.responses).map(([questionId, value]) => ({
          questionId,
          value,
        })),
        isAnonymous: survey.isAnonymous,
      });

      setShowSuccess(true);
      onComplete?.();
    } catch (error) {
      console.error('Failed to submit survey:', error);
      // Handle error (show error message, etc.)
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          {survey.title}
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

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Progress: {progress.answeredQuestions} of {progress.totalQuestions} questions answered
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress.percentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {survey.questions.map((question) => (
          <Box key={question.id} sx={{ mb: 4 }}>
            <RatingScaleInput
              question={question}
              value={formState.responses[question.id]}
              onChange={(value) => handleResponseChange(question.id, value)}
              error={!!formState.errors[question.id]}
              helperText={formState.errors[question.id]}
            />
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={formState.isSubmitting || !progress.isComplete}
          >
            {formState.isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Survey submitted successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
}; 