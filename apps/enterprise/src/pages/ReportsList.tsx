import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for saved reports
const savedReports = [
  {
    id: "1",
    name: "Q1 Business Overview",
    date: "2024-03-15",
    format: "pdf",
    sections: ["business-overview", "growth-metrics"],
    size: "2.4 MB"
  },
  {
    id: "2",
    name: "Customer Analytics Report",
    date: "2024-03-10",
    format: "excel",
    sections: ["customer-analytics"],
    size: "1.8 MB"
  },
  {
    id: "3",
    name: "Annual Growth Report",
    date: "2024-02-28",
    format: "pdf",
    sections: ["growth-metrics", "business-overview"],
    size: "3.2 MB"
  }
];

const ReportsList: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generate and manage your business reports</p>
          </div>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList>
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <ReportGenerator />
          </TabsContent>

          <TabsContent value="saved">
            <div className="grid gap-4">
              {savedReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{report.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Generated on {report.date} • {report.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
    </DashboardLayout>
  );
};

export default ReportsList;
