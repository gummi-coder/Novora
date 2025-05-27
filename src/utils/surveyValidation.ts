import { SurveyFormState } from '../types/survey';

interface ValidationErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  questions?: {
    [key: string]: {
      label?: string;
      minLabel?: string;
      maxLabel?: string;
    };
  };
}

export const validateSurvey = (survey: SurveyFormState): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate title
  if (!survey.title.trim()) {
    errors.title = 'Survey title is required';
  }

  // Validate dates
  if (!survey.startDate) {
    errors.startDate = 'Start date is required';
  }
  if (!survey.endDate) {
    errors.endDate = 'End date is required';
  }
  if (survey.startDate && survey.endDate && survey.startDate > survey.endDate) {
    errors.endDate = 'End date must be after start date';
  }

  // Validate questions
  if (survey.questions.length === 0) {
    errors.questions = {
      _general: {
        label: 'At least one question is required',
      },
    };
  } else {
    const questionErrors: ValidationErrors['questions'] = {};
    
    survey.questions.forEach((question) => {
      const currentQuestionErrors: {
        label?: string;
        minLabel?: string;
        maxLabel?: string;
      } = {};

      if (!question.label.trim()) {
        currentQuestionErrors.label = 'Question text is required';
      }

      if (question.minLabel && question.minLabel.length > 50) {
        currentQuestionErrors.minLabel = 'Min label must be 50 characters or less';
      }

      if (question.maxLabel && question.maxLabel.length > 50) {
        currentQuestionErrors.maxLabel = 'Max label must be 50 characters or less';
      }

      if (Object.keys(currentQuestionErrors).length > 0) {
        questionErrors[question.id] = currentQuestionErrors;
      }
    });

    if (Object.keys(questionErrors).length > 0) {
      errors.questions = questionErrors;
    }
  }

  return errors;
};

export const isSurveyValid = (survey: SurveyFormState): boolean => {
  const errors = validateSurvey(survey);
  return Object.keys(errors).length === 0;
}; 