import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  AlertTriangle, 
  FileText, 
  Save,
  CheckCircle,
  Loader2
} from "lucide-react";

const Settings = () => {
  const [managedTeams, setManagedTeams] = useState<Record<string, boolean>>({
    Sales: true,
    Marketing: true,
    Ops: false,
  });
  const [alertDropThreshold, setAlertDropThreshold] = useState<number>(20);
  const [allowOpenComments, setAllowOpenComments] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Track changes to enable/disable save button
  const handleTeamChange = (team: string, checked: boolean) => {
    setManagedTeams((prev) => ({ ...prev, [team]: checked }));
    setHasChanges(true);
  };

  const handleThresholdChange = (value: number) => {
    setAlertDropThreshold(value);
    setHasChanges(true);
  };

  const handleCommentsChange = (checked: boolean) => {
    setAllowOpenComments(checked);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      toast({
        title: "No Changes",
        description: "No changes have been made to save.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock API call to save settings
      const settingsData = {
        managedTeams,
        alertDropThreshold,
        allowOpenComments,
        lastUpdated: new Date().toISOString()
      };
      
      console.log('Saving settings:', settingsData);
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully!",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage scope, alert rules and defaults for your organization
          </p>
        </div>

        {/* Enhanced Teams Managed Card */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Teams Managed</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Select which teams you manage and have access to
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(managedTeams).map((team) => (
                <label key={team} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    checked={managedTeams[team]}
                    onChange={(e) => handleTeamChange(team, e.target.checked)}
                  />
                  <span className="font-medium text-gray-900">{team}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Alert Preferences Card */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <span>Alert Preferences</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Configure when to receive notifications about score changes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="drop" className="text-sm font-medium text-gray-700">Drop threshold (%)</Label>
              <Input 
                id="drop" 
                type="number" 
                value={alertDropThreshold} 
                onChange={(e) => handleThresholdChange(Number(e.target.value || 0))} 
                className="w-32 h-12" 
                min="0"
                max="100"
              />
              <div className="text-sm text-gray-500">
                Notify when score drops by this percentage
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Survey Defaults Card */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Survey Defaults</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Default settings that apply to new surveys
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2" 
                checked={allowOpenComments} 
                onChange={(e) => handleCommentsChange(e.target.checked)} 
              />
              <div>
                <span className="font-medium text-gray-900">Enable open comments</span>
                <p className="text-sm text-gray-500 mt-1">Allow employees to provide additional feedback</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Enhanced Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`px-8 py-3 ${
              hasChanges && !isSaving 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="mt-4 flex justify-end">
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span>You have unsaved changes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;


