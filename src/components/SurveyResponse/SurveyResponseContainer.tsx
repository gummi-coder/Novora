import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Alert } from '@mui/material';
import { Survey } from '../../types/survey';
import { SurveyResponseForm } from './SurveyResponseForm';
import { SurveyResponseSuccess } from './SurveyResponseSuccess';
import { surveyService } from '../../services/surveyService';
import { surveyResponseService } from '../../services/surveyResponseService';

export const SurveyResponseContainer: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasExistingResponse, setHasExistingResponse] = useState(false);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!surveyId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load survey details
        const surveyData = await surveyService.getSurvey(surveyId);
        setSurvey(surveyData);

        // Check if user has already submitted a response
        if (!surveyData.isRepeatable) {
          const responses = await surveyResponseService.getUserResponses(surveyId);
          setHasExistingResponse(responses.length > 0);
        }
      } catch (err) {
        setError('Failed to load survey. Please try again later.');
        console.error('Error loading survey:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!survey) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Survey not found
      </Alert>
    );
  }

  if (hasExistingResponse) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        You have already submitted a response to this survey.
      </Alert>
    );
  }

  if (isSubmitted) {
    return (
      <SurveyResponseSuccess
        surveyTitle={survey.title}
        isRepeatable={survey.isRepeatable}
      />
    );
  }

  return (
    <SurveyResponseForm
      survey={survey}
      onComplete={() => setIsSubmitted(true)}
    />
  );
}; 