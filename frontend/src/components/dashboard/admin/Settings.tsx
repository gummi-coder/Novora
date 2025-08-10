import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Settings = () => {
  const [managedTeams, setManagedTeams] = useState<Record<string, boolean>>({
    Sales: true,
    Marketing: true,
    Ops: false,
  });
  const [alertDropThreshold, setAlertDropThreshold] = useState<number>(20);
  const [allowOpenComments, setAllowOpenComments] = useState<boolean>(true);

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
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
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
                    onChange={(e) => setManagedTeams((prev) => ({ ...prev, [team]: e.target.checked }))}
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
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
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
                onChange={(e) => setAlertDropThreshold(Number(e.target.value || 0))} 
                className="w-32 h-12" 
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
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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
                onChange={(e) => setAllowOpenComments(e.target.checked)} 
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
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;


