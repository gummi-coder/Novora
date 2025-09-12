// Main services index - only export simple services
export * from './auth';
export * from './surveyService';
export * from './alertService';
export * from './questionBank';
export * from './apiClient';
export * from './autoPilot';
export * from './survey';
export * from './admin';
export * from './core';
export * from './subscription';
export * from './enterprise';
export * from './payment';
export * from './pro';

// Note: real and mock services are simplified to avoid import errors
// The app uses direct API calls instead of complex service wrappers
