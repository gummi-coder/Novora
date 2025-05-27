export interface RatingScaleQuestion {
  id: string;
  type: 'RATING_SCALE';
  label: string;
  required: boolean;
  minLabel?: string; // e.g., "Not at all"
  maxLabel?: string; // e.g., "Extremely"
  order: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isAnonymous: boolean;
  isRepeatable: boolean;
  questions: RatingScaleQuestion[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  companyId: string;
}

export interface CreateSurveyInput {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isAnonymous: boolean;
  isRepeatable: boolean;
  questions: Omit<RatingScaleQuestion, 'id'>[];
}

export interface UpdateSurveyInput extends Partial<CreateSurveyInput> {
  id: string;
}

export interface SurveyFormState {
  title: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  isAnonymous: boolean;
  isRepeatable: boolean;
  questions: RatingScaleQuestion[];
} 