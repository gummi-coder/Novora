
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, LineChart, Grid2X2, PlusCircle, Save } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// Mock saved dashboard templates
const savedTemplates = [
  { 
    id: "1", 
    name: "Team Lead Overview", 
    description: "Key metrics for team leads to monitor", 
    widgets: 4,
    lastEdited: "2025-05-01"
  },
  { 
    id: "2", 
    name: "HR Management", 
    description: "Focused on retention and satisfaction trends", 
    widgets: 6,
    lastEdited: "2025-04-20"
  },
  { 
    id: "3", 
    name: "Executive Summary", 
    description: "High-level overview of all key metrics", 
    widgets: 8,
    lastEdited: "2025-05-05"
  }
];

// Widget template options
const widgetTemplates = [
  {
    id: "widget-1",
    name: "eNPS Trend",
    type: "line-chart",
    icon: LineChart,
    description: "Line chart showing eNPS over time"
  },
  {
    id: "widget-2",
    name: "Department Satisfaction",
    type: "bar-chart",
    icon: BarChart3,
    description: "Bar chart comparing department satisfaction"
  },
  {
    id: "widget-3",
    name: "Response Rate",
    type: "gauge",
    icon: Grid2X2,
    description: "Gauge showing current response rate"
  },
  {
    id: "widget-4",
    name: "Engagement Heatmap",
    type: "heatmap",
    icon: Grid2X2,
    description: "Heatmap of engagement by department and time"
  },
  {
    id: "widget-5",
    name: "Benchmark Comparison",
    type: "bar-chart",
    icon: BarChart3,
    description: "Comparison against industry benchmarks"
  },
  {
    id: "widget-6",
    name: "Satisfaction Drivers",
    type: "table",
    icon: Grid2X2,
    description: "Table showing top satisfaction drivers"
  },
];

// Mock save dashboard function
const saveDashboardConfig = async (config) => {
  console.log("Saving dashboard config:", config);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, id: Date.now().toString() };
};

const CustomDashboard = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [dashboardName, setDashboardName] = useState("");
  const [dashboardDescription, setDashboardDescription] = useState("");
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  
  const saveMutation = useMutation({
    mutationFn: saveDashboardConfig,
    onSuccess: (data) => {
      toast({
        title: "Dashboard Saved",
        description: `${dashboardName} has been saved successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Dashboard",
        description: "There was a problem saving your dashboard.",
        variant: "destructive",
      });
    }
  });
  
  const handleAddWidget = (widget) => {
    setSelectedWidgets([...selectedWidgets, { ...widget, id: `${widget.id}-${Date.now()}` }]);
  };
  
  const handleRemoveWidget = (widgetId) => {
    setSelectedWidgets(selectedWidgets.filter(w => w.id !== widgetId));
  };
  
  const handleSaveDashboard = () => {
    if (!dashboardName) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for your dashboard.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedWidgets.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one widget to your dashboard.",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate({
      name: dashboardName,
      description: dashboardDescription,
      widgets: selectedWidgets.map(w => ({ type: w.type, id: w.id })),
    });
  };
  
  const handleLoadTemplate = (template) => {
    setActiveTab("create");
    setDashboardName(`${template.name} (Copy)`);
    setDashboardDescription(template.description);
    // In a real app, we would load the actual widgets from the template
    setSelectedWidgets(widgetTemplates.slice(0, template.widgets).map(w => ({ 
      ...w, 
      id: `${w.id}-${Date.now()}` 
    })));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Custom Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Build and save custom views of your engagement data
            </p>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full md:w-auto mt-4 md:mt-0"
          >
            <TabsList>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="templates">Saved Templates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Dashboard Name</label>
                <Input 
                  value={dashboardName} 
                  onChange={e => setDashboardName(e.target.value)}
                  placeholder="Enter a name for your dashboard"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input 
                  value={dashboardDescription} 
                  onChange={e => setDashboardDescription(e.target.value)}
                  placeholder="Optional description"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Available Widgets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {widgetTemplates.map((widget) => (
                      <div 
                        key={widget.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleAddWidget(widget)}
                      >
                        <div className="flex items-center">
                          <widget.icon className="h-5 w-5 text-primary mr-2" />
                          <div>
                            <div className="font-medium">{widget.name}</div>
                            <div className="text-xs text-muted-foreground">{widget.type}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Dashboard Layout</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedWidgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <PlusCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium">Add Widgets</h3>
                      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                        Click on widgets from the left panel to add them to your custom dashboard
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedWidgets.map(widget => (
                        <Card key={widget.id} className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => handleRemoveWidget(widget.id)}
                          >
                            &times;
                          </Button>
                          <CardHeader className="pb-2">
                            <div className="flex items-center">
                              <widget.icon className="h-4 w-4 text-primary mr-2" />
                              <CardTitle className="text-sm">{widget.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="h-24 bg-accent/50 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">{widget.description}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveDashboard} 
                    disabled={selectedWidgets.length === 0 || !dashboardName || saveMutation.isPending}
                    className="ml-auto"
                  >
                    {saveMutation.isPending ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Dashboard
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle>{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{template.widgets} widgets</span>
                    <span className="mx-2">•</span>
                    <span>Last edited {template.lastEdited}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => handleLoadTemplate(template)}>
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </div>
    </DashboardLayout>
  );
};

export default CustomDashboard;
