import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import surveyReducer from './slices/surveySlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    survey: surveyReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 