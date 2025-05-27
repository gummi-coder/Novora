import { Survey } from '../types/survey';

interface ValidationErrors {
  [questionId: string]: string;
}

export const validateResponses = (
  responses: { [questionId: string]: number },
  questions: Survey['questions']
): ValidationErrors => {
  const errors: ValidationErrors = {};

  questions.forEach((question) => {
    if (question.required && responses[question.id] === undefined) {
      errors[question.id] = 'This question is required';
    }
  });

  return errors;
}; 