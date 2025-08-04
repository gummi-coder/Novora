import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2,
  Calendar,
  BarChart3,
  Users,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'engagement' | 'satisfaction' | 'participation' | 'improvement' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  progress: number;
  createdAt: string;
  teamId?: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  dueDate: string;
}

const GoalTrackingDashboard = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Improve Team Engagement",
      description: "Increase overall team engagement score by 15%",
      category: "engagement",
      targetValue: 85,
      currentValue: 72,
      unit: "%",
      deadline: "2024-03-31",
      status: "on_track",
      progress: 72,
      createdAt: "2024-01-01T00:00:00Z",
      milestones: [
        { id: "1-1", title: "Reach 75%", targetValue: 75, currentValue: 72, completed: false, dueDate: "2024-02-15" },
        { id: "1-2", title: "Reach 80%", targetValue: 80, currentValue: 72, completed: false, dueDate: "2024-03-01" },
        { id: "1-3", title: "Reach 85%", targetValue: 85, currentValue: 72, completed: false, dueDate: "2024-03-31" }
      ]
    },
    {
      id: "2",
      title: "Increase Survey Participation",
      description: "Achieve 90% survey participation rate across all teams",
      category: "participation",
      targetValue: 90,
      currentValue: 78,
      unit: "%",
      deadline: "2024-04-30",
      status: "at_risk",
      progress: 78,
      createdAt: "2024-01-15T00:00:00Z",
      milestones: [
        { id: "2-1", title: "Reach 80%", targetValue: 80, currentValue: 78, completed: false, dueDate: "2024-03-15" },
        { id: "2-2", title: "Reach 85%", targetValue: 85, currentValue: 78, completed: false, dueDate: "2024-04-15" },
        { id: "2-3", title: "Reach 90%", targetValue: 90, currentValue: 78, completed: false, dueDate: "2024-04-30" }
      ]
    },
    {
      id: "3",
      title: "Reduce Response Time",
      description: "Decrease average response time to surveys to under 2 days",
      category: "improvement",
      targetValue: 2,
      currentValue: 3.5,
      unit: "days",
      deadline: "2024-05-31",
      status: "behind",
      progress: 57,
      createdAt: "2024-01-20T00:00:00Z",
      milestones: [
        { id: "3-1", title: "Reach 3 days", targetValue: 3, currentValue: 3.5, completed: false, dueDate: "2024-03-31" },
        { id: "3-2", title: "Reach 2.5 days", targetValue: 2.5, currentValue: 3.5, completed: false, dueDate: "2024-04-30" },
        { id: "3-3", title: "Reach 2 days", targetValue: 2, currentValue: 3.5, completed: false, dueDate: "2024-05-31" }
      ]
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "engagement" as Goal['category'],
    targetValue: 0,
    unit: "%",
    deadline: "",
    teamId: ""
  });

  const categories = [
    { value: 'engagement', label: 'Team Engagement', icon: Users },
    { value: 'satisfaction', label: 'Satisfaction Score', icon: Star },
    { value: 'participation', label: 'Participation Rate', icon: BarChart3 },
    { value: 'improvement', label: 'Process Improvement', icon: TrendingUp },
    { value: 'custom', label: 'Custom Goal', icon: Target }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'behind': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <TrendingUp className="h-4 w-4" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4" />;
      case 'behind': return <TrendingDown className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDaysLeft = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || formData.targetValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingGoal) {
        const response = await api.updateGoal(editingGoal.id, formData);
        setGoals(prev => prev.map(goal => 
          goal.id === editingGoal.id ? { ...goal, ...response } : goal
        ));
        toast({
          title: "Goal Updated",
          description: "Your goal has been updated successfully.",
        });
      } else {
        const response = await api.createGoal(formData);
        const newGoal: Goal = {
          id: response.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          targetValue: formData.targetValue,
          currentValue: 0,
          unit: formData.unit,
          deadline: formData.deadline,
          status: 'on_track',
          progress: 0,
          createdAt: new Date().toISOString(),
          teamId: formData.teamId || undefined,
          milestones: []
        };
        setGoals(prev => [newGoal, ...prev]);
        toast({
          title: "Goal Created",
          description: "Your new goal has been created successfully.",
        });
      }

      setFormData({ title: "", description: "", category: "engagement", targetValue: 0, unit: "%", deadline: "", teamId: "" });
      setShowForm(false);
      setEditingGoal(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await api.deleteGoal(goalId);
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast({
        title: "Goal Deleted",
        description: "Goal has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.targetValue,
      unit: goal.unit,
      deadline: goal.deadline,
      teamId: goal.teamId || ""
    });
    setShowForm(true);
  };

  const overallProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length 
    : 0;

  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const atRiskGoals = goals.filter(goal => goal.status === 'at_risk' || goal.status === 'behind').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Goal Tracking Dashboard
        </CardTitle>
        <CardDescription>
          Set and track improvement goals for your teams and organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{goals.length}</div>
            <div className="text-sm text-gray-600">Active Goals</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{atRiskGoals}</div>
            <div className="text-sm text-gray-600">At Risk</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>

        {/* Create/Edit Goal Form */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setEditingGoal(null);
                  setFormData({ title: "", description: "", category: "engagement", targetValue: 0, unit: "%", deadline: "", teamId: "" });
                }
              }}
            >
              {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showForm ? 'Cancel' : 'New Goal'}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Improve Team Engagement"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: Goal['category']) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center">
                            <category.icon className="h-4 w-4 mr-2" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you want to achieve..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="targetValue">Target Value *</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="85"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">Percentage (%)</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="responses">Responses</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoal(null);
                    setFormData({ title: "", description: "", category: "engagement", targetValue: 0, unit: "%", deadline: "", teamId: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Goals List */}
        <div>
          <h3 className="font-medium mb-4">Your Goals</h3>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge className={getStatusColor(goal.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(goal.status)}
                          <span>{goal.status.replace('_', ' ')}</span>
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress: {goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                        <span>{Math.round(goal.progress)}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    {/* Goal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Deadline: {formatDate(goal.deadline)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{calculateDaysLeft(goal.deadline)} days left</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <span>Category: {categories.find(c => c.value === goal.category)?.label}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="text-sm font-medium mb-2">Milestones</h5>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            {milestone.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-gray-300 rounded-full mr-2" />
                            )}
                            <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                              {milestone.title}
                            </span>
                          </div>
                          <span className="text-gray-500">{formatDate(milestone.dueDate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalTrackingDashboard; 