import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Filter, Eye, EyeOff } from 'lucide-react';
import { QuestionBankService, Metric, Question, MetricWithQuestions } from '@/services/questionBank';

interface QuestionBankProps {
  onQuestionSelect: (question: Question) => void;
  selectedQuestions?: Question[];
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  onQuestionSelect,
  selectedQuestions = []
}) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricsWithQuestions, setMetricsWithQuestions] = useState<MetricWithQuestions[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSensitive, setShowSensitive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadQuestionBank();
  }, []);

  const loadQuestionBank = async () => {
    try {
      setLoading(true);
      const allMetrics = await QuestionBankService.getMetrics();
      setMetrics(allMetrics);
      
      // Load questions for each metric
      const metricsWithQs = await Promise.all(
        allMetrics.map(metric => QuestionBankService.getMetric(metric.id))
      );
      setMetricsWithQuestions(metricsWithQs);
    } catch (error) {
      console.error('Error loading question bank:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = metricsWithQuestions.filter(metric => {
    // Filter by category
    if (selectedCategory !== 'all' && metric.category !== selectedCategory) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const matchesMetric = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           metric.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesQuestions = metric.questions.some(q => 
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesMetric || matchesQuestions;
    }
    
    return true;
  });

  const filteredQuestions = filteredMetrics.flatMap(metric => 
    metric.questions.filter(question => {
      // Filter sensitive questions
      if (!showSensitive && question.sensitive) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        return question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      return true;
    })
  );

  const isQuestionSelected = (question: Question) => {
    return selectedQuestions.some(q => q.id === question.id);
  };

  const handleQuestionSelect = (question: Question) => {
    if (!isQuestionSelected(question)) {
      onQuestionSelect(question);
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'job_satisfaction', name: 'Job Satisfaction' },
    { id: 'enps', name: 'eNPS' },
    { id: 'manager_relationship', name: 'Manager Relationship' },
    { id: 'peer_collaboration', name: 'Peer Collaboration' },
    { id: 'recognition', name: 'Recognition' },
    { id: 'career_growth', name: 'Career Growth' },
    { id: 'value_alignment', name: 'Value Alignment' },
    { id: 'communication', name: 'Communication' },
    { id: 'work_environment', name: 'Work Environment' },
    { id: 'health_wellness', name: 'Health & Wellness' },
    { id: 'engagement', name: 'Engagement' }
  ];

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Question Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading question bank...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Question Bank
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
            >
              {showSensitive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showSensitive ? 'Hide' : 'Show'} Sensitive
            </Button>
          </div>
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search questions or metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    metric={metrics.find(m => m.id === question.metric_id)!}
                    isSelected={isQuestionSelected(question)}
                    onSelect={() => handleQuestionSelect(question)}
                  />
                ))}
                {filteredQuestions.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No questions found matching your criteria.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="by-category" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-6">
                {filteredMetrics.map((metric) => (
                  <div key={metric.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{metric.name}</h4>
                      <Badge variant={metric.is_core ? "default" : "secondary"}>
                        {metric.is_core ? "Core" : "Optional"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                    <div className="space-y-2">
                      {metric.questions
                        .filter(q => !searchTerm || q.question_text.toLowerCase().includes(searchTerm.toLowerCase()))
                        .filter(q => showSensitive || !q.sensitive)
                        .map((question) => (
                          <QuestionCard
                            key={question.id}
                            question={question}
                            metric={metric}
                            isSelected={isQuestionSelected(question)}
                            onSelect={() => handleQuestionSelect(question)}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface QuestionCardProps {
  question: Question;
  metric: Metric;
  isSelected: boolean;
  onSelect: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  metric,
  isSelected,
  onSelect
}) => {
  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {question.question_text}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {metric.name}
              </Badge>
              {question.sensitive && (
                <Badge variant="destructive" className="text-xs">
                  Sensitive
                </Badge>
              )}
              {question.reverse_scored && (
                <Badge variant="secondary" className="text-xs">
                  Reverse Scored
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="ml-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
