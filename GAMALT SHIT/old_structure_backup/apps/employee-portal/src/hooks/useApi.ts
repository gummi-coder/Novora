import { useState, useCallback } from 'react';
import { surveyService } from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await surveyService.getSurveys();
      return data;
    } catch (err) {
      setError('Failed to fetch surveys');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSurvey = useCallback(async (surveyData: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await surveyService.createSurvey(surveyData);
      return data;
    } catch (err) {
      setError('Failed to create survey');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSurvey = useCallback(async (id: string, surveyData: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await surveyService.updateSurvey(id, surveyData);
      return data;
    } catch (err) {
      setError('Failed to update survey');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSurvey = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await surveyService.deleteSurvey(id);
      return data;
    } catch (err) {
      setError('Failed to delete survey');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitResponse = useCallback(async (surveyId: string, responses: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await surveyService.submitResponse(surveyId, responses);
      return data;
    } catch (err) {
      setError('Failed to submit response');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchSurveys,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    submitResponse,
  };
}; 