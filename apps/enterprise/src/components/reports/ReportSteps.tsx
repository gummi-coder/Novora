
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { DatePicker } from "@/components/reports/DatePicker";
import { Switch } from "@/components/ui/switch";

// Mock data
const mockSurveys = [
  { id: "1", name: "Employee Satisfaction Survey" },
  { id: "2", name: "eNPS Survey" },
  { id: "3", name: "Work Environment Survey" },
  { id: "4", name: "Manager Effectiveness Survey" },
  { id: "5", name: "Remote Work Experience Survey" },
];

const mockMetrics = [
  { id: "1", name: "eNPS" },
  { id: "2", name: "Job Satisfaction" },
  { id: "3", name: "Participation Rate" },
  { id: "4", name: "Team Engagement" },
  { id: "5", name: "Management Effectiveness" },
];

const mockDepartments = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Sales" },
  { id: "3", name: "Marketing" },
  { id: "4", name: "HR" },
  { id: "5", name: "Customer Support" },
];

const mockUsers = [
  { id: "1", name: "John Doe", role: "Admin" },
  { id: "2", name: "Jane Smith", role: "Team Lead" },
  { id: "3", name: "Mike Johnson", role: "HR Manager" },
  { id: "4", name: "Sara Wilson", role: "Department Head" },
];

