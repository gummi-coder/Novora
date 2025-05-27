import React, { useState } from 'react';
import { WelcomePage } from './WelcomePage';
import { QuestionPage } from './QuestionPage';
import { FinalPage } from './FinalPage';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating';
  options?: string[];
}

interface SurveyProps {
  title: string;
  description: string;
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
}

export const Survey: React.FC<SurveyProps> = ({
  title,
  description,
  questions,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleStart = () => {
    setCurrentStep(1);
  };

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentStep - 1].id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentStep === questions.length) {
      onComplete(answers);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
  };

  const handleExit = () => {
    // Handle exit logic
    window.location.href = '/';
  };

  if (currentStep === 0) {
    return (
      <WelcomePage
        title={title}
        description={description}
        onStart={handleStart}
      />
    );
  }

  if (currentStep > questions.length) {
    return (
      <FinalPage
        onRestart={handleRestart}
        onExit={handleExit}
      />
    );
  }

  return (
    <QuestionPage
      question={questions[currentStep - 1]}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      currentQuestion={currentStep}
      totalQuestions={questions.length}
    />
  );
}; 