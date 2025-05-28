import React from 'react';
import { WelcomePage } from './WelcomePage';
import { QuestionPage } from './QuestionPage';
import { FinalPage } from './FinalPage';
import type { Survey, SurveyLanguage, SurveyResponse } from '../../lib/types/survey';

interface SurveyProps {
  survey: Survey;
  onSubmit: (response: SurveyResponse) => void;
}

export function Survey({ survey, onSubmit }: SurveyProps) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [selectedLanguages, setSelectedLanguages] = React.useState<SurveyLanguage[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, string | number>>({});
  const [finalComment, setFinalComment] = React.useState('');

  const handleStart = (languages: SurveyLanguage[]) => {
    setSelectedLanguages(languages);
    setCurrentPage(1);
  };

  const handleQuestionPageNext = (pageAnswers: Record<string, string | number>) => {
    setAnswers(prev => ({
      ...prev,
      ...pageAnswers
    }));

    if (currentPage === survey.pages.length) {
      setCurrentPage(currentPage + 1);
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    setCurrentPage(prev => prev - 1);
  };

  const handleFinalSubmit = (comment: string) => {
    setFinalComment(comment);
    
    const response: SurveyResponse = {
      id: crypto.randomUUID(),
      surveyId: survey.id,
      language: selectedLanguages[0], // Using first selected language
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      })),
      finalComment: comment,
      submittedAt: new Date().toISOString()
    };

    onSubmit(response);
  };

  if (currentPage === 0) {
    return <WelcomePage languages={survey.languages} onStart={handleStart} />;
  }

  if (currentPage <= survey.pages.length) {
    return (
      <QuestionPage
        page={survey.pages[currentPage - 1]}
        currentPage={currentPage}
        totalPages={survey.pages.length + 1}
        onNext={handleQuestionPageNext}
        onBack={handleBack}
      />
    );
  }

  return (
    <FinalPage
      finalQuestion={survey.finalQuestion}
      onSubmit={handleFinalSubmit}
      onBack={handleBack}
    />
  );
} 