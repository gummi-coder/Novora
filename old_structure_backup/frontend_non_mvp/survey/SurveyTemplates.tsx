import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { surveyTemplates, SurveyTemplate } from "@/data/surveyTemplates";
import { autoPilotPlans, AutoPilotPlan } from "@/data/autoPilotPlans";
import { FileText, Calendar, Play, Pause, Settings } from "lucide-react";

const SurveyTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<AutoPilotPlan | null>(null);

  const handleUseTemplate = (template: SurveyTemplate) => {
    console.log('Using template:', template);
    // TODO: Navigate to survey builder with template
  };

  const handleActivatePlan = (plan: AutoPilotPlan) => {
    console.log('Activating plan:', plan);
    // TODO: Activate auto-pilot plan
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Templates & Auto-Pilot</h1>
        <p className="text-gray-600">Choose from pre-built templates or set up automated survey cycles</p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Survey Templates</span>
          </TabsTrigger>
          <TabsTrigger value="auto-pilot" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Auto-Pilot Plans</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveyTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary">{template.questions.length} Q</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Questions:</strong>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600">
                        {template.questions.slice(0, 3).map((question, index) => (
                          <li key={index} className="truncate">• {question.text}</li>
                        ))}
                        {template.questions.length > 3 && (
                          <li className="text-blue-600">+ {template.questions.length - 3} more questions</li>
                        )}
                      </ul>
                    </div>
                    <Button 
                      onClick={() => handleUseTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auto-pilot" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {autoPilotPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Schedule ({plan.duration} months):</strong>
                      <div className="mt-2 space-y-1">
                        {plan.schedule.slice(0, 3).map((schedule, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            Month {schedule.month}: {schedule.templateName}
                          </div>
                        ))}
                        {plan.schedule.length > 3 && (
                          <div className="text-xs text-blue-600">
                            + {plan.schedule.length - 3} more months
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleActivatePlan(plan)}
                        className="flex-1"
                        size="sm"
                        variant={plan.isActive ? "outline" : "default"}
                      >
                        {plan.isActive ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SurveyTemplates;
