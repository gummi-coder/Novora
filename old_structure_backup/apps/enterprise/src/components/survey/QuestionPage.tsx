import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import type { Question, SurveyPage } from '../../lib/types/survey';

interface QuestionPageProps {
  page: SurveyPage;
  currentPage: number;
  totalPages: number;
  onNext: (answers: Record<string, string | number>) => void;
  onBack: () => void;
}

export function QuestionPage({ page, currentPage, totalPages, onNext, onBack }: QuestionPageProps) {
  const [answer, setAnswer] = React.useState<string | number | undefined>();
  const [isAnswered, setIsAnswered] = React.useState(false);
  const question = page.questions[0];

  const handleAnswerChange = (value: string | number) => {
    setAnswer(value);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (answer !== undefined) {
      onNext({ [question.id]: answer });
      // Reset the answer when moving to next question
      setAnswer(undefined);
      setIsAnswered(false);
    }
  };

  const isPageComplete = () => {
    return !question.required || answer !== undefined;
  };

  const getEmoji = (value: number) => {
    if (value <= 3) return '😞';
    if (value <= 6) return '😐';
    if (value <= 8) return '🙂';
    return '😊';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            {page.title}
            <Sparkles className="h-5 w-5 text-yellow-400" />
          </CardTitle>
          
          <div className="flex items-center justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={onBack} 
              disabled={currentPage === 1}
              className="hover:scale-105 transition-transform"
            >
              Back
            </Button>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              Question {currentPage} of {totalPages}
            </div>
          </div>
          
          <Progress 
            value={(currentPage / totalPages) * 100} 
            className="mt-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-medium">
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{question.leftLabel}</span>
                <span>{question.rightLabel}</span>
              </div>
              <RadioGroup
                value={answer?.toString()}
                onValueChange={(value) => handleAnswerChange(parseInt(value))}
                className="grid grid-cols-10 gap-2"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <div 
                    key={value} 
                    className="flex items-center justify-center"
                  >
                    <RadioGroupItem
                      value={value.toString()}
                      id={`${question.id}-${value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`${question.id}-${value}`}
                      className={`flex flex-col items-center justify-center h-12 w-12 rounded-full border-2 text-sm font-medium transition-all duration-300 ${
                        answer !== undefined && value <= Number(answer)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/25 hover:border-primary/50'
                      }`}
                    >
                      <span>{value}</span>
                      <span className="text-xs">{getEmoji(value)}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isAnswered ? 1 : 0, y: isAnswered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              onClick={handleNext}
              disabled={!isPageComplete()}
            >
              {currentPage === totalPages ? 'Submit Survey' : 'Next Question'}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 