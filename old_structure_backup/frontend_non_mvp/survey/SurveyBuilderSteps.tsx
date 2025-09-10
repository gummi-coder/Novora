import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Globe,
  Palette,
  Mail,
  Share2,
  Link,
  Copy,
  CheckCircle,
  Settings,
  Languages,
  Image,
  Upload,
  Trash2,
  RotateCcw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SurveyBuilderStepsProps {
  surveyData: any;
  onSave: (data: any) => void;
  onSend: (data: any) => void;
  onBack: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    id: 4,
    title: "Language & Branding",
    description: "Customize language and branding",
    icon: Globe
  },
  {
    id: 5,
    title: "Preview",
    description: "Preview your survey",
    icon: Eye
  },
  {
    id: 6,
    title: "Distribution",
    description: "Set up distribution channels",
    icon: Share2
  },
  {
    id: 7,
    title: "Save & Send",
    description: "Save and send your survey",
    icon: CheckCircle
  }
];

const SurveyBuilderSteps: React.FC<SurveyBuilderStepsProps> = ({
  surveyData,
  onSave,
  onSend,
  onBack
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(4);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  
  // Step 4: Language & Branding
  const [language, setLanguage] = useState('en');
  const [branding, setBranding] = useState({
    logo: null as File | null,
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    customCSS: '',
    companyName: '',
    surveyTitle: surveyData.title || '',
    surveyDescription: surveyData.description || ''
  });

  // Step 6: Distribution
  const [distribution, setDistribution] = useState({
    channels: ['email'] as string[],
    emailTemplate: '',
    reminderFrequency: 'weekly',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    maxResponses: 1000,
    allowAnonymous: true
  });

  // Step 7: Save & Send
  const [saveData, setSaveData] = useState({
    saveAsTemplate: false,
    templateName: '',
    sendImmediately: false,
    scheduleSend: false,
    scheduledDate: new Date()
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'fr', name: 'French', flag: '🇫🇷' }
  ];

  const distributionChannels = [
    { id: 'email', name: 'Email', icon: Mail, description: 'Send via email' },
    { id: 'link', name: 'Direct Link', icon: Link, description: 'Shareable link' },
    { id: 'qr', name: 'QR Code', icon: Share2, description: 'QR code for mobile' },
    { id: 'embed', name: 'Embed', icon: Settings, description: 'Embed in website' }
  ];

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const dataToSave = {
      ...surveyData,
      language,
      branding,
      distribution,
      saveData
    };
    onSave(dataToSave);
    setShowSaveDialog(false);
    toast({
      title: "Survey Saved",
      description: "Your survey has been saved successfully.",
    });
  };

  const handleSend = () => {
    const dataToSend = {
      ...surveyData,
      language,
      branding,
      distribution,
      saveData
    };
    onSend(dataToSend);
    setShowSendDialog(false);
    toast({
      title: "Survey Sent",
      description: "Your survey has been sent successfully.",
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBranding(prev => ({ ...prev, logo: file }));
    }
  };

  const copySurveyLink = () => {
    const link = `https://novora.com/survey/${surveyData.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Survey link copied to clipboard.",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Languages className="h-5 w-5" />
                    <span>Language Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Survey Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center space-x-2">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Branding Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Branding</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="flex-1"
                      />
                      {branding.logo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBranding(prev => ({ ...prev, logo: null }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={branding.companyName}
                      onChange={(e) => setBranding(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Survey Content */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Survey Title</Label>
                  <Input
                    value={branding.surveyTitle}
                    onChange={(e) => setBranding(prev => ({ ...prev, surveyTitle: e.target.value }))}
                    placeholder="Enter survey title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Survey Description</Label>
                  <Textarea
                    value={branding.surveyDescription}
                    onChange={(e) => setBranding(prev => ({ ...prev, surveyDescription: e.target.value }))}
                    placeholder="Enter survey description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Preview Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Preview Survey</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('desktop')}
                    className="flex items-center space-x-2"
                  >
                    <Monitor className="h-4 w-4" />
                    <span>Desktop</span>
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('mobile')}
                    className="flex items-center space-x-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Full Preview</span>
                  </Button>
                </div>

                {/* Preview Frame */}
                <div className={cn(
                  "border-2 border-gray-200 rounded-lg bg-white overflow-hidden",
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                )}>
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {branding.logo && (
                          <img
                            src={URL.createObjectURL(branding.logo)}
                            alt="Logo"
                            className="h-8 w-8 object-contain"
                          />
                        )}
                        <span className="font-semibold">{branding.companyName || 'Company Name'}</span>
                      </div>
                      <Badge variant="secondary">Preview</Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2" style={{ color: branding.primaryColor }}>
                      {branding.surveyTitle || 'Survey Title'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                      {branding.surveyDescription || 'Survey description goes here...'}
                    </p>
                    
                    {/* Sample Questions */}
                    <div className="space-y-4">
                      {surveyData.questions?.slice(0, 2).map((question: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="font-medium mb-3">{question.text}</h3>
                          <div className="space-y-2">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                              <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={rating}
                                  className="text-blue-600"
                                />
                                <span className="text-sm">{rating}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {/* Distribution Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="h-5 w-5" />
                  <span>Distribution Channels</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {distributionChannels.map((channel) => {
                    const Icon = channel.icon;
                    const isSelected = distribution.channels.includes(channel.id);
                    
                    return (
                      <div
                        key={channel.id}
                        className={cn(
                          "border-2 rounded-lg p-4 cursor-pointer transition-all",
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => {
                          if (isSelected) {
                            setDistribution(prev => ({
                              ...prev,
                              channels: prev.channels.filter(c => c !== channel.id)
                            }));
                          } else {
                            setDistribution(prev => ({
                              ...prev,
                              channels: [...prev.channels, channel.id]
                            }));
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <h3 className="font-medium">{channel.name}</h3>
                            <p className="text-sm text-gray-500">{channel.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Distribution Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={distribution.startDate.toISOString().split('T')[0]}
                      onChange={(e) => setDistribution(prev => ({
                        ...prev,
                        startDate: new Date(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={distribution.endDate.toISOString().split('T')[0]}
                      onChange={(e) => setDistribution(prev => ({
                        ...prev,
                        endDate: new Date(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reminder Frequency</Label>
                    <Select
                      value={distribution.reminderFrequency}
                      onValueChange={(value) => setDistribution(prev => ({
                        ...prev,
                        reminderFrequency: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Responses</Label>
                    <Input
                      type="number"
                      value={distribution.maxResponses}
                      onChange={(e) => setDistribution(prev => ({
                        ...prev,
                        maxResponses: parseInt(e.target.value)
                      }))}
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Template (if email is selected)</Label>
                  <Textarea
                    value={distribution.emailTemplate}
                    onChange={(e) => setDistribution(prev => ({
                      ...prev,
                      emailTemplate: e.target.value
                    }))}
                    placeholder="Customize your email template..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            {/* Save Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Save className="h-5 w-5" />
                  <span>Save Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="saveAsTemplate"
                    checked={saveData.saveAsTemplate}
                    onChange={(e) => setSaveData(prev => ({
                      ...prev,
                      saveAsTemplate: e.target.checked
                    }))}
                  />
                  <Label htmlFor="saveAsTemplate">Save as template for future use</Label>
                </div>

                {saveData.saveAsTemplate && (
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={saveData.templateName}
                      onChange={(e) => setSaveData(prev => ({
                        ...prev,
                        templateName: e.target.value
                      }))}
                      placeholder="Enter template name"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Send Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="sendImmediately"
                      name="sendOption"
                      checked={saveData.sendImmediately}
                      onChange={() => setSaveData(prev => ({
                        ...prev,
                        sendImmediately: true,
                        scheduleSend: false
                      }))}
                    />
                    <Label htmlFor="sendImmediately">Send immediately</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="scheduleSend"
                      name="sendOption"
                      checked={saveData.scheduleSend}
                      onChange={() => setSaveData(prev => ({
                        ...prev,
                        sendImmediately: false,
                        scheduleSend: true
                      }))}
                    />
                    <Label htmlFor="scheduleSend">Schedule for later</Label>
                  </div>
                </div>

                {saveData.scheduleSend && (
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input
                      type="datetime-local"
                      value={saveData.scheduledDate.toISOString().slice(0, 16)}
                      onChange={(e) => setSaveData(prev => ({
                        ...prev,
                        scheduledDate: new Date(e.target.value)
                      }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Survey Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {branding.surveyTitle}</p>
                  <p><strong>Questions:</strong> {surveyData.questions?.length || 0}</p>
                  <p><strong>Language:</strong> {languages.find(l => l.code === language)?.name}</p>
                  <p><strong>Distribution:</strong> {distribution.channels.join(', ')}</p>
                  <p><strong>Duration:</strong> {Math.ceil((distribution.endDate.getTime() - distribution.startDate.getTime()) / (1000 * 60 * 60 * 24))} days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2",
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Step {currentStep} of 7
        </div>
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {steps.find(s => s.id === currentStep)?.title}
        </h2>
        <p className="text-gray-600 mt-2">
          {steps.find(s => s.id === currentStep)?.description}
        </p>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {currentStep > 4 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          
          {currentStep < 7 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => setShowSendDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Send Survey
            </Button>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Survey</DialogTitle>
            <DialogDescription>
              Save your survey as a draft or template for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="saveAsTemplate"
                checked={saveData.saveAsTemplate}
                onChange={(e) => setSaveData(prev => ({
                  ...prev,
                  saveAsTemplate: e.target.checked
                }))}
              />
              <Label htmlFor="saveAsTemplate">Save as template</Label>
            </div>
            {saveData.saveAsTemplate && (
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={saveData.templateName}
                  onChange={(e) => setSaveData(prev => ({
                    ...prev,
                    templateName: e.target.value
                  }))}
                  placeholder="Enter template name"
                />
              </div>
            )}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Survey</DialogTitle>
            <DialogDescription>
              Are you ready to send your survey? This will make it available to respondents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Survey will be sent via:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {distribution.channels.map(channel => (
                  <li key={channel} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{distributionChannels.find(c => c.id === channel)?.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Send Survey
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Survey Preview</DialogTitle>
            <DialogDescription>
              Preview how your survey will appear to respondents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
            
            <div className={cn(
              "border-2 border-gray-200 rounded-lg bg-white overflow-hidden",
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            )}>
              {/* Preview content would go here - same as in step 5 */}
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {branding.logo && (
                      <img
                        src={URL.createObjectURL(branding.logo)}
                        alt="Logo"
                        className="h-8 w-8 object-contain"
                      />
                    )}
                    <span className="font-semibold">{branding.companyName || 'Company Name'}</span>
                  </div>
                  <Badge variant="secondary">Preview</Badge>
                </div>
              </div>
              
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2" style={{ color: branding.primaryColor }}>
                  {branding.surveyTitle || 'Survey Title'}
                </h1>
                <p className="text-gray-600 mb-6">
                  {branding.surveyDescription || 'Survey description goes here...'}
                </p>
                
                <div className="space-y-4">
                  {surveyData.questions?.map((question: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">{question.text}</h3>
                      <div className="space-y-2">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                          <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`preview-question-${index}`}
                              value={rating}
                              className="text-blue-600"
                            />
                            <span className="text-sm">{rating}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SurveyBuilderSteps;
