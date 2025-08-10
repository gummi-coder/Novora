import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";

interface SurveyRow {
  team: string;
  nextSurvey: string;
  frequency: string;
  status: "Scheduled" | "Draft" | "Sent";
}

const statusBadge = (s: SurveyRow["status"]) => {
  switch (s) {
    case "Scheduled": return "bg-blue-100 text-blue-700";
    case "Draft": return "bg-yellow-100 text-yellow-700";
    case "Sent": return "bg-green-100 text-green-700";
  }
};

const Surveys = () => {
  const navigate = useNavigate();
  const rows = useMemo<SurveyRow[]>(
    () => [
      { team: "Sales", nextSurvey: "Aug 10", frequency: "Monthly", status: "Scheduled" },
      { team: "Marketing", nextSurvey: "Aug 15", frequency: "Monthly", status: "Draft" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Surveys</h1>
            <p className="text-gray-600">
              Manage scheduling, customization and reminders for team engagement surveys
            </p>
          </div>
          <Button 
            onClick={() => navigate('/surveys/create')} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create Survey
          </Button>
        </div>

        {/* Enhanced Surveys Table */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span>Upcoming & Past Surveys</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Team scheduling overview and survey management
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                {rows.length} survey{rows.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-sm text-gray-600 font-medium">
                    <th className="py-4 px-6">Team</th>
                    <th className="py-4 px-6">Next Survey</th>
                    <th className="py-4 px-6">Frequency</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.team} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6 font-medium text-gray-900">{r.team}</td>
                      <td className="py-4 px-6 text-gray-700">{r.nextSurvey}</td>
                      <td className="py-4 px-6 text-gray-600">{r.frequency}</td>
                      <td className="py-4 px-6">
                        <Badge className={`${statusBadge(r.status)} px-2 py-1 text-xs font-medium`}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                            Schedule
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-200">
                            Customize
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
                            Reminders
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {rows.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No surveys found</p>
                <p className="text-gray-400 text-sm mt-1">Create your first survey to get started</p>
                <div className="mt-4">
                  <Button 
                    onClick={() => navigate('/surveys/create')} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Create Survey
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Surveys;


