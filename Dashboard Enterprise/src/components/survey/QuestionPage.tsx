import React from 'react';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating';
  options?: string[];
}

interface QuestionPageProps {
  question: Question;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
}

export const QuestionPage: React.FC<QuestionPageProps> = ({
  question,
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
}) => {
  const [answer, setAnswer] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnswer(answer);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestion} of {totalQuestions}</span>
          <span>{Math.round((currentQuestion / totalQuestions) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{question.text}</h2>

        {question.type === 'text' && (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            required
          />
        )}

        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label key={option} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answer === option}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                  required
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'rating' && (
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setAnswer(rating.toString())}
                className={`w-12 h-12 rounded-full ${
                  answer === rating.toString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={currentQuestion === 1}
          >
            Previous
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {currentQuestion === totalQuestions ? 'Submit' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}; 