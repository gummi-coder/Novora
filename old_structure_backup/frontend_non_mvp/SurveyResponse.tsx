import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CustomSlider } from "@/components/ui/custom-slider";
import { QuestionImage } from "@/components/ui/question-image";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  MessageSquare,
  Type,
  List,
  CheckSquare,
  FileText
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Survey {
  id: string;
  title: string;
  description?: string;
  is_anonymous: boolean;
  allow_comments: boolean;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options?: {
    choices: string[];
  };
  allow_comments: boolean;
  image?: string;
}

const SurveyResponse = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/v1/surveys/${surveyId}/public`);
        
        if (!response.ok) {
          throw new Error('Survey not found');
        }
        
        const surveyData = await response.json();
        setSurvey(surveyData);
      } catch (error) {
        console.error('Error fetching survey:', error);
        toast({
          title: "Error",
          description: "Failed to load survey. It may not exist or be accessible.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchSurvey();
    }
  }, [surveyId, navigate, toast]);

  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [`question_${questionId}`]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Validate required fields
      const requiredQuestions = survey?.questions.filter(q => q.required) || [];
      const missingRequired = requiredQuestions.filter(q => {
        const value = formData[`question_${q.id}`];
        return !value || (Array.isArray(value) && value.length === 0);
      });
      
      if (missingRequired.length > 0) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required questions.",
          variant: "destructive",
        });
        return;
      }
      
      // Transform form data to match backend format
      const answers = Object.entries(formData).map(([fieldName, value]) => {
        const questionId = fieldName.replace('question_', '');
        return {
          question_id: parseInt(questionId),
          value: Array.isArray(value) ? value.join(', ') : String(value),
          comment: null,
        };
      });

      const response = await fetch(`http://localhost:8000/api/v1/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answers,
          completed: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      setSubmitted(true);
      toast({
        title: "Response submitted!",
        description: "Thank you for your feedback.",
      });
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const getQuestionIcon = (type: string) => {
      switch (type) {
        case 'text': return Type;
        case 'long_text': return FileText;
        case 'multiple_choice': return List;
        case 'checkbox': return CheckSquare;
        case 'rating': return Star;
        default: return Type;
      }
    };

    const Icon = getQuestionIcon(question.type);
    const fieldName = `question_${question.id}`;
    const currentValue = formData[fieldName];

    return (
      <Card key={question.id} className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-medium">{question.text}</h3>
                {question.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </div>
              
              {/* Question Image */}
              {question.image && (
                <QuestionImage
                  src={question.image}
                  alt={`Illustration for: ${question.text}`}
                  className="mt-4"
                />
              )}
              
              {question.type === 'text' && (
                <Input
                  placeholder="Enter your answer..."
                  value={currentValue || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                />
              )}

              {question.type === 'long_text' && (
                <Textarea
                  placeholder="Enter your detailed answer..."
                  rows={4}
                  value={currentValue || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                />
              )}

              {question.type === 'multiple_choice' && question.options?.choices && (
                <RadioGroup
                  value={currentValue || ''}
                  onValueChange={(value) => handleInputChange(question.id, value)}
                  className="space-y-3"
                >
                  {question.options.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice} id={`${question.id}-${choiceIndex}`} />
                      <Label htmlFor={`${question.id}-${choiceIndex}`} className="text-sm">
                        {choice}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'checkbox' && question.options?.choices && (
                <div className="space-y-3">
                  {question.options.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-${choiceIndex}`}
                        checked={(currentValue as string[])?.includes(choice) || false}
                        onCheckedChange={(checked) => {
                          const currentValues = (currentValue as string[]) || [];
                          if (checked) {
                            handleInputChange(question.id, [...currentValues, choice]);
                          } else {
                            handleInputChange(question.id, currentValues.filter(v => v !== choice));
                          }
                        }}
                      />
                      <Label htmlFor={`${question.id}-${choiceIndex}`} className="text-sm">
                        {choice}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'rating' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                  
                  <CustomSlider
                    value={currentValue ?? 5}
                    onChange={(value) => handleInputChange(question.id, value)}
                    min={0}
                    max={10}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0 = Very Poor</span>
                    <span>5 = Neutral</span>
                    <span>10 = Excellent</span>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {currentValue ?? 5}/10
                    </span>
                  </div>
                </div>
              )}

              {question.allow_comments && (
                <div className="mt-4">
                  <Label htmlFor={`comment-${question.id}`} className="text-sm text-gray-600">
                    Additional comments (optional)
                  </Label>
                  <Textarea
                    id={`comment-${question.id}`}
                    placeholder="Any additional thoughts..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading survey...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your response has been submitted successfully.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p>Survey not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{survey.title}</CardTitle>
              {survey.description && (
                <p className="text-gray-600">{survey.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{survey.questions.length} questions</span>
                </div>
                {survey.is_anonymous && (
                  <Badge variant="secondary">Anonymous</Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions
            .sort((a, b) => a.order - b.order)
            .map((question, index) => renderQuestion(question, index))}

          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Response
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default SurveyResponse; 