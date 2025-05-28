import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportDataProps {
  data: any;
  title: string;
  filename?: string;
}

export function ExportData({ data, title, filename = "export" }: ExportDataProps) {
  const { toast } = useToast();
  const [format, setFormat] = React.useState("csv");

  const exportToCSV = () => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row: any) => headers.map(header => row[header]).join(","))
    ].join("\n");

    downloadFile(csvContent, `${filename}.csv`, "text/csv");
  };

  const exportToExcel = () => {
    // In a real implementation, you would use a library like xlsx
    // For now, we'll just show a toast
    toast({
      title: "Excel Export",
      description: "Excel export functionality will be implemented with xlsx library",
    });
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, "application/json");
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Data has been exported to ${filename}`,
    });
  };

  const handleExport = () => {
    switch (format) {
      case "csv":
        exportToCSV();
        break;
      case "excel":
        exportToExcel();
        break;
      case "json":
        exportToJSON();
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>CSV</span>
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel</span>
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  <span>JSON</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 