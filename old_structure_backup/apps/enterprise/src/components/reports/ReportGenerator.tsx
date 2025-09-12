import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, BarChart2, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const reportSections: ReportSection[] = [
  {
    id: "business-overview",
    title: "Business Overview",
    description: "Key business metrics and performance indicators",
    icon: <BarChart2 className="h-4 w-4" />
  },
  {
    id: "customer-analytics",
    title: "Customer Analytics",
    description: "Customer behavior and engagement metrics",
    icon: <Users className="h-4 w-4" />
  },
  {
    id: "growth-metrics",
    title: "Growth Metrics",
    description: "Revenue and growth analysis",
    icon: <TrendingUp className="h-4 w-4" />
  }
];

export const ReportGenerator: React.FC = () => {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [reportName, setReportName] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const { toast } = useToast();

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleGenerateReport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No sections selected",
        description: "Please select at least one section for the report.",
        variant: "destructive"
      });
      return;
    }

    if (!reportName) {
      toast({
        title: "Report name required",
        description: "Please enter a name for your report.",
        variant: "destructive"
      });
      return;
    }

    // Simulate report generation
    toast({
      title: "Generating Report",
      description: "Your report is being generated. This may take a few moments.",
    });

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Report Generated",
      description: "Your report has been generated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="Enter report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-4">
                <DatePicker
                  date={dateRange.from}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  placeholder="From"
                />
                <DatePicker
                  date={dateRange.to}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                  placeholder="To"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Report Format</Label>
              <Select value={format} onValueChange={(value: "pdf" | "excel" | "csv") => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Report Sections</Label>
              <div className="grid gap-4">
                {reportSections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-4">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                    />
                    <div className="flex items-center space-x-2">
                      {section.icon}
                      <div>
                        <Label htmlFor={section.id} className="font-medium">
                          {section.title}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleGenerateReport}
            disabled={selectedSections.length === 0 || !reportName}
          >
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 