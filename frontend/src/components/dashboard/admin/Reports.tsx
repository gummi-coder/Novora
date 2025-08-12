import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText, 
  BarChart3, 
  Link, 
  CheckCircle, 
  Copy,
  ExternalLink
} from "lucide-react";

const Reports = () => {
  const [shareLink, setShareLink] = useState<string>("");
  const { toast } = useToast();

  const generateLink = () => {
    const link = `${window.location.origin}/reports/shared/${Math.random().toString(36).slice(2, 8)}`;
    setShareLink(link);
    toast({
      title: "Link Generated",
      description: "Share link has been created successfully!",
    });
  };

  const copyToClipboard = async () => {
    if (!shareLink) {
      toast({
        title: "No Link Available",
        description: "Please generate a link first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const exportPDF = () => {
    // Simulate PDF generation
    toast({
      title: "Exporting PDF",
      description: "Generating This Month's Results report...",
    });

    setTimeout(() => {
      // Create a mock PDF download
      const blob = new Blob(['Mock PDF content for This Month\'s Results'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `novora-monthly-results-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Exported",
        description: "This Month's Results report has been downloaded successfully!",
      });
    }, 2000);
  };

  const exportCSV = () => {
    // Simulate CSV generation
    toast({
      title: "Exporting CSV",
      description: "Generating Trend Report...",
    });

    setTimeout(() => {
      // Create a mock CSV download
      const csvContent = `Date,Team,Engagement Score,Response Rate,Alerts
2024-01-01,Engineering,4.2,85%,2
2024-01-01,Sales,3.8,72%,1
2024-01-01,Marketing,4.5,91%,0
2024-01-01,HR,4.1,88%,1`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `novora-trend-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "CSV Exported",
        description: "Trend Report has been downloaded successfully!",
      });
    }, 1500);
  };

  const openBuilder = () => {
    toast({
      title: "Opening Report Builder",
      description: "Redirecting to custom report builder...",
    });

    // Simulate opening the builder (could navigate to a new page)
    setTimeout(() => {
      toast({
        title: "Report Builder",
        description: "Custom report builder is now available. Select your metrics and timeframe.",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Export insights or share comprehensive reports with leadership and stakeholders
          </p>
        </div>

        {/* Enhanced Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">This Month's Results (PDF)</CardTitle>
                  <CardDescription className="mt-1">Export summary report</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={exportPDF}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Trend Report (CSV)</CardTitle>
                  <CardDescription className="mt-1">Month-over-month metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={exportCSV}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Custom Report Builder</CardTitle>
                  <CardDescription className="mt-1">Select metrics and timeframe</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={openBuilder}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Builder
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Shared Links */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Link className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Shared Links</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Generate public or private links to share reports with stakeholders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input 
                value={shareLink} 
                readOnly 
                placeholder="No link generated yet" 
                className="h-12"
              />
              <Button 
                onClick={generateLink} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link className="w-4 h-4 mr-2" />
                Generate Link
              </Button>
              {shareLink && (
                <Button 
                  onClick={copyToClipboard}
                  variant="outline"
                  className="hover:bg-green-50 hover:border-green-200"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
            {shareLink && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-700 text-sm font-medium">
                    Link generated successfully! Share this link with stakeholders.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;


