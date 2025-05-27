import { useCallback } from 'react';

const translations = {
  en: {
    dashboard: {
      newSurveyCreated: 'New survey created: {{name}}',
      surveyCompleted: '{{count}} responses received for {{name}}',
      newUserRegistered: 'New user registered: {{name}}',
      responseRate: 'Survey Response Rate',
      totalResponses: 'Total Responses',
      totalSent: 'Total Sent',
    },
  },
};

type TranslationKey = keyof typeof translations.en.dashboard;

export const useTypedTranslation = () => {
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = translations.en;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((acc, [key, val]) => {
        return acc.replace(`{{${key}}}`, String(val));
      }, value);
    }

    return value;
  }, []);

  return { t };
}; 