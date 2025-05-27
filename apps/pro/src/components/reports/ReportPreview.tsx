
import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { File, FileText } from "lucide-react";

interface ReportPreviewProps {
  reportId: string;
  formats: string[];
  onDownload?: (reportId: string, format: string) => void;
}

export function ReportPreview({ reportId, formats, onDownload }: ReportPreviewProps) {
  const [activeTab, setActiveTab] = useState(formats.includes('pdf') ? 'pdf' : formats[0] || 'pdf');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for CSV preview
  const mockCsvData = [
    ['Employee ID', 'Department', 'eNPS Score', 'Job Satisfaction'],
    ['EMP001', 'Engineering', '9', '8.5'],
    ['EMP002', 'Sales', '7', '7.2'],
    ['EMP003', 'Marketing', '8', '8.1'],
    ['EMP004', 'HR', '9', '8.7'],
    ['...', '...', '...', '...'],
  ];

  const handleDownload = (format: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      if (onDownload) {
        onDownload(reportId, format);
      }
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Preview</CardTitle>
        <CardDescription>Preview the report before downloading</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            {formats.includes('pdf') && (
              <TabsTrigger value="pdf" disabled={!formats.includes('pdf')}>
                <File className="h-4 w-4 mr-2" />
                PDF
              </TabsTrigger>
            )}
            {formats.includes('csv') && (
              <TabsTrigger value="csv" disabled={!formats.includes('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* PDF Preview */}
          {formats.includes('pdf') && (
            <TabsContent value="pdf" className="space-y-4">
              <div className="aspect-[8.5/11] border rounded-md overflow-hidden bg-muted/20">
                {/* This would be an iframe or image displaying PDF preview in a real app */}
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">PDF Preview</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      The PDF report includes charts, tables, and analysis of selected metrics.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleDownload('pdf')} 
                disabled={isLoading}
              >
                {isLoading ? 'Downloading...' : 'Download PDF'}
              </Button>
            </TabsContent>
          )}
          
          {/* CSV Preview */}
          {formats.includes('csv') && (
            <TabsContent value="csv" className="space-y-4">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {mockCsvData[0].map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCsvData.slice(1).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleDownload('csv')} 
                disabled={isLoading}
              >
                {isLoading ? 'Downloading...' : 'Download CSV'}
              </Button>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