// Step 1: Report Type & Scope
export const Step1TypeAndScope = ({ data, updateData }) => {
  const handleSurveyChange = (surveyId: string, isChecked: boolean) => {
    const updatedSurveys = isChecked
      ? [...data.surveys, surveyId]
      : data.surveys.filter(id => id !== surveyId);
    
    updateData({ surveys: updatedSurveys });
  };

  const handleMetricChange = (metricId: string, isChecked: boolean) => {
    const updatedMetrics = isChecked
      ? [...data.metrics, metricId]
      : data.metrics.filter(id => id !== metricId);
    
    updateData({ metrics: updatedMetrics });
  };

  const handleDateRangePreset = (preset: string) => {
    const now = new Date();
    let from = new Date();
    let to = new Date();
    
    switch (preset) {
      case 'lastMonth':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'lastQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3 - 3, 1);
        to = new Date(now.getFullYear(), quarter * 3, 0);
        break;
      case 'lastYear':
        from = new Date(now.getFullYear() - 1, 0, 1);
        to = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
    }
    
    updateData({ dateRange: { from, to } });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reportType">Report Type</Label>
        <Select 
          value={data.reportType} 
          onValueChange={(value) => updateData({ reportType: value })}
        >
          <SelectTrigger id="reportType">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">Overall Summary (All Surveys)</SelectItem>
            <SelectItem value="department">Department-specific</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {data.reportType && (
        <>
          <div className="space-y-3">
            <Label>Choose Survey(s)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mockSurveys.map((survey) => (
                <div key={survey.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`survey-${survey.id}`} 
                    checked={data.surveys.includes(survey.id)}
                    onCheckedChange={(checked) => 
                      handleSurveyChange(survey.id, checked === true)
                    }
                  />
                  <label
                    htmlFor={`survey-${survey.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {survey.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Choose Metric Categories</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mockMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`metric-${metric.id}`} 
                    checked={data.metrics.includes(metric.id)}
                    onCheckedChange={(checked) => 
                      handleMetricChange(metric.id, checked === true)
                    }
                  />
                  <label
                    htmlFor={`metric-${metric.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {metric.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleDateRangePreset('lastMonth')}
              >
                Last Month
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleDateRangePreset('lastQuarter')}
              >
                Last Quarter
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleDateRangePreset('lastYear')}
              >
                Last Year
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => updateData({ 
                  dateRange: { from: null, to: null } 
                })}
              >
                Clear
              </Button>
            </div>
            <DateRangePicker 
              date={data.dateRange}
              setDate={(range) => updateData({ dateRange: range })}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Step 2: Format & Filters
export const Step2FormatAndFilters = ({ data, updateData }) => {
  const handleFormatChange = (format: string, isChecked: boolean) => {
    const updatedFormats = isChecked
      ? [...data.formats, format]
      : data.formats.filter(f => f !== format);
    
    updateData({ formats: updatedFormats });
  };

  const handleDepartmentChange = (deptId: string, isChecked: boolean) => {
    const updatedDepartments = isChecked
      ? [...data.departments, deptId]
      : data.departments.filter(id => id !== deptId);
    
    updateData({ departments: updatedDepartments });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Output Format</Label>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="format-pdf" 
              checked={data.formats.includes('pdf')}
              onCheckedChange={(checked) => 
                handleFormatChange('pdf', checked === true)
              }
            />
            <label
              htmlFor="format-pdf"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              PDF
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="format-csv" 
              checked={data.formats.includes('csv')}
              onCheckedChange={(checked) => 
                handleFormatChange('csv', checked === true)
              }
            />
            <label
              htmlFor="format-csv"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              CSV
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="format-both" 
              checked={
                data.formats.includes('pdf') && 
                data.formats.includes('csv')
              }
              onCheckedChange={(checked) => {
                if (checked) {
                  updateData({ formats: ['pdf', 'csv'] });
                } else {
                  updateData({ formats: [] });
                }
              }}
            />
            <label
              htmlFor="format-both"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Both (ZIP)
            </label>
          </div>
        </div>
      </div>
      
      {data.reportType === 'overall' && (
        <div className="space-y-3">
          <Label>Department/Team Filter</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {mockDepartments.map((dept) => (
              <div key={dept.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`dept-${dept.id}`} 
                  checked={data.departments.includes(dept.id)}
                  onCheckedChange={(checked) => 
                    handleDepartmentChange(dept.id, checked === true)
                  }
                />
                <label
                  htmlFor={`dept-${dept.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {dept.name}
                </label>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => updateData({ 
                departments: mockDepartments.map(d => d.id) 
              })}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              onClick={() => updateData({ departments: [] })}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="anonymize" 
          checked={data.anonymize}
          onCheckedChange={(checked) => updateData({ anonymize: checked })}
        />
        <Label htmlFor="anonymize">
          Anonymize Individual Scores
        </Label>
      </div>
    </div>
  );
};

// Step 3: Schedule & Delivery
export const Step3ScheduleAndDelivery = ({ data, updateData }) => {
  const handleNotificationChange = (userId: string, isChecked: boolean) => {
    const updatedNotifications = isChecked
      ? [...data.notifications, userId]
      : data.notifications.filter(id => id !== userId);
    
    updateData({ notifications: updatedNotifications });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Schedule Type</Label>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="schedule-one-off" 
              checked={data.scheduleType === 'one-off'}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateData({ scheduleType: 'one-off' });
                }
              }}
            />
            <label
              htmlFor="schedule-one-off"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              One-off Report
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="schedule-recurring" 
              checked={data.scheduleType === 'recurring'}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateData({ scheduleType: 'recurring' });
                }
              }}
            />
            <label
              htmlFor="schedule-recurring"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Recurring Report
            </label>
          </div>
        </div>
      </div>
      
      {data.scheduleType === 'one-off' ? (
        <div className="space-y-3">
          <Label>Schedule Date</Label>
          <DatePicker 
            date={data.scheduleDate}
            setDate={(date) => updateData({ scheduleDate: date })}
          />
        </div>
      ) : data.scheduleType === 'recurring' && (
        <div className="space-y-3">
          <Label>Recurring Schedule</Label>
          <Select 
            value={data.recurringType} 
            onValueChange={(value) => updateData({ recurringType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-3">
        <Label>Email Notifications</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {mockUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`user-${user.id}`} 
                checked={data.notifications.includes(user.id)}
                onCheckedChange={(checked) => 
                  handleNotificationChange(user.id, checked === true)
                }
              />
              <label
                htmlFor={`user-${user.id}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {user.name} <span className="text-muted-foreground">({user.role})</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Step 4: Review & Generate
export const Step4ReviewAndGenerate = ({ data, updateData }) => {
  const getSurveyNames = () => {
    return data.surveys.map(id => 
      mockSurveys.find(s => s.id === id)?.name
    ).filter(Boolean).join(', ');
  };
  
  const getMetricNames = () => {
    return data.metrics.map(id => 
      mockMetrics.find(m => m.id === id)?.name
    ).filter(Boolean).join(', ');
  };
  
  const getDepartmentNames = () => {
    return data.departments.map(id => 
      mockDepartments.find(d => d.id === id)?.name
    ).filter(Boolean).join(', ');
  };
  
  const getNotificationNames = () => {
    return data.notifications.map(id => 
      mockUsers.find(u => u.id === id)?.name
    ).filter(Boolean).join(', ');
  };
  
  const getReportTypeName = () => {
    switch(data.reportType) {
      case 'overall': return 'Overall Summary';
      case 'department': return 'Department-specific';
      case 'custom': return 'Custom';
      default: return '';
    }
  };
  
  const getScheduleTypeName = () => {
    if (data.scheduleType === 'one-off') {
      return 'One-off';
    } else if (data.scheduleType === 'recurring') {
      return `Recurring (${data.recurringType})`;
    } else {
      return '';
    }
  };
  
  const getDateRangeText = () => {
    if (data.dateRange.from && data.dateRange.to) {
      const fromDate = new Date(data.dateRange.from);
      const toDate = new Date(data.dateRange.to);
      return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
    }
    return 'Not specified';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="reportName">Report Name</Label>
        <Input 
          id="reportName"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="Enter a name for this report"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span>{getReportTypeName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Surveys:</span>
                <span className="text-right">{getSurveyNames() || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Metrics:</span>
                <span className="text-right">{getMetricNames() || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date Range:</span>
                <span>{getDateRangeText()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Format:</span>
                <span className="uppercase">{data.formats.join(', ') || 'None'}</span>
              </div>
              {data.reportType === 'overall' && (
                <div className="flex justify-between">
                  <span className="font-medium">Departments:</span>
                  <span className="text-right">{getDepartmentNames() || 'All'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Anonymized:</span>
                <span>{data.anonymize ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Schedule Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Schedule:</span>
                <span>{getScheduleTypeName()}</span>
              </div>
              {data.scheduleType === 'one-off' && data.scheduleDate && (
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{new Date(data.scheduleDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Notifications:</span>
                <span className="text-right">{getNotificationNames() || 'None'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Preview area - In a real implementation, this would show actual chart previews */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>This is how your report will look like</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center bg-muted/20">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2" />
            <p>Report preview would be generated here</p>
            <p className="text-xs">(Charts, tables, and data visualizations)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
