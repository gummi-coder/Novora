import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating';
  options?: string[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
}

interface SurveyState {
  surveys: Survey[];
  currentSurvey: Survey | null;
  loading: boolean;
  error: string | null;
}

const initialState: SurveyState = {
  surveys: [],
  currentSurvey: null,
  loading: false,
  error: null,
};

const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    fetchSurveysStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSurveysSuccess: (state, action: PayloadAction<Survey[]>) => {
      state.loading = false;
      state.surveys = action.payload;
      state.error = null;
    },
    fetchSurveysFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentSurvey: (state, action: PayloadAction<Survey>) => {
      state.currentSurvey = action.payload;
    },
    createSurveyStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createSurveySuccess: (state, action: PayloadAction<Survey>) => {
      state.loading = false;
      state.surveys.push(action.payload);
      state.error = null;
    },
    createSurveyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSurveyStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSurveySuccess: (state, action: PayloadAction<Survey>) => {
      state.loading = false;
      state.surveys = state.surveys.map((survey) =>
        survey.id === action.payload.id ? action.payload : survey
      );
      state.error = null;
    },
    updateSurveyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteSurveyStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteSurveySuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.surveys = state.surveys.filter(
        (survey) => survey.id !== action.payload
      );
      state.error = null;
    },
    deleteSurveyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchSurveysStart,
  fetchSurveysSuccess,
  fetchSurveysFailure,
  setCurrentSurvey,
  createSurveyStart,
  createSurveySuccess,
  createSurveyFailure,
  updateSurveyStart,
  updateSurveySuccess,
  updateSurveyFailure,
  deleteSurveyStart,
  deleteSurveySuccess,
  deleteSurveyFailure,
} = surveySlice.actions;

export default surveySlice.reducer; 