import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Eye, Trash2 } from 'lucide-react';

interface PhotoQuestion {
  id: string;
  question: string;
  description?: string;
  category: string;
  required: boolean;
}

interface PhotoQuestionBuilderProps {
  onSave: (questions: PhotoQuestion[]) => void;
  initialQuestions?: PhotoQuestion[];
}

const PhotoQuestionBuilder: React.FC<PhotoQuestionBuilderProps> = ({
  onSave,
  initialQuestions = []
}) => {
  const [questions, setQuestions] = useState<PhotoQuestion[]>(initialQuestions);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<PhotoQuestion>>({
    question: '',
    description: '',
    category: 'General',
    required: true
  });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const categories = [
    'Work Environment',
    'Management',
    'Work-Life Balance',
    'Career Development',
    'Company Culture',
    'Compensation',
    'Benefits',
    'General'
  ];

  const handleAddQuestion = () => {
    if (!currentQuestion.question?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: PhotoQuestion = {
      id: Date.now().toString(),
      question: currentQuestion.question.trim(),
      description: currentQuestion.description?.trim() || '',
      category: currentQuestion.category || 'General',
      required: currentQuestion.required ?? true
    };

    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestion({
      question: '',
      description: '',
      category: 'General',
      required: true
    });
    setIsAdding(false);

    toast({
      title: "Question Added",
      description: "Photo-based question has been added to your survey",
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({
      title: "Question Removed",
      description: "Question has been removed from your survey",
    });
  };

  const handleSave = () => {
    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one question to your survey",
        variant: "destructive"
      });
      return;
    }

    onSave(questions);
    toast({
      title: "Survey Saved",
      description: "Your photo-based survey has been saved successfully",
    });
  };

  const handlePreview = () => {
    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one question to preview",
        variant: "destructive"
      });
      return;
    }

    // Open preview in new tab
    const previewData = encodeURIComponent(JSON.stringify(questions));
    window.open(`/photo-survey-demo?preview=${previewData}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Photo-Based Survey Builder</h2>
          <p className="text-gray-600 mt-2">
            Create engaging surveys using emoji photos that correspond to numbers 0-10
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handlePreview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Survey
          </Button>
        </div>
      </div>

      {/* Photo Mapping Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Photo Number Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">😢</div>
              <div className="font-bold">0</div>
              <div className="text-xs text-gray-600">111111</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">😞</div>
              <div className="font-bold">1</div>
              <div className="text-xs text-gray-600">1010</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">😕</div>
              <div className="font-bold">2</div>
              <div className="text-xs text-gray-600">999</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">😐</div>
              <div className="font-bold">3</div>
              <div className="text-xs text-gray-600">888</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">🙂</div>
              <div className="font-bold">4</div>
              <div className="text-xs text-gray-600">777</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">😊</div>
              <div className="font-bold">5</div>
              <div className="text-xs text-gray-600">666</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">😄</div>
              <div className="font-bold">6</div>
              <div className="text-xs text-gray-600">555</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">😁</div>
              <div className="font-bold">7</div>
              <div className="text-xs text-gray-600">444</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">🤩</div>
              <div className="font-bold">8</div>
              <div className="text-xs text-gray-600">333</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">🥳</div>
              <div className="font-bold">9</div>
              <div className="text-xs text-gray-600">222</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-lg mb-1">😍</div>
              <div className="font-bold">10</div>
              <div className="text-xs text-gray-600">111</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Form */}
      {isAdding && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                placeholder="e.g., How satisfied are you with your work environment?"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={currentQuestion.description}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional context or instructions for the question"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={currentQuestion.category}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="required"
                  checked={currentQuestion.required}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="required">Required question</Label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleAddQuestion} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              <Button
                onClick={() => setIsAdding(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Survey Questions ({questions.length})
          </h3>
          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          )}
        </div>

        {questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
                <p className="text-sm">Start building your photo-based survey by adding questions</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge variant="secondary">{question.category}</Badge>
                        {question.required && (
                          <Badge variant="destructive">Required</Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {question.question}
                      </h4>
                      {question.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {question.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Users will select from 11 emoji photos (0-10 scale)
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRemoveQuestion(question.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoQuestionBuilder;
